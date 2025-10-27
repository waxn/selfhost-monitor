# How to Enable Email Alerts - Step by Step

## Important: You MUST Click "Update" to Save!

The checkbox changes are **NOT** saved automatically. You must click the "Update" button!

## Steps to Enable Email Alerts:

### 1. Configure Your Email (One Time Setup)
1. Click the **⚙️ Settings** icon (top right)
2. Scroll to **"Email Notifications"** section
3. Toggle **"Enable Alerts"** to ON (should turn orange)
4. Enter your email address
5. Click outside the settings dropdown (it auto-saves)

### 2. Enable Alerts for a Service URL
1. Click on a service card to view it
2. Click the **Edit** icon (pencil)
3. Find the URL you want to monitor
4. ✅ **Check the "Alert" checkbox** (📧 emoji will appear)
5. The "Notify when down" and "Notify when recovered" options will appear below
6. Make sure both are checked
7. **⚠️ IMPORTANT: Click the "Update" button at the bottom!**

### 3. Verify It Saved
1. Close the modal
2. Re-open the service to edit
3. The "Alert" checkbox should still be checked
4. The 📧 emoji should be visible

## Testing

### Quick Test:
1. Edit a service
2. Check the "Alert" checkbox for a URL
3. Watch the browser console (F12)
4. You should see: `Alert checkbox changed for [name]: true`
5. Click "Update"
6. You should see: `Updating URL: [name] emailAlertsEnabled: true`
7. Close and re-open - checkbox should still be checked

### Full Email Test:
Once you've saved the alert settings:
1. Wait for a service to actually go down (or temporarily break a URL)
2. Check Convex logs for `[Email Debug]` messages
3. Should receive email within 5 minutes

## Troubleshooting

### "The checkbox disappears when I click it"
**Problem:** You're not clicking the "Update" button.

**Solution:** After checking the checkbox, scroll down and click "Update" or "Create".

### "I clicked Update but it's not saving"
1. Open browser console (F12)
2. Look for error messages
3. Check if you see: `Updating URL: ... emailAlertsEnabled: true`
4. If you see `false` instead of `true`, the checkbox state didn't change

### "The checkbox is checked but emails don't send"
1. Verify global email settings (Step 1 above)
2. Check Convex logs for `[Email Debug]` messages
3. See [DEBUG_EMAIL_ALERTS.md](DEBUG_EMAIL_ALERTS.md)

## Visual Indicators

When email alerts are properly enabled, you should see:
- ✓ Checkbox is checked (orange background)
- 📧 Email emoji appears next to the checkbox
- Alert options panel appears below ("Notify when down", "Notify when recovered")

## Common Mistakes

1. ❌ Checking the checkbox but not clicking "Update"
2. ❌ Enabling global email notifications but not per-URL alerts
3. ❌ Enabling per-URL alerts but not global email notifications
4. ❌ Forgetting to enter an email address in Settings
