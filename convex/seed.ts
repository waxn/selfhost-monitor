import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

// Helper to hash password (same logic as auth.ts)
function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function pbkdf2(password: string, salt: Uint8Array, iterations = 120000, dkLen = 64) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const saltBuffer = salt.slice().buffer;
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    dkLen * 8
  );
  return new Uint8Array(derivedBits);
}

function serializeHash(salt: Uint8Array, derivedKey: Uint8Array) {
  return `${toHex(salt)}:${toHex(derivedKey)}`;
}

// Check if demo user exists
export const getDemoUser = query({
  args: {},
  handler: async (ctx) => {
    const demoUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "demo@selfhost-monitor.app"))
      .first();

    if (!demoUser) return null;

    const { passwordHash, ...rest } = demoUser as any;
    return rest;
  },
});

// Get demo user ID
export const getDemoUserId = query({
  args: {},
  handler: async (ctx) => {
    const demoUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "demo@selfhost-monitor.app"))
      .first();

    return demoUser?._id || null;
  },
});

// Initialize demo user if it doesn't exist (safe to call multiple times)
export const initDemoUser = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if demo user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "demo@selfhost-monitor.app"))
      .first();

    if (existing) {
      return { message: "Demo user already exists", userId: existing._id, alreadyExisted: true };
    }

    // Create demo user
    const result = await seedDemoUserInternal(ctx);
    return { ...result, alreadyExisted: false };
  },
});

// Internal function to seed demo user
async function seedDemoUserInternal(ctx: any) {
    // Create demo user with password "demo"
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const derivedKey = await pbkdf2("demo", salt, 120000, 64);
    const passwordHash = serializeHash(salt, derivedKey);

    const demoUserId = await ctx.db.insert("users", {
      email: "demo@selfhost-monitor.app",
      name: "Demo User",
      passwordHash,
      createdAt: Date.now(),
    });

    // Create demo devices
    const homeServerId = await ctx.db.insert("devices", {
      name: "Home Server",
      description: "Main infrastructure - Dell PowerEdge R720",
      userId: demoUserId,
    });

    const vpsId = await ctx.db.insert("devices", {
      name: "VPS-01",
      description: "Cloud services - DigitalOcean Droplet",
      userId: demoUserId,
    });

    // Create demo services
    const nextcloudId = await ctx.db.insert("services", {
      name: "Nextcloud",
      notes: "Personal cloud storage and file sync",
      deviceId: homeServerId,
      iconUrl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0082c9"/><path fill="#fff" d="M20.5 14.5c-.9 0-1.6.3-2.2.9-.4-.8-1.2-1.4-2.3-1.4-1.3 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5c1.1 0 1.9-.6 2.3-1.4.6.6 1.3.9 2.2.9 1.7 0 3-1.3 3-3s-1.3-3-3-3zm-4.5 4c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm4.5 1c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: nextcloudId,
      label: "Web Interface",
      url: "https://cloud.example.com",
      pingInterval: 5,
      excludeFromUptime: false,
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: nextcloudId,
      label: "WebDAV",
      url: "https://cloud.example.com/remote.php/dav",
      pingInterval: 5,
      excludeFromUptime: false,
      userId: demoUserId,
    });

    const plexId = await ctx.db.insert("services", {
      name: "Plex Media Server",
      notes: "Movies, TV shows, and music streaming",
      deviceId: homeServerId,
      iconUrl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#e5a00d"/><path fill="#fff" d="M16 8l8 8-8 8V8z"/></svg>',
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: plexId,
      label: "Local",
      url: "http://192.168.1.100:32400",
      pingInterval: 5,
      excludeFromUptime: false,
      userId: demoUserId,
    });

    const gitlabId = await ctx.db.insert("services", {
      name: "GitLab",
      notes: "Self-hosted Git repository management",
      deviceId: vpsId,
      iconUrl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#fc6d26"/><path fill="#fff" d="M16 24l-5-8h10l-5 8zm-5-8l-2-6 2 6zm10 0l2-6-2 6z"/></svg>',
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: gitlabId,
      label: "Web Interface",
      url: "https://git.example.com",
      pingInterval: 5,
      excludeFromUptime: false,
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: gitlabId,
      label: "SSH",
      url: "https://git.example.com:22",
      pingInterval: 10,
      excludeFromUptime: true,
      userId: demoUserId,
    });

    const homeboxId = await ctx.db.insert("services", {
      name: "Homebox",
      notes: "Home inventory management system",
      deviceId: homeServerId,
      iconUrl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#27ae60"/><path fill="#fff" d="M16 6l10 8v10H6V14l10-8zm0 2.5L8 15v8h16v-8l-8-6.5z"/></svg>',
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: homeboxId,
      label: "Web",
      url: "https://homebox.example.com",
      pingInterval: 5,
      excludeFromUptime: false,
      userId: demoUserId,
    });

    const grafanaId = await ctx.db.insert("services", {
      name: "Grafana",
      notes: "Monitoring dashboards and analytics",
      deviceId: vpsId,
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: grafanaId,
      label: "Dashboard",
      url: "https://grafana.example.com",
      pingInterval: 5,
      excludeFromUptime: false,
      userId: demoUserId,
    });

    // Create some initial uptime check data for realism
    const now = Date.now();
    const serviceUrls = await ctx.db
      .query("serviceUrls")
      .withIndex("by_user", (q: any) => q.eq("userId", demoUserId))
      .collect();

    for (const url of serviceUrls.filter((u: any) => !u.excludeFromUptime)) {
      // Create checks for the last hour (12 checks at 5-minute intervals)
      for (let i = 0; i < 12; i++) {
        const timestamp = now - (i * 5 * 60 * 1000);
        const isUp = Math.random() > 0.1; // 90% uptime

        await ctx.db.insert("uptimeChecks", {
          serviceUrlId: url._id,
          timestamp,
          isUp,
          responseTime: isUp ? Math.floor(Math.random() * 200) + 20 : undefined,
          statusCode: isUp ? 200 : undefined,
          error: isUp ? undefined : "Connection timeout",
          userId: demoUserId,
        });
      }
    }

    return {
      message: "Demo user created successfully",
      userId: demoUserId,
      email: "demo@selfhost-monitor.app",
      password: "demo"
    };
}

// Seed demo user and data (run this once to initialize) - DEPRECATED, use initDemoUser instead
export const seedDemoUser = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if demo user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "demo@selfhost-monitor.app"))
      .first();

    if (existing) {
      return { message: "Demo user already exists", userId: existing._id };
    }

    // Create demo user with password "demo"
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const derivedKey = await pbkdf2("demo", salt, 120000, 64);
    const passwordHash = serializeHash(salt, derivedKey);

    const demoUserId = await ctx.db.insert("users", {
      email: "demo@selfhost-monitor.app",
      name: "Demo User",
      passwordHash,
      createdAt: Date.now(),
    });

    // Create demo devices
    const homeServerId = await ctx.db.insert("devices", {
      name: "Home Server",
      description: "Main infrastructure - Dell PowerEdge R720",
      userId: demoUserId,
    });

    const vpsId = await ctx.db.insert("devices", {
      name: "VPS-01",
      description: "Cloud services - DigitalOcean Droplet",
      userId: demoUserId,
    });

    // Create demo services
    const nextcloudId = await ctx.db.insert("services", {
      name: "Nextcloud",
      notes: "Personal cloud storage and file sync",
      deviceId: homeServerId,
      iconUrl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0082c9"/><path fill="#fff" d="M20.5 14.5c-.9 0-1.6.3-2.2.9-.4-.8-1.2-1.4-2.3-1.4-1.3 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5c1.1 0 1.9-.6 2.3-1.4.6.6 1.3.9 2.2.9 1.7 0 3-1.3 3-3s-1.3-3-3-3zm-4.5 4c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm4.5 1c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: nextcloudId,
      label: "Web Interface",
      url: "https://cloud.example.com",
      pingInterval: 5,
      excludeFromUptime: false,
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: nextcloudId,
      label: "WebDAV",
      url: "https://cloud.example.com/remote.php/dav",
      pingInterval: 5,
      excludeFromUptime: false,
      userId: demoUserId,
    });

    const plexId = await ctx.db.insert("services", {
      name: "Plex Media Server",
      notes: "Movies, TV shows, and music streaming",
      deviceId: homeServerId,
      iconUrl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#e5a00d"/><path fill="#fff" d="M16 8l8 8-8 8V8z"/></svg>',
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: plexId,
      label: "Local",
      url: "http://192.168.1.100:32400",
      pingInterval: 5,
      excludeFromUptime: false,
      userId: demoUserId,
    });

    const gitlabId = await ctx.db.insert("services", {
      name: "GitLab",
      notes: "Self-hosted Git repository management",
      deviceId: vpsId,
      iconUrl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#fc6d26"/><path fill="#fff" d="M16 24l-5-8h10l-5 8zm-5-8l-2-6 2 6zm10 0l2-6-2 6z"/></svg>',
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: gitlabId,
      label: "Web Interface",
      url: "https://git.example.com",
      pingInterval: 5,
      excludeFromUptime: false,
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: gitlabId,
      label: "SSH",
      url: "https://git.example.com:22",
      pingInterval: 10,
      excludeFromUptime: true,
      userId: demoUserId,
    });

    const homeboxId = await ctx.db.insert("services", {
      name: "Homebox",
      notes: "Home inventory management system",
      deviceId: homeServerId,
      iconUrl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#27ae60"/><path fill="#fff" d="M16 6l10 8v10H6V14l10-8zm0 2.5L8 15v8h16v-8l-8-6.5z"/></svg>',
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: homeboxId,
      label: "Web",
      url: "https://homebox.example.com",
      pingInterval: 5,
      excludeFromUptime: false,
      userId: demoUserId,
    });

    const grafanaId = await ctx.db.insert("services", {
      name: "Grafana",
      notes: "Monitoring dashboards and analytics",
      deviceId: vpsId,
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: grafanaId,
      label: "Dashboard",
      url: "https://grafana.example.com",
      pingInterval: 5,
      excludeFromUptime: false,
      userId: demoUserId,
    });

    // Create some initial uptime check data for realism
    const now = Date.now();
    const serviceUrls = await ctx.db
      .query("serviceUrls")
      .withIndex("by_user", (q: any) => q.eq("userId", demoUserId))
      .collect();

    for (const url of serviceUrls.filter((u: any) => !u.excludeFromUptime)) {
      // Create checks for the last hour (12 checks at 5-minute intervals)
      for (let i = 0; i < 12; i++) {
        const timestamp = now - (i * 5 * 60 * 1000);
        const isUp = Math.random() > 0.1; // 90% uptime

        await ctx.db.insert("uptimeChecks", {
          serviceUrlId: url._id,
          timestamp,
          isUp,
          responseTime: isUp ? Math.floor(Math.random() * 200) + 20 : undefined,
          statusCode: isUp ? 200 : undefined,
          error: isUp ? undefined : "Connection timeout",
          userId: demoUserId,
        });
      }
    }

    return {
      message: "Demo user created successfully",
      userId: demoUserId,
      email: "demo@selfhost-monitor.app",
      password: "demo"
    };
  },
});

// Reset demo user data (called by cron job)
export const resetDemoData = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Find demo user
    const demoUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "demo@selfhost-monitor.app"))
      .first();

    if (!demoUser) {
      return { message: "Demo user not found" };
    }

    const demoUserId = demoUser._id;

    // Delete all demo user's data
    const devices = await ctx.db
      .query("devices")
      .withIndex("by_user", (q) => q.eq("userId", demoUserId))
      .collect();

    const services = await ctx.db
      .query("services")
      .withIndex("by_user", (q) => q.eq("userId", demoUserId))
      .collect();

    const serviceUrls = await ctx.db
      .query("serviceUrls")
      .withIndex("by_user", (q) => q.eq("userId", demoUserId))
      .collect();

    const uptimeChecks = await ctx.db
      .query("uptimeChecks")
      .withIndex("by_user", (q) => q.eq("userId", demoUserId))
      .collect();

    // Delete in correct order (respect foreign keys)
    for (const check of uptimeChecks) {
      await ctx.db.delete(check._id);
    }

    for (const url of serviceUrls) {
      await ctx.db.delete(url._id);
    }

    for (const service of services) {
      await ctx.db.delete(service._id);
    }

    for (const device of devices) {
      await ctx.db.delete(device._id);
    }

    // Recreate demo data by calling the seed mutation logic inline
    // Create demo devices
    const homeServerId = await ctx.db.insert("devices", {
      name: "Home Server",
      description: "Main infrastructure - Dell PowerEdge R720",
      userId: demoUserId,
    });

    const vpsId = await ctx.db.insert("devices", {
      name: "VPS-01",
      description: "Cloud services - DigitalOcean Droplet",
      userId: demoUserId,
    });

    // Create demo services (same as seed)
    const nextcloudId = await ctx.db.insert("services", {
      name: "Nextcloud",
      notes: "Personal cloud storage and file sync",
      deviceId: homeServerId,
      iconUrl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0082c9"/><path fill="#fff" d="M20.5 14.5c-.9 0-1.6.3-2.2.9-.4-.8-1.2-1.4-2.3-1.4-1.3 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5c1.1 0 1.9-.6 2.3-1.4.6.6 1.3.9 2.2.9 1.7 0 3-1.3 3-3s-1.3-3-3-3zm-4.5 4c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm4.5 1c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: nextcloudId,
      label: "Web Interface",
      url: "https://cloud.example.com",
      pingInterval: 5,
      excludeFromUptime: false,
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: nextcloudId,
      label: "WebDAV",
      url: "https://cloud.example.com/remote.php/dav",
      pingInterval: 5,
      excludeFromUptime: false,
      userId: demoUserId,
    });

    const plexId = await ctx.db.insert("services", {
      name: "Plex Media Server",
      notes: "Movies, TV shows, and music streaming",
      deviceId: homeServerId,
      iconUrl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#e5a00d"/><path fill="#fff" d="M16 8l8 8-8 8V8z"/></svg>',
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: plexId,
      label: "Local",
      url: "http://192.168.1.100:32400",
      pingInterval: 5,
      excludeFromUptime: false,
      userId: demoUserId,
    });

    const gitlabId = await ctx.db.insert("services", {
      name: "GitLab",
      notes: "Self-hosted Git repository management",
      deviceId: vpsId,
      iconUrl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#fc6d26"/><path fill="#fff" d="M16 24l-5-8h10l-5 8zm-5-8l-2-6 2 6zm10 0l2-6-2 6z"/></svg>',
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: gitlabId,
      label: "Web Interface",
      url: "https://git.example.com",
      pingInterval: 5,
      excludeFromUptime: false,
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: gitlabId,
      label: "SSH",
      url: "https://git.example.com:22",
      pingInterval: 10,
      excludeFromUptime: true,
      userId: demoUserId,
    });

    const homeboxId = await ctx.db.insert("services", {
      name: "Homebox",
      notes: "Home inventory management system",
      deviceId: homeServerId,
      iconUrl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#27ae60"/><path fill="#fff" d="M16 6l10 8v10H6V14l10-8zm0 2.5L8 15v8h16v-8l-8-6.5z"/></svg>',
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: homeboxId,
      label: "Web",
      url: "https://homebox.example.com",
      pingInterval: 5,
      excludeFromUptime: false,
      userId: demoUserId,
    });

    const grafanaId = await ctx.db.insert("services", {
      name: "Grafana",
      notes: "Monitoring dashboards and analytics",
      deviceId: vpsId,
      userId: demoUserId,
    });

    await ctx.db.insert("serviceUrls", {
      serviceId: grafanaId,
      label: "Dashboard",
      url: "https://grafana.example.com",
      pingInterval: 5,
      excludeFromUptime: false,
      userId: demoUserId,
    });

    return { message: "Demo data reset successfully" };
  },
});
