/**
 * Migration utilities to fix existing data
 * Run these manually in Convex dashboard if needed
 */

import { internalMutation, internalQuery } from "./_generated/server";

/**
 * Add userId to all serviceUrls that are missing it
 * This fixes services created before userId was required
 */
export const addUserIdToServiceUrls = internalMutation({
  handler: async (ctx) => {
    console.log("Starting migration: addUserIdToServiceUrls");

    // Get all serviceUrls
    const allUrls = await ctx.db.query("serviceUrls").collect();
    console.log(`Found ${allUrls.length} serviceUrls`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const url of allUrls) {
      // Skip if already has userId
      if (url.userId) {
        skippedCount++;
        continue;
      }

      console.log(`Processing serviceUrl ${url._id} (label: ${url.label})`);
      console.log(`  serviceId: ${url.serviceId}`);

      // Get the service to find its userId
      const service = await ctx.db.get(url.serviceId);
      console.log(`  Service found: ${!!service}, userId: ${service?.userId}`);

      if (!service) {
        console.error(`  ERROR: Service ${url.serviceId} not found!`);
        continue;
      }

      if (!service.userId) {
        console.error(`  ERROR: Service ${url.serviceId} has no userId!`);
        continue;
      }

      // Update the serviceUrl with userId from parent service
      await ctx.db.patch(url._id, {
        userId: service.userId,
      });

      updatedCount++;
      console.log(`  ✓ Updated serviceUrl ${url._id} with userId ${service.userId}`);
    }

    console.log(`Migration complete: Updated ${updatedCount}, Skipped ${skippedCount}`);
    return { updatedCount, skippedCount, total: allUrls.length };
  },
});

/**
 * Add userId to all services that are missing it
 * Assigns to the first user found in the database
 */
export const addUserIdToServices = internalMutation({
  handler: async (ctx) => {
    console.log("Starting migration: addUserIdToServices");

    // Get first user
    const firstUser = await ctx.db.query("users").first();
    if (!firstUser) {
      console.error("No users found in database!");
      return { error: "No users found" };
    }

    console.log(`Using user ${firstUser._id} (${firstUser.email}) as default owner`);

    // Get all services
    const allServices = await ctx.db.query("services").collect();
    console.log(`Found ${allServices.length} services`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const service of allServices) {
      // Skip if already has userId
      if (service.userId) {
        skippedCount++;
        continue;
      }

      // Update the service with first user's ID
      await ctx.db.patch(service._id, {
        userId: firstUser._id,
      });

      updatedCount++;
      console.log(`Updated service ${service._id} (${service.name}) with userId ${firstUser._id}`);
    }

    console.log(`Migration complete: Updated ${updatedCount}, Skipped ${skippedCount}`);
    return { updatedCount, skippedCount, total: allServices.length };
  },
});

/**
 * Check migration status
 */
export const checkMigrationStatus = internalQuery({
  handler: async (ctx) => {
    const services = await ctx.db.query("services").collect();
    const serviceUrls = await ctx.db.query("serviceUrls").collect();

    const servicesWithoutUserId = services.filter(s => !s.userId).length;
    const urlsWithoutUserId = serviceUrls.filter(u => !u.userId).length;

    return {
      services: {
        total: services.length,
        withoutUserId: servicesWithoutUserId,
        needsMigration: servicesWithoutUserId > 0,
      },
      serviceUrls: {
        total: serviceUrls.length,
        withoutUserId: urlsWithoutUserId,
        needsMigration: urlsWithoutUserId > 0,
      },
    };
  },
});
