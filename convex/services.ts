import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { encrypt, decrypt } from "./encryption";

// Get encryption key from environment variables
const getEncryptionKey = () => process.env.ENCRYPTION_KEY;

export const get = query({
  args: { id: v.id("services"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.id);
    if (!service || (service.userId && service.userId !== args.userId)) {
      throw new Error("Unauthorized");
    }
    // Decrypt notes
    let decryptedNotes = null;
    try {
      decryptedNotes = service.notes ? await decrypt(service.notes, getEncryptionKey()) : null;
    } catch (error) {
      console.error(`Error decrypting notes:`, error);
    }
    return {
      ...service,
      notes: decryptedNotes,
    };
  },
});

export const list = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    try {
      if (!args.userId) return [];
      const services = await ctx.db.query("services").withIndex("by_user", (q: any) => q.eq("userId", args.userId)).collect();

      // Populate device and urls for each service
      return await Promise.all(services.map(async (service) => {
        try {
          const device = service.deviceId ? await ctx.db.get(service.deviceId) : null;
          const urls = await ctx.db
            .query("serviceUrls")
            .withIndex("by_service", (q: any) => q.eq("serviceId", service._id))
            .collect();

          // Get latest uptime check for each URL
          const urlsWithStatus = await Promise.all(urls.map(async (url) => {
            try {
              // Decrypt URL
              const decryptedUrl = (await decrypt(url.url, getEncryptionKey())) || url.url;

              // If excluded from uptime, return null for all status fields
              if (url.excludeFromUptime) {
                return {
                  _id: url._id,
                  label: url.label,
                  url: decryptedUrl,
                  isUp: null,
                  lastCheck: null,
                  responseTime: null,
                  excludeFromUptime: true,
                };
              }

              const latestCheck = await ctx.db
                .query("uptimeChecks")
                .withIndex("by_url", (q: any) => q.eq("serviceUrlId", url._id))
                .order("desc")
                .first();

              return {
                _id: url._id,
                label: url.label,
                url: decryptedUrl,
                isUp: latestCheck?.isUp ?? null,
                lastCheck: latestCheck?.timestamp ?? null,
                responseTime: latestCheck?.responseTime ?? null,
                excludeFromUptime: false,
              };
            } catch (urlError) {
              console.error(`Error processing URL ${url._id}:`, urlError);
              // Return URL with error state
              return {
                _id: url._id,
                label: url.label,
                url: url.url,
                isUp: null,
                lastCheck: null,
                responseTime: null,
                excludeFromUptime: false,
              };
            }
          }));

          // Decrypt notes
          let decryptedNotes = null;
          try {
            decryptedNotes = service.notes ? await decrypt(service.notes, getEncryptionKey()) : null;
          } catch (notesError) {
            console.error(`Error decrypting notes for service ${service._id}:`, notesError);
            // Leave notes as null on error
          }

          return {
            ...service,
            notes: decryptedNotes,
            device: device ? { name: device.name } : null,
            urls: urlsWithStatus,
          };
        } catch (serviceError) {
          console.error(`Error processing service ${service._id}:`, serviceError);
          // Return service with minimal data
          return {
            ...service,
            notes: null,
            device: null,
            urls: [],
          };
        }
      }));
    } catch (error) {
      console.error("Error in services.list:", error);
      return [];
    }
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    notes: v.optional(v.string()),
    deviceId: v.optional(v.id("devices")),
    iconUrl: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Encrypt notes before storing
    const encryptedNotes = args.notes ? (await encrypt(args.notes, getEncryptionKey())) || undefined : undefined;
    return await ctx.db.insert("services", {
      ...args,
      notes: encryptedNotes,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.string(),
    notes: v.optional(v.string()),
    deviceId: v.optional(v.id("devices")),
    iconUrl: v.optional(v.string()),
    userId: v.id("users"),
    // Alert customization
    useCustomAlerts: v.optional(v.boolean()),
    customDownAlertSubject: v.optional(v.string()),
    customDownAlertBody: v.optional(v.string()),
    customRecoveryAlertSubject: v.optional(v.string()),
    customRecoveryAlertBody: v.optional(v.string()),
    alertPriority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical"))),
    alertTags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, userId, ...updates } = args;
    // Check ownership
    const service = await ctx.db.get(id);
    if (!service || (service.userId && service.userId !== userId)) {
      throw new Error("Unauthorized");
    }
    // Encrypt notes before updating
    const encryptedNotes = updates.notes ? (await encrypt(updates.notes, getEncryptionKey())) || undefined : undefined;
    await ctx.db.patch(id, {
      ...updates,
      notes: encryptedNotes,
    });
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

export const updateLayout = mutation({
  args: {
    id: v.id("services"),
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
    const service = await ctx.db.get(id);
    if (!service || (service.userId && service.userId !== userId)) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(id, layout);
  },
});

export const batchUpdateLayout = mutation({
  args: {
    userId: v.id("users"),
    updates: v.array(v.object({
      id: v.id("services"),
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
      const service = await ctx.db.get(id);
      if (!service || (service.userId && service.userId !== args.userId)) {
        continue; // Skip unauthorized items
      }
      await ctx.db.patch(id, layout);
    }
  },
});
