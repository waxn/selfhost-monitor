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

// Lightweight version - just returns service metadata without all the uptime data
export const list = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    try {
      if (!args.userId) return [];
      const services = await ctx.db.query("services").withIndex("by_user", (q: any) => q.eq("userId", args.userId)).collect();

      // Just return basic service info - let other queries fetch URLs/uptime when needed
      return await Promise.all(services.map(async (service) => {
        try {
          const device = service.deviceId ? await ctx.db.get(service.deviceId) : null;

          // Get URL count only, not full URL data
          const urls = await ctx.db
            .query("serviceUrls")
            .withIndex("by_service", (q: any) => q.eq("serviceId", service._id))
            .collect();

          // Just count URLs, don't fetch uptime checks
          const urlCount = urls.length;
          const upCount = urls.filter(u => !u.excludeFromUptime).length;

          return {
            _id: service._id,
            name: service.name,
            deviceId: service.deviceId,
            iconUrl: service.iconUrl,
            userId: service.userId,
            layoutX: service.layoutX,
            layoutY: service.layoutY,
            layoutWidth: service.layoutWidth,
            layoutHeight: service.layoutHeight,
            layoutOrder: service.layoutOrder,
            useCustomAlerts: service.useCustomAlerts,
            alertPriority: service.alertPriority,
            alertTags: service.alertTags,
            device: device ? { name: device.name } : null,
            urlCount,
            monitoredUrlCount: upCount,
            // Don't include notes, urls, or uptime data - fetch separately when needed
          };
        } catch (serviceError) {
          console.error(`Error processing service ${service._id}:`, serviceError);
          return {
            _id: service._id,
            name: service.name,
            deviceId: service.deviceId,
            iconUrl: service.iconUrl,
            userId: service.userId,
            device: null,
            urlCount: 0,
            monitoredUrlCount: 0,
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

// Get URLs with uptime status for specific services (optimized for dashboard display)
export const getServiceUrlsWithStatus = query({
  args: { serviceIds: v.array(v.id("services")), userId: v.id("users") },
  handler: async (ctx, args) => {
    // Batch fetch all URLs for the requested services
    const allUrls = await ctx.db.query("serviceUrls").collect();
    const relevantUrls = allUrls.filter(url =>
      args.serviceIds.includes(url.serviceId) &&
      (!url.userId || url.userId === args.userId)
    );

    // Decrypt URLs and fetch latest checks in parallel
    const urlsWithStatus = await Promise.all(
      relevantUrls.map(async (url) => {
        // Fetch latest check for this URL
        const latestCheck = await ctx.db
          .query("uptimeChecks")
          .withIndex("by_url", (q) => q.eq("serviceUrlId", url._id))
          .order("desc")
          .first();

        // Decrypt URL
        const decryptedUrl = (await decrypt(url.url, getEncryptionKey())) || url.url;

        return {
          _id: url._id,
          serviceId: url.serviceId,
          label: url.label,
          url: decryptedUrl,
          isUp: latestCheck?.isUp ?? null,
          lastCheck: latestCheck?.timestamp ?? null,
          responseTime: latestCheck?.responseTime ?? null,
          excludeFromUptime: url.excludeFromUptime,
        };
      })
    );

    // Group by service ID for easy lookup
    const urlsByService: Record<string, any[]> = {};
    for (const url of urlsWithStatus) {
      if (!urlsByService[url.serviceId]) {
        urlsByService[url.serviceId] = [];
      }
      urlsByService[url.serviceId].push(url);
    }

    return urlsByService;
  },
});
