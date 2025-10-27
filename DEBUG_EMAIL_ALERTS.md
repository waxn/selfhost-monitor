# Debugging Email Alerts Not Sending

Email alerts require several conditions to be met. Here's how to debug why they're not sending:

## Step 1: Check Convex Logs

1. Go to https://dashboard.convex.dev
2. Select your project
3. Click **"Logs"** in sidebar
4. Look for `[Email Debug]` messages

The logs will tell you exactly where the process is failing:

### Expected Log Flow (When Working):
```
[Email Debug] Checking email conditions for URL: My Service
[Email Debug] emailAlertsEnabled: true userId: j57abc123...
[Email Debug] Status changed: true (lastCheck.isUp: true current isUp: false)
[Email Debug] shouldAlert returned: true
[Email Debug] User found: true notificationEmail: your@email.com emailNotificationsEnabled: true
[Email Debug] Service found: true name: My Service
[Email Debug] Sending DOWN alert to: your@email.com
[Email Debug] Email sent successfully, updating lastAlertTimestamp
```

### Common Failure Points:

#### ❌ "Skipping email - alerts not enabled or no userId"
**Problem:** The URL doesn't have email alerts enabled or is missing a userId.

**Fix:**
1. Edit the service
2. Check the "Alert" checkbox for the URL (📧 icon should appear)
3. Make sure the service is associated with your user account

#### ❌ "Status changed: false"
**Problem:** The service status hasn't actually changed (still up or still down).

**Why:** Email alerts only send when status **changes** from up→down or down→up.

**Fix:** This is expected behavior! The first check won't send an alert. Wait for the next check cycle when the status actually changes.

#### ❌ "shouldAlert returned: false"
**Possible reasons:**
1. **Rate limiting active** - 15-minute cooldown between alerts
2. **Notification preferences** - "Notify when down" is unchecked
3. **Status hasn't changed** - Still in same state as before

**Check:** Look for earlier log lines that say why it returned false

#### ❌ "Skipping email - missing required fields"
**Problem:** One or more of these is missing:
- User not found
- User has no notification email set
- User has email notifications disabled globally
- Service not found

**Fix:**
1. Go to Settings (⚙️ icon)
2. Scroll to "Email Notifications"
3. Toggle "Enable Alerts" ON
4. Enter your email address
5. Save

## Step 2: Verify All Settings

### User Settings (Global)
1. Click ⚙️ Settings icon
2. Check "Email Notifications" section:
   - ✅ "Enable Alerts" toggle is ON
   - ✅ Email address is entered
   - ✅ Email address is correct

### Service URL Settings (Per-URL)
1. Edit the service
2. For each URL you want to monitor:
   - ✅ "Alert" checkbox is checked (📧 icon visible)
   - ✅ "Notify when down" is checked
   - ✅ "Notify when recovered" is checked (optional)

### Environment Variable (In Convex Dashboard)
1. Go to https://dashboard.convex.dev
2. Settings → Environment Variables
3. Verify `RESEND_API_KEY` exists and is correct

## Step 3: Test the Email Function Directly

Bypass uptime checks and test email directly:

1. Go to https://dashboard.convex.dev
2. Click "Functions"
3. Find `testEmail:testEmailAlert`
4. Click "Run Function"
5. Enter:
   ```json
   {
     "recipientEmail": "your@email.com",
     "testType": "down"
   }
   ```
6. Click "Run"
7. Check your email (and spam folder!)

If this works, the problem is with your URL/service configuration, not the email system.

## Step 4: Use the Debug Query

I've created a debug query to check all conditions for a specific URL:

1. Go to https://dashboard.convex.dev
2. Click "Functions"
3. Find `debugEmail:checkEmailConditions`
4. Enter your service URL ID:
   ```json
   {
     "serviceUrlId": "your_url_id_here"
   }
   ```
5. Check the output - it will tell you exactly what's missing

## Step 5: Check for First-Time Setup Issues

### If this is the first time testing:
- **Status changes take time** - The service needs to go down AFTER being up, or come up AFTER being down
- **Check interval** - Default is 5 minutes. Set it to 1 minute for testing
- **Cooldown period** - 15 minutes between alerts. First alert might be delayed

### Quick Test Method:
1. Create a new service with a URL that's **currently working**
2. Enable email alerts
3. Wait for one successful uptime check (5 minutes)
4. **Break the URL** (change it to something invalid)
5. Wait 5 minutes for next check
6. You should receive a down alert

## Common Checklist

Run through this checklist:

- [ ] Email address entered in Settings
- [ ] "Enable Alerts" toggle is ON in Settings
- [ ] "Alert" checkbox is checked for the URL
- [ ] "Notify when down" is checked
- [ ] Service has actually gone down (status changed from up to down)
- [ ] 15-minute cooldown has passed since last alert
- [ ] `RESEND_API_KEY` is set in Convex Dashboard
- [ ] Domain `hlm.waxnflaxnai.com` is verified in Resend
- [ ] Checked spam folder

## Still Not Working?

Share these with me:
1. Screenshot of Convex logs showing `[Email Debug]` messages
2. Screenshot of your Settings → Email Notifications section
3. Screenshot of the service modal showing the URL with Alert checkbox
4. Output from `debugEmail:checkEmailConditions` function

---

**Note:** The debugging logs are very verbose. Once everything is working, we can remove them to clean up the logs.
