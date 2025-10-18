import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    serviceId: v.id("services"),
    label: v.string(),
    url: v.string(),
    pingInterval: v.optional(v.number()),
    excludeFromUptime: v.optional(v.boolean()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("serviceUrls", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("serviceUrls"),
    label: v.string(),
    url: v.string(),
    pingInterval: v.optional(v.number()),
    excludeFromUptime: v.optional(v.boolean()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { id, userId, ...updates } = args;
    // Check ownership
    const url = await ctx.db.get(id);
    if (!url || (url.userId && url.userId !== userId)) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("serviceUrls"), userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check ownership
    const url = await ctx.db.get(args.id);
    if (!url || (url.userId && url.userId !== args.userId)) {
      throw new Error("Unauthorized");
    }
    // Delete uptime checks for this URL
    const checks = await ctx.db
      .query("uptimeChecks")
      .withIndex("by_url", (q) => q.eq("serviceUrlId", args.id))
      .collect();

    for (const check of checks) {
      await ctx.db.delete(check._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const listByService = query({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("serviceUrls")
      .withIndex("by_service", (q) => q.eq("serviceId", args.serviceId))
      .collect();
  },
});
