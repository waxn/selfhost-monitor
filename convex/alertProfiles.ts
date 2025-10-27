import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List all alert profiles for a user
export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("alertProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get a single alert profile
export const get = query({
  args: { id: v.id("alertProfiles"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.id);
    if (!profile || profile.userId !== args.userId) {
      throw new Error("Unauthorized");
    }
    return profile;
  },
});

// Create a new alert profile
export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    minDowntime: v.number(),
    consecutiveFailures: v.number(),
    alertCooldown: v.number(),
    downAlertSubject: v.optional(v.string()),
    downAlertBody: v.optional(v.string()),
    recoveryAlertSubject: v.optional(v.string()),
    recoveryAlertBody: v.optional(v.string()),
    alertOnSlowResponse: v.optional(v.boolean()),
    slowResponseThreshold: v.optional(v.number()),
    alertOnStatusCodes: v.optional(v.array(v.number())),
    ignoreStatusCodes: v.optional(v.array(v.number())),
    notifyOnDown: v.boolean(),
    notifyOnRecovery: v.boolean(),
    additionalEmails: v.optional(v.array(v.string())),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("alertProfiles", args);
  },
});

// Update an alert profile
export const update = mutation({
  args: {
    id: v.id("alertProfiles"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    minDowntime: v.optional(v.number()),
    consecutiveFailures: v.optional(v.number()),
    alertCooldown: v.optional(v.number()),
    downAlertSubject: v.optional(v.string()),
    downAlertBody: v.optional(v.string()),
    recoveryAlertSubject: v.optional(v.string()),
    recoveryAlertBody: v.optional(v.string()),
    alertOnSlowResponse: v.optional(v.boolean()),
    slowResponseThreshold: v.optional(v.number()),
    alertOnStatusCodes: v.optional(v.array(v.number())),
    ignoreStatusCodes: v.optional(v.array(v.number())),
    notifyOnDown: v.optional(v.boolean()),
    notifyOnRecovery: v.optional(v.boolean()),
    additionalEmails: v.optional(v.array(v.string())),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical"))),
  },
  handler: async (ctx, args) => {
    const { id, userId, ...updates } = args;
    const profile = await ctx.db.get(id);
    if (!profile || profile.userId !== userId) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(id, updates);
  },
});

// Delete an alert profile
export const remove = mutation({
  args: { id: v.id("alertProfiles"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.id);
    if (!profile || profile.userId !== args.userId) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.id);
  },
});

// Duplicate a profile
export const duplicate = mutation({
  args: { id: v.id("alertProfiles"), userId: v.id("users"), newName: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.id);
    if (!profile || profile.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    const { _id, _creationTime, name, ...profileData } = profile;
    return await ctx.db.insert("alertProfiles", {
      ...profileData,
      name: args.newName,
    });
  },
});
