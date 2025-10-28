import { v } from "convex/values";
import { internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Resend } from "resend";

// Helper to render template with variables
function renderTemplate(template: string, variables: Record<string, any>): string {
  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, String(value ?? ''));
  }
  // Handle conditional blocks: {{#if variable}}...{{/if}}
  rendered = rendered.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/gs, (match, varName, content) => {
    return variables[varName] ? content : '';
  });
  return rendered;
}

export const sendDownAlert = internalAction({
  args: {
    recipientEmail: v.string(),
    recipientName: v.optional(v.string()),
    serviceName: v.string(),
    urlLabel: v.string(),
    errorMessage: v.optional(v.string()),
    statusCode: v.optional(v.number()),
    timestamp: v.number(),
    userId: v.optional(v.id("users")), // To fetch custom templates
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

      // Use default templates (custom template support can be added later)
      let subject = `🔴 Service Down: ${args.serviceName} - ${args.urlLabel}`;
      let htmlBody = getDefaultDownHTML(args, recipientName, formattedTime);

      const response = await resend.emails.send({
        from: "SelfHost Monitor <alerts@hlm.waxnflaxnai.com>",
        to: args.recipientEmail,
        subject,
        html: htmlBody,
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
    userId: v.optional(v.id("users")),
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
      const formattedDowntime = args.downtimeDuration ? formatDuration(args.downtimeDuration) : undefined;

      // Use default templates (custom template support can be added later)
      let subject = `✅ Service Recovered: ${args.serviceName} - ${args.urlLabel}`;
      let htmlBody = getDefaultRecoveryHTML(args, recipientName, formattedTime);

      const response = await resend.emails.send({
        from: "SelfHost Monitor <alerts@hlm.waxnflaxnai.com>",
        to: args.recipientEmail,
        subject,
        html: htmlBody,
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

function getDefaultDownHTML(args: any, recipientName: string, formattedTime: string): string {
  const errorDetails = args.errorMessage
    ? `<p><strong>Error:</strong> ${args.errorMessage}</p>`
    : args.statusCode
    ? `<p><strong>Status Code:</strong> ${args.statusCode}</p>`
    : "";

  return `
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
  `;
}

function getDefaultRecoveryHTML(args: any, recipientName: string, formattedTime: string): string {
  const downtimeInfo = args.downtimeDuration
    ? `<p><strong>Downtime Duration:</strong> ${formatDuration(args.downtimeDuration)}</p>`
    : "";

  const responseTimeInfo = args.responseTime
    ? `<p><strong>Response Time:</strong> ${args.responseTime}ms</p>`
    : "";

  return `
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
  `;
}
