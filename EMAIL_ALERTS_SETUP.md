# Email Alerts Setup Guide

Email alert functionality has been implemented for your selfhost monitor using Resend. This guide will help you set up and test the feature.

## What's Been Implemented

### Backend Changes

1. **Database Schema Updates** ([convex/schema.ts](convex/schema.ts))
   - Added email alert fields to `serviceUrls` table:
     - `emailAlertsEnabled`: Enable/disable alerts per URL
     - `notifyOnDown`: Send email when service goes down
     - `notifyOnRecovery`: Send email when service recovers
     - `lastAlertTimestamp`: Rate limiting (15-minute cooldown)
   - Added notification fields to `users` table:
     - `notificationEmail`: Email address for alerts
     - `emailNotificationsEnabled`: Global enable/disable toggle

2. **Email Notification Service** ([convex/emails.ts](convex/emails.ts))
   - `sendDownAlert`: Sends formatted email when a service goes down
   - `sendRecoveryAlert`: Sends formatted email when a service recovers
   - Professional HTML email templates with service details

3. **Uptime Check Logic** ([convex/uptime.ts](convex/uptime.ts))
   - Detects status changes (up → down, down → up)
   - Checks user preferences and per-URL alert settings
   - Implements 15-minute cooldown to prevent alert spam
   - Calculates downtime duration for recovery emails

4. **User Preferences** ([convex/users.ts](convex/users.ts))
   - Added mutations to save email preferences
   - Query functions to retrieve email settings

5. **Service URL Mutations** ([convex/serviceUrls.ts](convex/serviceUrls.ts))
   - Updated `create` and `update` to save email alert preferences

### Frontend Changes

1. **User Settings UI** ([src/routes/dashboard/+page.svelte](src/routes/dashboard/+page.svelte))
   - Added email notification section in settings dropdown
   - Toggle for enabling/disabling email alerts globally
   - Input field for notification email address
   - Works in both normal and startpage modes

2. **Service Configuration** ([src/lib/components/ServiceModal.svelte](src/lib/components/ServiceModal.svelte))
   - Added "Alert" checkbox column for each URL
   - Expandable alert options when enabled:
     - Checkbox: "Notify when down"
     - Checkbox: "Notify when recovered"
   - Email icon (📧) shows when alerts are enabled

## Setup Instructions

### Step 1: Set Up Resend Account (If Not Already Done)

1. Go to [https://resend.com/](https://resend.com/)
2. Sign up for a free account (3,000 emails/month)
3. Verify your email address
4. Navigate to API Keys section
5. Create a new API key

### Step 2: Configure Environment Variables

#### For Convex Cloud Deployment:

1. Go to your Convex dashboard: [https://dashboard.convex.dev](https://dashboard.convex.dev)
2. Select your project
3. Navigate to Settings → Environment Variables
4. Add a new environment variable:
   - **Key**: `RESEND_API_KEY`
   - **Value**: `your_resend_api_key_here`
5. Click "Save"

#### For Local Development:

1. The API key is set in Convex environment variables only (not in local files for security)

### Step 3: Install Dependencies

Run the package manager to install the Resend SDK:

```bash
npm install
# or
pnpm install
# or
yarn install
```

### Step 4: Deploy/Push Changes

If using Convex cloud:

```bash
npx convex dev
# or
npx convex deploy
```

The schema changes and new functions will be automatically deployed.

## How to Use Email Alerts

### 1. Configure Your Email (User Level)

1. Click the ⚙️ Settings icon in the top-right corner
2. Scroll down to "Email Notifications" section
3. Toggle "Enable Alerts" ON
4. Enter your email address (e.g., `your@email.com`)
5. Click outside the settings to save

### 2. Enable Alerts Per Service URL

1. Edit a service (click on a service card, then edit icon)
2. Find the URL you want to monitor
3. Check the "Alert" checkbox (📧 icon will appear)
4. Configure alert preferences:
   - ✅ **Notify when down** - Get email when service stops responding
   - ✅ **Notify when recovered** - Get email when service comes back online
5. Click "Save"

### 3. Test the Alerts

**To test a down alert:**
1. Enable alerts for a URL (as above)
2. Temporarily break the service or change the URL to an invalid one
3. Wait for the next uptime check (1-5 minutes depending on ping interval)
4. You should receive an email with:
   - Service name
   - URL label
   - Error message or status code
   - Timestamp

**To test a recovery alert:**
1. After receiving a down alert, fix the service or restore the correct URL
2. Wait for the next uptime check
3. You should receive a recovery email with:
   - Service name
   - URL label
   - Response time
   - Downtime duration
   - Recovery timestamp

## Email Alert Features

### Rate Limiting
- **15-minute cooldown** between alerts per URL
- Prevents inbox flooding if service is flapping

### Alert Types
1. **Down Alert (🔴)**
   - Red-themed email
   - Shows error message or HTTP status code
   - Sent when service becomes unreachable

2. **Recovery Alert (✅)**
   - Green-themed email
   - Shows response time and downtime duration
   - Sent when service comes back online

### Sender Information
- **From**: SelfHost Monitor <onboarding@resend.dev>
- **Note**: Free Resend accounts use `onboarding@resend.dev` as sender
- To use a custom domain (e.g., `alerts@yourdomain.com`), you need to:
  1. Verify your domain in Resend dashboard
  2. Update the `from` field in [convex/emails.ts](convex/emails.ts)

## Troubleshooting

### Emails Not Sending

1. **Check Convex Environment Variable**
   - Ensure `RESEND_API_KEY` is set in Convex dashboard
   - Restart your Convex deployment after adding it

2. **Check User Settings**
   - Verify email notifications are enabled globally
   - Verify you entered a valid email address
   - Check your spam/junk folder

3. **Check Service URL Settings**
   - Verify the URL has "Alert" checkbox enabled
   - Verify at least one notification type is checked (down/recovery)

4. **Check Logs**
   - Open Convex dashboard → Logs
   - Look for error messages from `emails.ts` functions
   - Check for "RESEND_API_KEY not set" errors

5. **Verify Service Status Changed**
   - Alerts only send when status changes (up→down or down→up)
   - Check uptime history in the details modal

### Rate Limiting Issues

If you're not receiving alerts:
- Check `lastAlertTimestamp` in database
- 15-minute cooldown may be active
- Wait and try again after cooldown period

### API Key Issues

If you get API key errors:
- Verify the key is correct (no extra spaces)
- Check if key has been revoked in Resend dashboard
- Generate a new API key if needed

## Email Template Customization

To customize email templates, edit [convex/emails.ts](convex/emails.ts):

```typescript
// Change sender (requires domain verification)
from: "SelfHost Monitor <alerts@yourdomain.com>",

// Modify email subject
subject: `🔴 Alert: ${args.serviceName}`,

// Edit HTML template
html: `...your custom HTML...`
```

## Monitoring Email Usage

1. Go to [https://resend.com/emails](https://resend.com/emails)
2. View sent emails, delivery status, and usage stats
3. Free tier: 3,000 emails/month (100/day)

## Security Notes

- ⚠️ **NEVER commit API keys to git**
- API keys are stored securely in Convex environment variables
- Email addresses are stored in the database (not encrypted)
- Consider encrypting notification emails if handling sensitive data

## Next Steps

1. **Custom Domain**: Set up domain verification in Resend for professional sender address
2. **Email Templates**: Customize HTML templates to match your branding
3. **Additional Alerts**: Add more alert types (slow response, SSL expiry, etc.)
4. **Alert Channels**: Add Discord, Slack, Telegram webhooks as alternatives

## Support

If you encounter issues:
1. Check Convex logs for errors
2. Verify Resend dashboard for delivery failures
3. Test with a simple service URL first
4. Check all configuration steps above

---

**Free Tier Limits:**
- Resend: 3,000 emails/month (100/day)
- No credit card required
- Perfect for monitoring 10-50 services
