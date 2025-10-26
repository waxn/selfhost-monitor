import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { decrypt } from "./encryption";
import type { Id } from "./_generated/dataModel";

// Get encryption key from environment variables
const getEncryptionKey = () => process.env.ENCRYPTION_KEY;

export const checkUrl = internalAction({
  args: { urlId: v.id("serviceUrls") },
  handler: async (ctx, args) => {
    const url = await ctx.runQuery(internal.uptime.getUrl, { id: args.urlId });
    if (!url) return;

    // Get the last check to detect status changes
    const lastCheck = await ctx.runQuery(internal.uptime.getLastCheck, { urlId: args.urlId });

    // Decrypt the URL before making the request
    const decryptedUrl = (await decrypt(url.url, getEncryptionKey())) || url.url;

    const startTime = Date.now();
    let isUp = false;
    let responseTime: number | undefined;
    let statusCode: number | undefined;
    let error: string | undefined;

    try {
      // Try GET request first for better compatibility with Cloudflare tunnels and reverse proxies
      const response = await fetch(decryptedUrl, {
        method: "GET",
        signal: AbortSignal.timeout(10000), // 10 second timeout
        headers: {
          "User-Agent": "ServiceMonitor/1.0",
        },
        redirect: "follow", // Follow redirects
      });

      isUp = response.ok;
      responseTime = Date.now() - startTime;
      statusCode = response.status;
    } catch (e) {
      isUp = false;
      responseTime = Date.now() - startTime;
      error = e instanceof Error ? e.message : String(e);
    }

    const timestamp = Date.now();

    // Record the check
    await ctx.runMutation(internal.uptime.recordCheck, {
      serviceUrlId: args.urlId,
      timestamp,
      isUp,
      responseTime,
      statusCode,
      error,
      userId: url.userId,
    });

    // Check if we should send email alerts (only if URL has userId configured)
    if (url.emailAlertsEnabled && url.userId) {
      try {
        const statusChanged = lastCheck ? lastCheck.isUp !== isUp : false;
        const shouldAlert = await ctx.runQuery(internal.uptime.shouldSendAlert, {
          urlId: args.urlId,
          statusChanged,
          isUp,
          notifyOnDown: url.notifyOnDown ?? true,
          notifyOnRecovery: url.notifyOnRecovery ?? true,
        });

        if (shouldAlert) {
          // Get user and service info for the email
          const user = await ctx.runQuery(internal.uptime.getUserForAlert, { userId: url.userId });
          const service = await ctx.runQuery(internal.uptime.getServiceForUrl, { urlId: args.urlId });

          if (user && user.notificationEmail && user.emailNotificationsEnabled && service) {
            // Send appropriate alert
            if (!isUp && (url.notifyOnDown ?? true)) {
              await ctx.runAction(internal.emails.sendDownAlert, {
                recipientEmail: user.notificationEmail,
                recipientName: user.name,
                serviceName: service.name,
                urlLabel: url.label,
                errorMessage: error,
                statusCode,
                timestamp,
              });
            } else if (isUp && lastCheck && !lastCheck.isUp && (url.notifyOnRecovery ?? true)) {
              // Calculate downtime duration
              const downtimeDuration = lastCheck ? timestamp - lastCheck.timestamp : undefined;

              await ctx.runAction(internal.emails.sendRecoveryAlert, {
                recipientEmail: user.notificationEmail,
                recipientName: user.name,
                serviceName: service.name,
                urlLabel: url.label,
                responseTime,
                statusCode,
                timestamp,
                downtimeDuration,
              });
            }

            // Update last alert timestamp
            await ctx.runMutation(internal.uptime.updateLastAlertTimestamp, {
              urlId: args.urlId,
              timestamp,
            });
          }
        }
      } catch (emailError) {
        // Don't fail uptime check if email fails - just log it
        console.error("Email alert failed (continuing uptime check):", emailError);
      }
    }
  },
});

export const checkAllUrls = internalAction({
  handler: async (ctx) => {
    const urls = await ctx.runQuery(internal.uptime.getAllUrls);
    const now = Date.now();

    // Filter URLs that need to be checked based on their interval
    const urlsToCheck = [];
    for (const url of urls) {
      // Skip if excluded from uptime monitoring
      if (url.excludeFromUptime) continue;

      // Skip if no userId (orphaned URLs from migration)
      if (!url.userId) {
        console.warn(`Skipping URL ${url._id} (${url.label}) - no userId`);
        continue;
      }

      const lastCheck = await ctx.runQuery(internal.uptime.getLastCheck, { urlId: url._id });
      const interval = (url.pingInterval ?? 5) * 60 * 1000; // convert minutes to ms

      if (!lastCheck || (now - lastCheck.timestamp) >= interval) {
        urlsToCheck.push(url);
      }
    }

    // Check URLs that are due in parallel
    await Promise.all(
      urlsToCheck.map((url: { _id: any }) =>
        ctx.runAction(internal.uptime.checkUrl, { urlId: url._id })
      )
    );
  },
});

export const getUrl = internalQuery({
  args: { id: v.id("serviceUrls") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getAllUrls = internalQuery({
  handler: async (ctx) => {
    return await ctx.db.query("serviceUrls").collect();
  },
});

export const getLastCheck = internalQuery({
  args: { urlId: v.id("serviceUrls") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("uptimeChecks")
      .withIndex("by_url", (q) => q.eq("serviceUrlId", args.urlId))
      .order("desc")
      .first();
  },
});

export const recordCheck = internalMutation({
  args: {
    serviceUrlId: v.id("serviceUrls"),
    timestamp: v.number(),
    isUp: v.boolean(),
    responseTime: v.optional(v.number()),
    statusCode: v.optional(v.number()),
    error: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // If userId is missing, try to get it from the serviceUrl
    let userId = args.userId;
    if (!userId) {
      const serviceUrl = await ctx.db.get(args.serviceUrlId);
      if (serviceUrl && serviceUrl.userId) {
        userId = serviceUrl.userId;
      }
    }

    await ctx.db.insert("uptimeChecks", {
      ...args,
      userId: userId,
    } as any);
  },
});

export const getRecentChecks = query({
  args: {
    serviceUrlId: v.id("serviceUrls"),
    limit: v.optional(v.number()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check ownership of the URL
    const url = await ctx.db.get(args.serviceUrlId);
    if (!url || url.userId !== args.userId) {
      throw new Error("Unauthorized");
    }
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("uptimeChecks")
      .withIndex("by_url", (q) => q.eq("serviceUrlId", args.serviceUrlId))
      .order("desc")
      .take(limit);
  },
});

export const getHistoricalChecks = query({
  args: {
    serviceUrlId: v.id("serviceUrls"),
    userId: v.id("users"),
    timeRange: v.union(v.literal("24h"), v.literal("7d"), v.literal("30d"), v.literal("all")),
  },
  handler: async (ctx, args) => {
    // Check ownership of the URL
    const url = await ctx.db.get(args.serviceUrlId);
    if (!url || url.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    // Get all checks
    const allChecks = await ctx.db
      .query("uptimeChecks")
      .withIndex("by_url", (q) => q.eq("serviceUrlId", args.serviceUrlId))
      .order("desc")
      .collect();

    // If "all" time range, return all checks
    if (args.timeRange === "all") {
      return allChecks;
    }

    // Calculate timestamp cutoff based on time range
    const now = Date.now();
    let cutoffTime: number;
    switch (args.timeRange) {
      case "24h":
        cutoffTime = now - 24 * 60 * 60 * 1000;
        break;
      case "7d":
        cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "30d":
        cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
    }

    // Filter by timestamp and return
    return allChecks.filter((check) => check.timestamp >= cutoffTime);
  },
});

// Helper function to determine if an alert should be sent
export const shouldSendAlert = internalQuery({
  args: {
    urlId: v.id("serviceUrls"),
    statusChanged: v.boolean(),
    isUp: v.boolean(),
    notifyOnDown: v.boolean(),
    notifyOnRecovery: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Only send alerts if status changed
    if (!args.statusChanged) return false;

    // Check notification preferences
    if (!args.isUp && !args.notifyOnDown) return false;
    if (args.isUp && !args.notifyOnRecovery) return false;

    // Check rate limiting (15 minutes cooldown between alerts)
    const url = await ctx.db.get(args.urlId);
    if (!url) return false;

    const cooldownPeriod = 15 * 60 * 1000; // 15 minutes
    if (url.lastAlertTimestamp) {
      const timeSinceLastAlert = Date.now() - url.lastAlertTimestamp;
      if (timeSinceLastAlert < cooldownPeriod) {
        return false;
      }
    }

    return true;
  },
});

// Get user info for alerts
export const getUserForAlert = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get service info for alerts
export const getServiceForUrl = internalQuery({
  args: { urlId: v.id("serviceUrls") },
  handler: async (ctx, args) => {
    const url = await ctx.db.get(args.urlId);
    if (!url) return null;

    return await ctx.db.get(url.serviceId);
  },
});

// Update last alert timestamp
export const updateLastAlertTimestamp = internalMutation({
  args: {
    urlId: v.id("serviceUrls"),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.urlId, {
      lastAlertTimestamp: args.timestamp,
    });
  },
});
