# VERCEL ENVIRONMENT SETUP

## Critical: Set Environment Variables in Vercel Dashboard

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Click on your `navin-tapes` project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add DATABASE_URL
1. Click **Add New**
2. **Name:** `DATABASE_URL`
3. **Value:** (Copy from your local `.env` file)
   ```
   postgresql://postgres:gxmTzMvhQHD5TOXd@db.ujfpblqlwqpdlvlargbf.supabase.co:5432/postgres?sslmode=require
   ```
4. Select all environments: ✓ Production ✓ Preview ✓ Development
5. Click **Save**

### Step 3: Redeploy After Setting Variables
Once environment variables are set:
1. Go to **Deployments**
2. Find the latest failed deployment
3. Click the **...** menu → **Redeploy**
4. OR push a new commit to main to trigger auto-deploy

### Step 4: Verify Deployment
After redeploy:
1. Visit https://navin-tapes.vercel.app/api/init
2. You should see: `{"success":true,"message":"Database initialized successfully",...}`
3. Refresh the app - materials should appear in dropdowns

## Complete Setup Checklist

```
☐ Add DATABASE_URL to Vercel Environment Variables
☐ Redeploy project in Vercel
☐ Wait 2-3 minutes for deployment
☐ Visit https://navin-tapes.vercel.app/api/init (to initialize)
☐ Reload https://navin-tapes.vercel.app/purchase
☐ Verify Materials dropdown is populated
```

## If Still Not Working

### Quick Troubleshooting
1. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Deployments → Functions
   - Look for `/api/material` or `/api/init` logs
   - Check for "DATABASE_URL" or "connection" errors

2. **Verify DATABASE_URL is Correct:**
   - Copy exact value from local `.env`
   - No spaces before/after
   - Include `?sslmode=require`

3. **Force Rebuild:**
   - Go to Vercel Settings → Git
   - Click "Redeploy" on latest deployment

4. **Last Resort - Manual Database Setup:**
   - Run locally: `npm run prisma:setup`
   - This updates your Supabase database directly
   - Your Vercel deployment will then work

## Permanent Fix
After setting environment variables and redeploying once:
- App will auto-initialize on first load
- All future deployments will just work
- No manual setup needed after that
