import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    const services = await ctx.db.query("services").withIndex("by_user", (q) => q.eq("userId", args.userId)).collect();

    // Populate device and urls for each service
    return await Promise.all(services.map(async (service) => {
      const device = service.deviceId ? await ctx.db.get(service.deviceId) : null;
      const urls = await ctx.db
        .query("serviceUrls")
        .withIndex("by_service", (q) => q.eq("serviceId", service._id))
        .collect();

      // Get latest uptime check for each URL
      const urlsWithStatus = await Promise.all(urls.map(async (url) => {
        // If excluded from uptime, return null for all status fields
        if (url.excludeFromUptime) {
          return {
            _id: url._id,
            label: url.label,
            url: url.url,
            isUp: null,
            lastCheck: null,
            responseTime: null,
            excludeFromUptime: true,
          };
        }

        const latestCheck = await ctx.db
          .query("uptimeChecks")
          .withIndex("by_url", (q) => q.eq("serviceUrlId", url._id))
          .order("desc")
          .first();

        return {
          _id: url._id,
          label: url.label,
          url: url.url,
          isUp: latestCheck?.isUp ?? null,
          lastCheck: latestCheck?.timestamp ?? null,
          responseTime: latestCheck?.responseTime ?? null,
          excludeFromUptime: false,
        };
      }));

      return {
        ...service,
        device: device ? { name: device.name } : null,
        urls: urlsWithStatus,
      };
    }));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    notes: v.optional(v.string()),
    deviceId: v.id("devices"),
    iconUrl: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("services", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.string(),
    notes: v.optional(v.string()),
    deviceId: v.id("devices"),
    iconUrl: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { id, userId, ...updates } = args;
    // Check ownership
    const service = await ctx.db.get(id);
    if (!service || (service.userId && service.userId !== userId)) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("services"), userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check ownership
    const service = await ctx.db.get(args.id);
    if (!service || (service.userId && service.userId !== args.userId)) {
      throw new Error("Unauthorized");
    }
    const urls = await ctx.db
      .query("serviceUrls")
      .withIndex("by_service", (q) => q.eq("serviceId", args.id))
      .collect();

    for (const url of urls) {
      const checks = await ctx.db
        .query("uptimeChecks")
        .withIndex("by_url", (q) => q.eq("serviceUrlId", url._id))
        .collect();

      for (const check of checks) {
        await ctx.db.delete(check._id);
      }

      await ctx.db.delete(url._id);
    }

    await ctx.db.delete(args.id);
  },
});
