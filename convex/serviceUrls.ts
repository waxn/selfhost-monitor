import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { encrypt, decrypt } from "./encryption";

// Get encryption key from environment variables
const getEncryptionKey = () => process.env.ENCRYPTION_KEY;

export const create = mutation({
  args: {
    serviceId: v.id("services"),
    label: v.string(),
    url: v.string(),
    pingInterval: v.optional(v.number()),
    excludeFromUptime: v.optional(v.boolean()),
    emailAlertsEnabled: v.optional(v.boolean()),
    notifyOnDown: v.optional(v.boolean()),
    notifyOnRecovery: v.optional(v.boolean()),
    // Advanced alert settings
    minDowntimeDuration: v.optional(v.number()),
    consecutiveFailures: v.optional(v.number()),
    alertCooldown: v.optional(v.number()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Encrypt the URL before storing
    const encryptedUrl = await encrypt(args.url, getEncryptionKey());
    return await ctx.db.insert("serviceUrls", {
      ...args,
      url: encryptedUrl || args.url, // Fallback to original if encryption fails
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("serviceUrls"),
    label: v.string(),
    url: v.string(),
    pingInterval: v.optional(v.number()),
    excludeFromUptime: v.optional(v.boolean()),
    emailAlertsEnabled: v.optional(v.boolean()),
    notifyOnDown: v.optional(v.boolean()),
    notifyOnRecovery: v.optional(v.boolean()),
    // Advanced alert settings
    minDowntimeDuration: v.optional(v.number()),
    consecutiveFailures: v.optional(v.number()),
    alertCooldown: v.optional(v.number()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { id, userId, ...updates } = args;
    // Check ownership
    const url = await ctx.db.get(id);
    if (!url || (url.userId && url.userId !== userId)) {
      throw new Error("Unauthorized");
    }
    // Encrypt the URL before storing
    const encryptedUrl = await encrypt(updates.url, getEncryptionKey());
    await ctx.db.patch(id, {
      ...updates,
      url: encryptedUrl || updates.url, // Fallback to original if encryption fails
    });
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
    const urls = await ctx.db
      .query("serviceUrls")
      .withIndex("by_service", (q: any) => q.eq("serviceId", args.serviceId))
      .collect();

    // Decrypt URLs before returning
    return await Promise.all(
      urls.map(async (urlDoc) => ({
        ...urlDoc,
        url: (await decrypt(urlDoc.url, getEncryptionKey())) || urlDoc.url, // Fallback to encrypted if decryption fails
      }))
    );
  },
});
