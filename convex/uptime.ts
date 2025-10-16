import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const checkUrl = internalAction({
  args: { urlId: v.id("serviceUrls") },
  handler: async (ctx, args) => {
    const url = await ctx.runQuery(internal.uptime.getUrl, { id: args.urlId });
    if (!url) return;

    const startTime = Date.now();
    let isUp = false;
    let responseTime: number | undefined;
    let statusCode: number | undefined;
    let error: string | undefined;

    try {
      const response = await fetch(url.url, {
        method: "HEAD",
        signal: AbortSignal.timeout(10000), // 10 second timeout
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
    });
  },
});

export const checkAllUrls = internalAction({
  handler: async (ctx) => {
    const urls = await ctx.runQuery(internal.uptime.getAllUrls);

    // Check all URLs in parallel
    await Promise.all(
      urls.map((url: { _id: any }) =>
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

export const recordCheck = internalMutation({
  args: {
    serviceUrlId: v.id("serviceUrls"),
    timestamp: v.number(),
    isUp: v.boolean(),
    responseTime: v.optional(v.number()),
    statusCode: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("uptimeChecks", args);
  },
});

export const getRecentChecks = query({
  args: {
    serviceUrlId: v.id("serviceUrls"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("uptimeChecks")
      .withIndex("by_url", (q) => q.eq("serviceUrlId", args.serviceUrlId))
      .order("desc")
      .take(limit);
  },
});
