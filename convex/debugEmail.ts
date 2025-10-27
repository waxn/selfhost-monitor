import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Debug query to check why emails aren't sending
 * Call this with a serviceUrlId to see all the conditions
 */
export const checkEmailConditions = query({
  args: { serviceUrlId: v.id("serviceUrls") },
  handler: async (ctx, args) => {
    const url = await ctx.db.get(args.serviceUrlId);
    if (!url) {
      return { error: "URL not found" };
    }

    const service = await ctx.db.get(url.serviceId);
    const user = url.userId ? await ctx.db.get(url.userId) : null;

    const lastCheck = await ctx.db
      .query("uptimeChecks")
      .withIndex("by_url", (q) => q.eq("serviceUrlId", args.serviceUrlId))
      .order("desc")
      .first();

    return {
      url: {
        label: url.label,
        emailAlertsEnabled: url.emailAlertsEnabled,
        notifyOnDown: url.notifyOnDown,
        notifyOnRecovery: url.notifyOnRecovery,
        userId: url.userId,
        lastAlertTimestamp: url.lastAlertTimestamp,
      },
      user: user ? {
        email: user.email,
        notificationEmail: user.notificationEmail,
        emailNotificationsEnabled: user.emailNotificationsEnabled,
      } : null,
      service: service ? {
        name: service.name,
      } : null,
      lastCheck: lastCheck ? {
        isUp: lastCheck.isUp,
        timestamp: lastCheck.timestamp,
        error: lastCheck.error,
      } : null,
      conditions: {
        hasEmailAlertsEnabled: !!url.emailAlertsEnabled,
        hasUserId: !!url.userId,
        hasUser: !!user,
        hasNotificationEmail: !!(user && user.notificationEmail),
        hasEmailNotificationsEnabled: !!(user && user.emailNotificationsEnabled),
        hasService: !!service,
        allConditionsMet: !!(
          url.emailAlertsEnabled &&
          url.userId &&
          user &&
          user.notificationEmail &&
          user.emailNotificationsEnabled &&
          service
        ),
      },
      recommendations: [],
    };
  },
});
