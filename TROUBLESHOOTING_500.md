# Troubleshooting 500 Error - Email Alerts

## Step 1: Check Convex Logs

This is the most important step!

1. Go to https://dashboard.convex.dev
2. Select your project
3. Click **"Logs"** in the left sidebar
4. Look for recent errors (red entries)
5. Click on the error to see the full stack trace

**Common errors you might see:**

- `RESEND_API_KEY not set` → Environment variable not configured
- `Module not found: resend` → Package not installed in Convex
- `Invalid API key` → Wrong API key or not activated
- `Domain not verified` → Using custom domain without verification

## Step 2: Verify Environment Variable

**Critical**: The API key MUST be set in Convex Dashboard, not just locally.

1. Go to https://dashboard.convex.dev
2. Settings → Environment Variables
3. Check if `RESEND_API_KEY` exists
4. Value should be: `re_CVyeubix_EBy5vgobQpxzkrUYUEQJGFBN`
5. If missing, click "Add Environment Variable"

**After adding the variable, you MUST redeploy:**
```bash
npx convex deploy
```

## Step 3: Check Resend Package Installation

Convex needs to install the `resend` package. Check if it's in package.json dependencies (not devDependencies):

```json
"dependencies": {
  "resend": "^4.0.0"
}
```

If it's missing or in wrong place, the import will fail.

## Step 4: Test Email Domain

The email is currently set to use: `alerts@hlm.waxnflaxnai.com`

**This will fail unless the domain is verified in Resend!**

To fix immediately:
1. Edit `convex/emails.ts`
2. Change line 37 and 176 from:
   ```typescript
   from: "SelfHost Monitor <alerts@hlm.waxnflaxnai.com>",
   ```
   To:
   ```typescript
   from: "SelfHost Monitor <onboarding@resend.dev>",
   ```
3. Redeploy: `npx convex dev`

## Step 5: Check Browser Console

Open browser DevTools (F12) and check:
1. Console tab for JavaScript errors
2. Network tab → Filter by "Fetch/XHR"
3. Find the failed request
4. Click on it → "Response" tab
5. Look for error details

## Step 6: Manual Test in Convex Dashboard

Bypass the UI and test directly:

1. Go to https://dashboard.convex.dev
2. Click "Functions" in left sidebar
3. Find `testEmail:testEmailAlert`
4. Click "Run Function"
5. Enter:
   ```json
   {
     "recipientEmail": "your-actual-email@example.com",
     "testType": "down"
   }
   ```
6. Click "Run"
7. Check the response and logs

## Most Likely Causes (in order):

### 1. Environment Variable Not Set ⚠️
**Fix**: Add `RESEND_API_KEY` in Convex Dashboard → Settings → Environment Variables

### 2. Using Unverified Domain ⚠️
**Fix**: Change sender email to `onboarding@resend.dev` in `convex/emails.ts`

### 3. Package Not Installed
**Fix**: Ensure `resend` is in dependencies, run `npm install`, then `npx convex deploy`

### 4. API Key Invalid
**Fix**: Verify key in Resend dashboard, regenerate if needed

## Quick Fix Script

Try this to fix the most common issues:

1. **Change sender to verified email:**
   ```bash
   # Edit convex/emails.ts and change both occurrences
   sed -i 's/alerts@hlm.waxnflaxnai.com/onboarding@resend.dev/g' convex/emails.ts
   ```

2. **Ensure package is installed:**
   ```bash
   npm install
   ```

3. **Deploy:**
   ```bash
   npx convex deploy
   ```

4. **Set environment variable in Convex Dashboard** (must be done manually)

5. **Test again**

## What to Share if Still Broken

If it's still not working, share:
1. Screenshot of Convex Logs (the error message)
2. Output of: `cat convex/emails.ts | grep "from:"`
3. Screenshot of Convex Dashboard → Settings → Environment Variables
4. Browser console errors

