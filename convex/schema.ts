import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  devices: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
  }),

  services: defineTable({
    name: v.string(),
    notes: v.optional(v.string()),
    deviceId: v.id("devices"),
    iconUrl: v.optional(v.string()),
  }),

  serviceUrls: defineTable({
    serviceId: v.id("services"),
    label: v.string(), // e.g., "Local", "Web", "API"
    url: v.string(),
    pingInterval: v.optional(v.number()), // in minutes, defaults to 5
    excludeFromUptime: v.optional(v.boolean()), // if true, don't ping this URL
  }).index("by_service", ["serviceId"]),

  uptimeChecks: defineTable({
    serviceUrlId: v.id("serviceUrls"),
    timestamp: v.number(),
    isUp: v.boolean(),
    responseTime: v.optional(v.number()), // in ms
    statusCode: v.optional(v.number()),
    error: v.optional(v.string()),
  }).index("by_url", ["serviceUrlId", "timestamp"]),
});
