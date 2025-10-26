import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updatePreferences = mutation({
  args: {
    userId: v.id("users"),
    backgroundColor: v.optional(v.string()),
    backgroundImage: v.optional(v.union(v.string(), v.null())),
    tileOpacity: v.optional(v.number()),
    notificationEmail: v.optional(v.string()),
    emailNotificationsEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, backgroundColor, backgroundImage, tileOpacity, notificationEmail, emailNotificationsEnabled } = args;

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

    if (notificationEmail !== undefined) {
      patchData.notificationEmail = notificationEmail;
    }

    if (emailNotificationsEnabled !== undefined) {
      patchData.emailNotificationsEnabled = emailNotificationsEnabled;
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
      notificationEmail: user.notificationEmail,
      emailNotificationsEnabled: user.emailNotificationsEnabled,
    };
  },
});
