import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updatePreferences = mutation({
  args: {
    userId: v.id("users"),
    backgroundColor: v.optional(v.string()),
    backgroundImage: v.optional(v.union(v.string(), v.null())),
    tileOpacity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, backgroundColor, backgroundImage, tileOpacity } = args;

    // Verify user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Build the update object
    const patchData: any = {};

    if (backgroundColor !== undefined) {
      patchData.backgroundColor = backgroundColor;
    }

    // backgroundImage can be set to null to clear it
    if (backgroundImage !== undefined) {
      patchData.backgroundImage = backgroundImage;
    }

    if (tileOpacity !== undefined) {
      patchData.tileOpacity = tileOpacity;
    }

    await ctx.db.patch(userId, patchData);
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
