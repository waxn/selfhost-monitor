import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    serviceId: v.id("services"),
    label: v.string(),
    url: v.string(),
    pingInterval: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("serviceUrls", {
      serviceId: args.serviceId,
      label: args.label,
      url: args.url,
      pingInterval: args.pingInterval,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("serviceUrls"),
    label: v.string(),
    url: v.string(),
    pingInterval: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("serviceUrls") },
  handler: async (ctx, args) => {
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
