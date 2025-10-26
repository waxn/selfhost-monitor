import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Test action to manually trigger an email alert
 * Use this in Convex dashboard to test email sending
 *
 * Example usage in Convex dashboard:
 * testEmailAlert({
 *   recipientEmail: "your@email.com",
 *   testType: "down"
 * })
 */
export const testEmailAlert = action({
  args: {
    recipientEmail: v.string(),
    testType: v.union(v.literal("down"), v.literal("recovery")),
  },
  handler: async (ctx, args): Promise<{ success: boolean; emailId?: string; error?: string }> => {
    console.log(`Testing ${args.testType} email to ${args.recipientEmail}`);

    if (args.testType === "down") {
      const result: { success: boolean; emailId?: string; error?: string } = await ctx.runAction(internal.emails.sendDownAlert, {
        recipientEmail: args.recipientEmail,
        recipientName: "Test User",
        serviceName: "Test Service",
        urlLabel: "Test URL",
        errorMessage: "This is a test down alert",
        statusCode: 500,
        timestamp: Date.now(),
      });

      console.log("Down alert test result:", result);
      return result;
    } else {
      const result: { success: boolean; emailId?: string; error?: string } = await ctx.runAction(internal.emails.sendRecoveryAlert, {
        recipientEmail: args.recipientEmail,
        recipientName: "Test User",
        serviceName: "Test Service",
        urlLabel: "Test URL",
        responseTime: 123,
        statusCode: 200,
        timestamp: Date.now(),
        downtimeDuration: 5 * 60 * 1000, // 5 minutes
      });

      console.log("Recovery alert test result:", result);
      return result;
    }
  },
});

/**
 * Debug action to check email configuration
 */
export const debugEmailConfig = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<{
    userFound: boolean;
    userEmail?: string;
    notificationEmail?: string;
    emailNotificationsEnabled?: boolean;
    hasResendApiKey: boolean;
  }> => {
    const user: any = await ctx.runQuery(internal.uptime.getUserForAlert, {
      userId: args.userId,
    });

    const config: {
      userFound: boolean;
      userEmail?: string;
      notificationEmail?: string;
      emailNotificationsEnabled?: boolean;
      hasResendApiKey: boolean;
    } = {
      userFound: !!user,
      userEmail: user?.email,
      notificationEmail: user?.notificationEmail,
      emailNotificationsEnabled: user?.emailNotificationsEnabled,
      hasResendApiKey: !!process.env.RESEND_API_KEY,
    };

    console.log("Email configuration debug:", config);
    return config;
  },
});
