import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { decrypt } from "./encryption";
import type { Id } from "./_generated/dataModel";

// Get encryption key from environment variables
const getEncryptionKey = () => process.env.ENCRYPTION_KEY;

export const checkUrl = internalAction({
  args: {
    urlId: v.id("serviceUrls"),
    // Optional: pass url data to avoid re-querying
    urlData: v.optional(v.any()),
    lastCheckData: v.optional(v.any()),
    userData: v.optional(v.any()),
    serviceData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Use passed data if available, otherwise query
    const url = args.urlData ?? await ctx.runQuery(internal.uptime.getUrl, { id: args.urlId });
    if (!url) return;

    const timestamp = Date.now();

    // Update lastCheckTimestamp immediately to prevent duplicate checks
    await ctx.runMutation(internal.uptime.updateLastCheckTimestamp, {
      urlId: args.urlId,
      timestamp,
    });

    // Get the last check to detect status changes (use passed data if available)
    const lastCheck = args.lastCheckData ?? await ctx.runQuery(internal.uptime.getLastCheck, { urlId: args.urlId });

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

    // Determine if we should save this check to the database
    const statusChanged = lastCheck ? lastCheck.isUp !== isUp : false; // Only save on actual status change
    const saveInterval = (url.saveInterval ?? 10) * 60 * 1000; // convert minutes to ms, default 10 min

    // For lastSaveTimestamp, use lastCheck timestamp as fallback if not set
    // This prevents saving every check for existing URLs
    const lastSave = url.lastSaveTimestamp ?? (lastCheck?.timestamp ?? 0);
    const timeSinceLastSave = timestamp - lastSave;
    const intervalReached = timeSinceLastSave >= saveInterval;
    const shouldSave = statusChanged || intervalReached;

    // Only record the check if status changed or save interval reached
    if (shouldSave) {
      await ctx.runMutation(internal.uptime.recordCheck, {
        serviceUrlId: args.urlId,
        timestamp,
        isUp,
        responseTime,
        statusCode,
        error,
        userId: url.userId,
      });

      // Update last save timestamp
      await ctx.runMutation(internal.uptime.updateLastSaveTimestamp, {
        urlId: args.urlId,
        timestamp,
      });
    }

    // Check if we should send email alerts (only if URL has userId configured)

    if (url.emailAlertsEnabled && url.userId) {
      try {
        const statusChanged = lastCheck ? lastCheck.isUp !== isUp : false;

        // Track consecutive failures and downtime duration
        let currentFailureCount = url.currentFailureCount ?? 0;
        let firstFailureTime = url.firstFailureTimestamp ?? timestamp;

        if (!isUp) {
          // Service is down
          if (!lastCheck || lastCheck.isUp) {
            // First failure - start tracking
            currentFailureCount = 1;
            firstFailureTime = timestamp;
          } else {
            // Consecutive failure - increment counter
            currentFailureCount++;
          }

          // Update failure tracking in database
          await ctx.runMutation(internal.uptime.updateFailureTracking, {
            urlId: args.urlId,
            currentFailureCount,
            firstFailureTimestamp: firstFailureTime,
          });
        } else if (lastCheck && !lastCheck.isUp) {
          // Service recovered - reset failure tracking
          await ctx.runMutation(internal.uptime.resetFailureTracking, {
            urlId: args.urlId,
          });
        }

        // Check advanced alert conditions
        const cooldownPeriod = (url.alertCooldown ?? 15) * 60 * 1000; // Default 15 minutes
        const minDowntime = (url.minDowntimeDuration ?? 0) * 1000; // Convert seconds to ms
        const requiredFailures = url.consecutiveFailures ?? 1; // Default 1 failure

        const downtimeDuration = firstFailureTime ? timestamp - firstFailureTime : 0;
        const meetsDowntimeThreshold = downtimeDuration >= minDowntime;
        const meetsFailureThreshold = currentFailureCount >= requiredFailures;
        const cooldownExpired = !url.lastAlertTimestamp || (timestamp - url.lastAlertTimestamp >= cooldownPeriod);

        // Determine if we should send an alert
        let shouldAlert = false;
        if (!isUp && (url.notifyOnDown ?? true)) {
          // Down alert: check all conditions
          shouldAlert = statusChanged && meetsDowntimeThreshold && meetsFailureThreshold && cooldownExpired;
        } else if (isUp && lastCheck && !lastCheck.isUp && (url.notifyOnRecovery ?? true)) {
          // Recovery alert: only check cooldown
          shouldAlert = cooldownExpired;
        }

        if (shouldAlert) {
          // Use passed data if available, otherwise query
          const user = args.userData ?? await ctx.runQuery(internal.uptime.getUserForAlert, { userId: url.userId });
          const service = args.serviceData ?? await ctx.runQuery(internal.uptime.getServiceForUrl, { urlId: args.urlId });

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
                userId: url.userId,
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
                userId: url.userId,
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
        // Don't fail uptime check if email fails - just log error
        console.error("Email alert failed:", emailError);
      }
    }
  },
});

export const checkAllUrls = internalAction({
  handler: async (ctx) => {
    // First, get just the URLs (lightweight)
    const allUrls = await ctx.runQuery(internal.uptime.getAllUrls);
    const now = Date.now();

    // Determine which URLs need checking based on lastCheckTimestamp stored on the URL
    const urlsNeedingCheck = allUrls.filter((url: any) => {
      // Skip if excluded from uptime monitoring
      if (url.excludeFromUptime) return false;

      // Skip if no userId (orphaned URLs from migration)
      if (!url.userId) return false;

      // Check if enough time has passed since last check based on pingInterval
      const pingInterval = (url.pingInterval ?? 30) * 1000; // Convert seconds to ms, default 30s
      const lastCheckTime = url.lastCheckTimestamp ?? 0;

      const timeSinceLastCheck = now - lastCheckTime;
      return timeSinceLastCheck >= pingInterval;
    });

    // If no URLs need checking, return early
    if (urlsNeedingCheck.length === 0) {
      return;
    }

    // Only fetch lastChecks and related data for URLs that need checking
    const urlIdsToCheck = urlsNeedingCheck.map((u: any) => u._id);
    const allData = await ctx.runQuery(internal.uptime.getAllUrlsWithData, {
      urlIdsToCheck
    });

    // Check all active URLs in parallel, passing pre-fetched data to avoid redundant queries
    await Promise.all(
      urlsNeedingCheck.map((url: any) =>
        ctx.runAction(internal.uptime.checkUrl, {
          urlId: url._id,
          urlData: url,
          lastCheckData: allData.lastChecks[url._id],
          userData: url.userId ? allData.users[url.userId] : undefined,
          serviceData: url.serviceId ? allData.services[url.serviceId] : undefined,
        })
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

// Optimized: Fetch all URLs with related data - only fetch last checks for URLs that need checking
export const getAllUrlsWithData = internalQuery({
  args: {
    urlIdsToCheck: v.optional(v.array(v.id("serviceUrls"))), // Only fetch checks for these URLs
  },
  handler: async (ctx, args) => {
    // Get all URLs
    const urls = await ctx.db.query("serviceUrls").collect();

    // Only get last checks for URLs that need checking (to reduce queries)
    const lastChecks: Record<string, any> = {};
    if (args.urlIdsToCheck && args.urlIdsToCheck.length > 0) {
      for (const urlId of args.urlIdsToCheck) {
        const lastCheck = await ctx.db
          .query("uptimeChecks")
          .withIndex("by_url", (q) => q.eq("serviceUrlId", urlId))
          .order("desc")
          .first();
        if (lastCheck) {
          lastChecks[urlId] = lastCheck;
        }
      }
    }

    // Get unique user IDs and service IDs (only for URLs being checked)
    const urlsToCheck = args.urlIdsToCheck
      ? urls.filter(u => args.urlIdsToCheck!.includes(u._id))
      : urls;

    const userIds = new Set(urlsToCheck.map(u => u.userId).filter(Boolean));
    const serviceIds = new Set(urlsToCheck.map(u => u.serviceId).filter(Boolean));

    // Batch fetch users
    const users: Record<string, any> = {};
    for (const userId of userIds) {
      if (userId) {
        const user = await ctx.db.get(userId);
        if (user) users[userId] = user;
      }
    }

    // Batch fetch services
    const services: Record<string, any> = {};
    for (const serviceId of serviceIds) {
      if (serviceId) {
        const service = await ctx.db.get(serviceId);
        if (service) services[serviceId] = service;
      }
    }

    return {
      urls,
      lastChecks,
      users,
      services,
    };
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

// Update last save timestamp
export const updateLastSaveTimestamp = internalMutation({
  args: {
    urlId: v.id("serviceUrls"),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.urlId, {
      lastSaveTimestamp: args.timestamp,
    });
  },
});

export const updateLastCheckTimestamp = internalMutation({
  args: {
    urlId: v.id("serviceUrls"),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.urlId, {
      lastCheckTimestamp: args.timestamp,
    });
  },
});

// Update failure tracking
export const updateFailureTracking = internalMutation({
  args: {
    urlId: v.id("serviceUrls"),
    currentFailureCount: v.number(),
    firstFailureTimestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.urlId, {
      currentFailureCount: args.currentFailureCount,
      firstFailureTimestamp: args.firstFailureTimestamp,
    });
  },
});

// Reset failure tracking (on recovery)
export const resetFailureTracking = internalMutation({
  args: {
    urlId: v.id("serviceUrls"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.urlId, {
      currentFailureCount: 0,
      firstFailureTimestamp: undefined,
    });
  },
});
