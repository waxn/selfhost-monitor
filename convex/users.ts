import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updatePreferences = mutation({
  args: {
    userId: v.id("users"),
    backgroundColor: v.optional(v.string()),
    backgroundImage: v.optional(v.string()),
    tileOpacity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    // Verify user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(userId, updates);
  },
});

export const getPreferences = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    return {
      backgroundColor: user.backgroundColor,
      backgroundImage: user.backgroundImage,
      tileOpacity: user.tileOpacity,
    };
  },
});
