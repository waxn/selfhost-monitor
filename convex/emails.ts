import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { Resend } from "resend";

export const sendDownAlert = internalAction({
  args: {
    recipientEmail: v.string(),
    recipientName: v.optional(v.string()),
    serviceName: v.string(),
    urlLabel: v.string(),
    errorMessage: v.optional(v.string()),
    statusCode: v.optional(v.number()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    // Access environment variable through ctx in Convex
    const resendApiKey = process.env.RESEND_API_KEY;

    console.log("sendDownAlert called for:", args.recipientEmail);
    console.log("Has API key:", !!resendApiKey);

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not set in environment variables");
      return { success: false, error: "API key not configured - please set RESEND_API_KEY in Convex Dashboard" };
    }

    try {
      const resend = new Resend(resendApiKey);
      console.log("Resend client created successfully");

      const formattedTime = new Date(args.timestamp).toLocaleString();
      const recipientName = args.recipientName || "User";

      const errorDetails = args.errorMessage
        ? `<p><strong>Error:</strong> ${args.errorMessage}</p>`
        : args.statusCode
        ? `<p><strong>Status Code:</strong> ${args.statusCode}</p>`
        : "";

      const response = await resend.emails.send({
        from: "SelfHost Monitor <alerts@hlm.waxnflaxnai.com>",
        to: args.recipientEmail,
        subject: `🔴 Service Down: ${args.serviceName} - ${args.urlLabel}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .container {
                  background: #ffffff;
                  border: 1px solid #e1e4e8;
                  border-radius: 8px;
                  padding: 24px;
                }
                .alert-header {
                  background: #c0392b;
                  color: white;
                  padding: 16px;
                  border-radius: 6px;
                  margin-bottom: 20px;
                }
                .alert-header h1 {
                  margin: 0;
                  font-size: 20px;
                  font-weight: 600;
                }
                .service-info {
                  background: #f6f8fa;
                  border-left: 4px solid #c0392b;
                  padding: 16px;
                  margin: 16px 0;
                  border-radius: 4px;
                }
                .service-info p {
                  margin: 8px 0;
                }
                .timestamp {
                  color: #6c757d;
                  font-size: 14px;
                  margin-top: 20px;
                  padding-top: 16px;
                  border-top: 1px solid #e1e4e8;
                }
                .footer {
                  margin-top: 24px;
                  padding-top: 16px;
                  border-top: 1px solid #e1e4e8;
                  color: #6c757d;
                  font-size: 12px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="alert-header">
                  <h1>🔴 Service Down Alert</h1>
                </div>

                <p>Hello ${recipientName},</p>

                <p>Your monitored service has gone down and is currently unreachable.</p>

                <div class="service-info">
                  <p><strong>Service:</strong> ${args.serviceName}</p>
                  <p><strong>URL Label:</strong> ${args.urlLabel}</p>
                  ${errorDetails}
                </div>

                <p>Please check your service and take appropriate action.</p>

                <div class="timestamp">
                  <strong>Time:</strong> ${formattedTime}
                </div>

                <div class="footer">
                  <p>This is an automated alert from SelfHost Monitor.</p>
                  <p>You're receiving this because you enabled email notifications for this service.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      console.log("Down alert email sent successfully:", response);
      return { success: true, emailId: response.data?.id };
    } catch (error) {
      console.error("Failed to send down alert email:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      } else {
        errorMessage = String(error);
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  },
});

export const sendRecoveryAlert = internalAction({
  args: {
    recipientEmail: v.string(),
    recipientName: v.optional(v.string()),
    serviceName: v.string(),
    urlLabel: v.string(),
    responseTime: v.optional(v.number()),
    statusCode: v.optional(v.number()),
    timestamp: v.number(),
    downtimeDuration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Access environment variable through ctx in Convex
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not set in environment variables");
      return { success: false, error: "API key not configured" };
    }

    try {
      const resend = new Resend(resendApiKey);

      const formattedTime = new Date(args.timestamp).toLocaleString();
      const recipientName = args.recipientName || "User";

      const downtimeInfo = args.downtimeDuration
        ? `<p><strong>Downtime Duration:</strong> ${formatDuration(args.downtimeDuration)}</p>`
        : "";

      const responseTimeInfo = args.responseTime
        ? `<p><strong>Response Time:</strong> ${args.responseTime}ms</p>`
        : "";

      const response = await resend.emails.send({
        from: "SelfHost Monitor <alerts@hlm.waxnflaxnai.com>",
        to: args.recipientEmail,
        subject: `✅ Service Recovered: ${args.serviceName} - ${args.urlLabel}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .container {
                  background: #ffffff;
                  border: 1px solid #e1e4e8;
                  border-radius: 8px;
                  padding: 24px;
                }
                .alert-header {
                  background: #229954;
                  color: white;
                  padding: 16px;
                  border-radius: 6px;
                  margin-bottom: 20px;
                }
                .alert-header h1 {
                  margin: 0;
                  font-size: 20px;
                  font-weight: 600;
                }
                .service-info {
                  background: #f6f8fa;
                  border-left: 4px solid #229954;
                  padding: 16px;
                  margin: 16px 0;
                  border-radius: 4px;
                }
                .service-info p {
                  margin: 8px 0;
                }
                .timestamp {
                  color: #6c757d;
                  font-size: 14px;
                  margin-top: 20px;
                  padding-top: 16px;
                  border-top: 1px solid #e1e4e8;
                }
                .footer {
                  margin-top: 24px;
                  padding-top: 16px;
                  border-top: 1px solid #e1e4e8;
                  color: #6c757d;
                  font-size: 12px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="alert-header">
                  <h1>✅ Service Recovered</h1>
                </div>

                <p>Hello ${recipientName},</p>

                <p>Good news! Your service is back online and responding normally.</p>

                <div class="service-info">
                  <p><strong>Service:</strong> ${args.serviceName}</p>
                  <p><strong>URL Label:</strong> ${args.urlLabel}</p>
                  ${responseTimeInfo}
                  ${args.statusCode ? `<p><strong>Status Code:</strong> ${args.statusCode}</p>` : ""}
                  ${downtimeInfo}
                </div>

                <div class="timestamp">
                  <strong>Recovery Time:</strong> ${formattedTime}
                </div>

                <div class="footer">
                  <p>This is an automated alert from SelfHost Monitor.</p>
                  <p>You're receiving this because you enabled email notifications for this service.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      console.log("Recovery alert email sent:", response);
      return { success: true, emailId: response.data?.id };
    } catch (error) {
      console.error("Failed to send recovery alert email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },
});

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}
