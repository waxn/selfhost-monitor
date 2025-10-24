import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { decrypt } from "./encryption";

// Get encryption key - must be set in Convex dashboard as ENCRYPTION_KEY
// For now, we'll pass undefined and handle gracefully (store unencrypted)
const getEncryptionKey = () => undefined as string | undefined;

export const checkUrl = internalAction({
  args: { urlId: v.id("serviceUrls") },
  handler: async (ctx, args) => {
    const url = await ctx.runQuery(internal.uptime.getUrl, { id: args.urlId });
    if (!url) return;

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

    await ctx.runMutation(internal.uptime.recordCheck, {
      serviceUrlId: args.urlId,
      timestamp: Date.now(),
      isUp,
      responseTime,
      statusCode,
      error,
      userId: url.userId,
    });
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
    if (!args.userId) {
      throw new Error("userId is required for uptime checks");
    }
    await ctx.db.insert("uptimeChecks", args as any);
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
    timeRange: v.union(v.literal("24h"), v.literal("7d"), v.literal("30d")),
  },
  handler: async (ctx, args) => {
    // Check ownership of the URL
    const url = await ctx.db.get(args.serviceUrlId);
    if (!url || url.userId !== args.userId) {
      throw new Error("Unauthorized");
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

    // Get all checks within the time range
    const allChecks = await ctx.db
      .query("uptimeChecks")
      .withIndex("by_url", (q) => q.eq("serviceUrlId", args.serviceUrlId))
      .order("desc")
      .collect();

    // Filter by timestamp and return
    return allChecks.filter((check) => check.timestamp >= cutoffTime);
  },
});
