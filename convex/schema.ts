import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  devices: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    // Layout properties
    layoutX: v.optional(v.number()),
    layoutY: v.optional(v.number()),
    layoutWidth: v.optional(v.number()),
    layoutHeight: v.optional(v.number()),
    layoutOrder: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  services: defineTable({
    name: v.string(),
    notes: v.optional(v.string()), // ENCRYPTED: Contains sensitive information
    deviceId: v.optional(v.id("devices")),
    iconUrl: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    // Layout properties
    layoutX: v.optional(v.number()),
    layoutY: v.optional(v.number()),
    layoutWidth: v.optional(v.number()),
    layoutHeight: v.optional(v.number()),
    layoutOrder: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  serviceUrls: defineTable({
    serviceId: v.id("services"),
    label: v.string(),
    url: v.string(), // ENCRYPTED: May contain private IPs/internal URLs
    pingInterval: v.optional(v.number()),
    excludeFromUptime: v.optional(v.boolean()),
    userId: v.optional(v.id("users")),
  }).index("by_service", ["serviceId"]).index("by_user", ["userId"]),

  uptimeChecks: defineTable({
    serviceUrlId: v.id("serviceUrls"),
    timestamp: v.number(),
    isUp: v.boolean(),
    responseTime: v.optional(v.number()),
    statusCode: v.optional(v.number()),
    error: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  }).index("by_url", ["serviceUrlId", "timestamp"]).index("by_user", ["userId"]),

  // Lightweight users table for simple auth demo
  users: defineTable({
    // Make fields optional so existing user documents (e.g. with only email)
    // will pass validation. For production, tune the schema to your needs.
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    // store password hash (serialized salt:key) for password auth
    passwordHash: v.optional(v.string()),
    // User preferences
    backgroundColor: v.optional(v.string()),
    backgroundImage: v.optional(v.union(v.string(), v.null())),
    tileOpacity: v.optional(v.number()),
  }).index("by_name", ["name"]).index("by_email", ["email"]),
});
