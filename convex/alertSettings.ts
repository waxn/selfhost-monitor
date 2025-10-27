import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get alert settings for a user
export const get = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("alertSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // Return defaults if no settings exist
    if (!settings) {
      return {
        userId: args.userId,
        defaultMinDowntime: 0,
        defaultConsecutiveFailures: 1,
        defaultAlertCooldown: 15,
        downAlertSubject: "🚨 Service Down: {{serviceName}} - {{urlLabel}}",
        downAlertBody: getDefaultDownAlertBody(),
        recoveryAlertSubject: "✅ Service Recovered: {{serviceName}} - {{urlLabel}}",
        recoveryAlertBody: getDefaultRecoveryAlertBody(),
        sendRecoveryAlerts: true,
        sendDowntimeReports: false,
        reportFrequency: "weekly" as const,
        reportDay: 1,
        enableWebhooks: false,
        webhookUrl: "",
        quietHoursEnabled: false,
        quietHoursStart: "22:00",
        quietHoursEnd: "08:00",
        timezone: "UTC",
      };
    }

    return settings;
  },
});

// Update or create alert settings
export const upsert = mutation({
  args: {
    userId: v.id("users"),
    defaultMinDowntime: v.optional(v.number()),
    defaultConsecutiveFailures: v.optional(v.number()),
    defaultAlertCooldown: v.optional(v.number()),
    downAlertSubject: v.optional(v.string()),
    downAlertBody: v.optional(v.string()),
    recoveryAlertSubject: v.optional(v.string()),
    recoveryAlertBody: v.optional(v.string()),
    sendRecoveryAlerts: v.optional(v.boolean()),
    sendDowntimeReports: v.optional(v.boolean()),
    reportFrequency: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"))),
    reportDay: v.optional(v.number()),
    enableWebhooks: v.optional(v.boolean()),
    webhookUrl: v.optional(v.string()),
    quietHoursEnabled: v.optional(v.boolean()),
    quietHoursStart: v.optional(v.string()),
    quietHoursEnd: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...settings } = args;

    // Check if settings already exist
    const existing = await ctx.db
      .query("alertSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      // Update existing settings
      await ctx.db.patch(existing._id, settings);
      return existing._id;
    } else {
      // Create new settings
      return await ctx.db.insert("alertSettings", {
        userId,
        ...settings,
      });
    }
  },
});

// Reset to defaults
export const resetToDefaults = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("alertSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const defaults = {
      defaultMinDowntime: 0,
      defaultConsecutiveFailures: 1,
      defaultAlertCooldown: 15,
      downAlertSubject: "🚨 Service Down: {{serviceName}} - {{urlLabel}}",
      downAlertBody: getDefaultDownAlertBody(),
      recoveryAlertSubject: "✅ Service Recovered: {{serviceName}} - {{urlLabel}}",
      recoveryAlertBody: getDefaultRecoveryAlertBody(),
      sendRecoveryAlerts: true,
      sendDowntimeReports: false,
      reportFrequency: "weekly" as const,
      reportDay: 1,
      enableWebhooks: false,
      webhookUrl: undefined,
      quietHoursEnabled: false,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
      timezone: "UTC",
    };

    if (existing) {
      await ctx.db.patch(existing._id, defaults);
      return existing._id;
    } else {
      return await ctx.db.insert("alertSettings", {
        userId: args.userId,
        ...defaults,
      });
    }
  },
});

// Default email templates
function getDefaultDownAlertBody(): string {
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #c0392b;">🚨 Service Down Alert</h2>
  <p>Your service <strong>{{serviceName}}</strong> ({{urlLabel}}) is currently down.</p>

  <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <p><strong>Service:</strong> {{serviceName}}</p>
    <p><strong>URL:</strong> {{urlLabel}}</p>
    <p><strong>Time:</strong> {{timestamp}}</p>
    {{#if statusCode}}<p><strong>Status Code:</strong> {{statusCode}}</p>{{/if}}
    {{#if errorMessage}}<p><strong>Error:</strong> {{errorMessage}}</p>{{/if}}
  </div>

  <p>Please check your service as soon as possible.</p>
  <p style="color: #6c757d; font-size: 12px;">This is an automated alert from your Service Monitor.</p>
</div>
`.trim();
}

function getDefaultRecoveryAlertBody(): string {
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #27ae60;">✅ Service Recovered</h2>
  <p>Great news! Your service <strong>{{serviceName}}</strong> ({{urlLabel}}) is back online.</p>

  <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <p><strong>Service:</strong> {{serviceName}}</p>
    <p><strong>URL:</strong> {{urlLabel}}</p>
    <p><strong>Recovery Time:</strong> {{timestamp}}</p>
    {{#if responseTime}}<p><strong>Response Time:</strong> {{responseTime}}ms</p>{{/if}}
    {{#if downtimeDuration}}<p><strong>Total Downtime:</strong> {{downtimeDuration}}</p>{{/if}}
  </div>

  <p>Your service is now operational.</p>
  <p style="color: #6c757d; font-size: 12px;">This is an automated alert from your Service Monitor.</p>
</div>
`.trim();
}
