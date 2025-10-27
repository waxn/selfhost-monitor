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
    pingInterval: v.optional(v.number()), // How often to ping (seconds, default: 10)
    saveInterval: v.optional(v.number()), // How often to save to DB (minutes, default: 15)
    excludeFromUptime: v.optional(v.boolean()),
    userId: v.optional(v.id("users")),
    // Email alert settings
    emailAlertsEnabled: v.optional(v.boolean()),
    notifyOnDown: v.optional(v.boolean()),
    notifyOnRecovery: v.optional(v.boolean()),
    lastAlertTimestamp: v.optional(v.number()),
    // Advanced alert settings
    minDowntimeDuration: v.optional(v.number()), // Minimum downtime in seconds before alerting (default: 0 = immediate)
    consecutiveFailures: v.optional(v.number()), // Number of consecutive failures before alerting (default: 1)
    alertCooldown: v.optional(v.number()), // Minutes between alerts for same URL (default: 15)
    // Track consecutive failure state
    currentFailureCount: v.optional(v.number()), // Current consecutive failure count
    firstFailureTimestamp: v.optional(v.number()), // Timestamp of first failure in current streak
    // Track last save for interval-based saving
    lastSaveTimestamp: v.optional(v.number()),
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
    // Email notification preferences
    notificationEmail: v.optional(v.string()),
    emailNotificationsEnabled: v.optional(v.boolean()),
  }).index("by_name", ["name"]).index("by_email", ["email"]),

  // Alert settings and templates
  alertSettings: defineTable({
    userId: v.id("users"),
    // Global alert defaults
    defaultMinDowntime: v.optional(v.number()), // seconds
    defaultConsecutiveFailures: v.optional(v.number()),
    defaultAlertCooldown: v.optional(v.number()), // minutes
    // Email template customization
    downAlertSubject: v.optional(v.string()),
    downAlertBody: v.optional(v.string()), // HTML/Text template with variables
    recoveryAlertSubject: v.optional(v.string()),
    recoveryAlertBody: v.optional(v.string()),
    // Alert behavior
    sendRecoveryAlerts: v.optional(v.boolean()),
    sendDowntimeReports: v.optional(v.boolean()), // Daily/weekly summaries
    reportFrequency: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"))),
    reportDay: v.optional(v.number()), // Day of week (0-6) or month (1-31)
    // Alert channels (future expansion)
    enableWebhooks: v.optional(v.boolean()),
    webhookUrl: v.optional(v.string()),
    // Quiet hours
    quietHoursEnabled: v.optional(v.boolean()),
    quietHoursStart: v.optional(v.string()), // HH:MM format
    quietHoursEnd: v.optional(v.string()), // HH:MM format
    timezone: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});
