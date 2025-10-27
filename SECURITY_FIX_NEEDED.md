# 🚨 URGENT: API Key Exposed in Git History

## What Happened
Your Resend API key `re_CVyeubix_EBy5vgobQpxzkrUYUEQJGFBN` was committed to Git in these files:
- `EMAIL_ALERTS_SETUP.md`
- `TROUBLESHOOTING_500.md`

Even though these files have been fixed, the key is still in your Git history and potentially on GitHub.

## Immediate Actions Required

### 1. Revoke the Exposed API Key ⚠️ CRITICAL
1. Go to https://resend.com/api-keys
2. Find the key `re_CVyeubix_EBy5vgobQpxzkrUYUEQJGFBN`
3. Click "Delete" or "Revoke"
4. Create a NEW API key

### 2. Update Convex Environment Variable
1. Go to https://dashboard.convex.dev
2. Navigate to Settings → Environment Variables
3. Update `RESEND_API_KEY` with your NEW key
4. Click "Save"

### 3. Clean Git History (Optional but Recommended)

If you've pushed to GitHub, you need to remove the key from history:

#### Option A: Use BFG Repo-Cleaner (Recommended)
```bash
# Install BFG
brew install bfg  # macOS
# or download from: https://rtyley.github.io/bfg-repo-cleaner/

# Backup your repo first!
cp -r . ../selfhost-monitor-backup

# Remove the API key from all history
bfg --replace-text <(echo 're_CVyeubix_EBy5vgobQpxzkrUYUEQJGFBN==>***REMOVED***')

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: This rewrites history!)
git push --force
```

#### Option B: Filter-branch (Manual)
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch EMAIL_ALERTS_SETUP.md TROUBLESHOOTING_500.md" \
  --prune-empty --tag-name-filter cat -- --all

git push --force
```

#### Option C: Just Move Forward (Simplest)
If this is a new repo without much history:
```bash
# The files are already fixed in current commit
# Just make sure the old key is revoked
# GitHub will still show it in history, but it won't work
```

### 4. Verify Security

✅ Checklist:
- [ ] Old API key revoked in Resend
- [ ] New API key created
- [ ] New key set in Convex environment variables (NOT in files)
- [ ] Tested that emails work with new key
- [ ] `.gitignore` includes `.env*` files
- [ ] No API keys in any tracked files

## Prevention Going Forward

### Never Commit Secrets
Your `.gitignore` is already configured correctly:
```
.env
.env.*
!.env.example
```

This means:
- ✅ `.env` files are ignored
- ✅ `.env.local` is ignored
- ✅ Only `.env.example` is tracked (with placeholder values)

### Store Secrets Only In:
1. **Convex Dashboard** → Environment Variables (for production)
2. **Local `.env` files** (for development, never commit these)

### Documentation Guidelines
- ✅ Use placeholders: `your_api_key_here`
- ❌ Never use actual keys in docs
- ❌ Never paste keys in issues/PRs
- ❌ Never include keys in screenshots

## Test After Fix

Run this to verify everything works:
```bash
# Should find NO API keys in tracked files
git grep -i "re_[A-Za-z0-9]"

# Should return empty or only .env.example
git ls-files | xargs grep -l "RESEND_API_KEY"
```

## Questions?

If unsure about any step, ask before proceeding with git history rewrites!

---

**Delete this file after completing all steps above.**
