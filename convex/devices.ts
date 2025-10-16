import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    // If no user is logged in, return all devices (for backwards compatibility)
    if (!userId) {
      return await ctx.db.query("devices").collect();
    }

    // Return user's devices or devices without a userId (legacy data)
    const allDevices = await ctx.db.query("devices").collect();
    return allDevices.filter(d => !d.userId || d.userId === userId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    return await ctx.db.insert("devices", {
      name: args.name,
      description: args.description,
      userId: userId || undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("devices"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const device = await ctx.db.get(args.id);

    // Check authorization only if both user and device have userId
    if (userId && device?.userId && device.userId !== userId) {
      throw new Error("Not authorized");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("devices") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const device = await ctx.db.get(args.id);

    // Check authorization only if both user and device have userId
    if (userId && device?.userId && device.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.id);
  },
});
