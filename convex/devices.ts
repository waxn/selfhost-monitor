import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    console.log('devices.list called with userId:', args.userId);
    if (!args.userId) return [];
    const results = await ctx.db.query("devices").withIndex("by_user", (q) => q.eq("userId", args.userId)).collect();
    console.log('devices.list returning:', results.length, 'devices');
    return results;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("devices", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("devices"),
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { id, userId, ...updates } = args;
    // Check ownership
    const device = await ctx.db.get(id);
    if (!device || (device.userId && device.userId !== userId)) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("devices"), userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check ownership
    const device = await ctx.db.get(args.id);
    if (!device || (device.userId && device.userId !== args.userId)) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.id);
  },
});

export const updateLayout = mutation({
  args: {
    id: v.id("devices"),
    userId: v.id("users"),
    layoutX: v.optional(v.number()),
    layoutY: v.optional(v.number()),
    layoutWidth: v.optional(v.number()),
    layoutHeight: v.optional(v.number()),
    layoutOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, userId, ...layout } = args;
    // Check ownership
    const device = await ctx.db.get(id);
    if (!device || (device.userId && device.userId !== userId)) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(id, layout);
  },
});

export const batchUpdateLayout = mutation({
  args: {
    userId: v.id("users"),
    updates: v.array(v.object({
      id: v.id("devices"),
      layoutX: v.optional(v.number()),
      layoutY: v.optional(v.number()),
      layoutWidth: v.optional(v.number()),
      layoutHeight: v.optional(v.number()),
      layoutOrder: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    for (const update of args.updates) {
      const { id, ...layout } = update;
      // Check ownership
      const device = await ctx.db.get(id);
      if (!device || (device.userId && device.userId !== args.userId)) {
        continue; // Skip unauthorized items
      }
      await ctx.db.patch(id, layout);
    }
  },
});
