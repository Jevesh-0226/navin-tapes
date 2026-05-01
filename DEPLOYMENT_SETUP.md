# Deployment Setup Guide

## After first deployment to Vercel, run these steps:

### Step 1: Apply Database Migrations
Run this command from your local machine:

```bash
npm run prisma:push
```

This will apply all database migrations to your Supabase database.

### Step 2: Seed the Database (Optional - app will auto-seed on first use)
```bash
npm run prisma:seed
```

### What Happens Automatically:
- When you first access the `/api/material` endpoint, it will automatically create the materials if they don't exist
- The material dropdown will populate on first page load

### If Issues Persist:

1. **Check Database Connection:**
   - Verify `DATABASE_URL` is correct in your `.env` file
   - Check that the Supabase project is active

2. **Manual Database Reset:**
   ```bash
   npm run prisma:push -- --force-reset
   npm run prisma:seed
   ```

3. **Check Vercel Logs:**
   - Go to Vercel dashboard → Deployments → Check Function logs
   - Look for any database connection errors

## Quick Setup Command
If you want to do everything at once:

```bash
npm run prisma:setup
```

This runs:
1. `prisma db push` - Apply migrations
2. `prisma generate` - Generate Prisma client  
3. `prisma db seed` - Populate initial data
