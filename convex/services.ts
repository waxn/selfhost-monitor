import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    // Get all services (for backwards compatibility)
    const allServices = await ctx.db.query("services").collect();

    // Filter to user's services or services without a userId (legacy data)
    const services = userId
      ? allServices.filter(s => !s.userId || s.userId === userId)
      : allServices;

    // Fetch related data for each service
    const servicesWithDetails = await Promise.all(
      services.map(async (service) => {
        const device = await ctx.db.get(service.deviceId);
        const urls = await ctx.db
          .query("serviceUrls")
          .withIndex("by_service", (q) => q.eq("serviceId", service._id))
          .collect();

        // Get latest uptime status for each URL
        const urlsWithStatus = await Promise.all(
          urls.map(async (url) => {
            const latestCheck = await ctx.db
              .query("uptimeChecks")
              .withIndex("by_url", (q) => q.eq("serviceUrlId", url._id))
              .order("desc")
              .first();

            return {
              ...url,
              isUp: latestCheck?.isUp ?? null,
              lastCheck: latestCheck?.timestamp ?? null,
              responseTime: latestCheck?.responseTime ?? null,
            };
          })
        );

        return {
          ...service,
          device,
          urls: urlsWithStatus,
        };
      })
    );

    return servicesWithDetails;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    notes: v.optional(v.string()),
    deviceId: v.id("devices"),
    iconUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    return await ctx.db.insert("services", {
      name: args.name,
      notes: args.notes,
      deviceId: args.deviceId,
      iconUrl: args.iconUrl,
      userId: userId || undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.string(),
    notes: v.optional(v.string()),
    deviceId: v.id("devices"),
    iconUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const service = await ctx.db.get(args.id);

    // Check authorization only if both user and service have userId
    if (userId && service?.userId && service.userId !== userId) {
      throw new Error("Not authorized");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const service = await ctx.db.get(args.id);

    // Check authorization only if both user and service have userId
    if (userId && service?.userId && service.userId !== userId) {
      throw new Error("Not authorized");
    }

    // Delete associated URLs
    const urls = await ctx.db
      .query("serviceUrls")
      .withIndex("by_service", (q) => q.eq("serviceId", args.id))
      .collect();

    for (const url of urls) {
      // Delete uptime checks for this URL
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
