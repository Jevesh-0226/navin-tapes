# Deployment Setup Guide

## After First Deployment to Vercel

### Option 1: Automatic Initialization (Recommended)
Just reload the page! The app will automatically:
1. Check if database is initialized
2. Initialize materials if needed
3. All endpoints should start working

This happens automatically when you first load the app.

### Option 2: Manual Initialization via API
Call the initialization endpoint:

```bash
curl -X POST https://navin-tapes.vercel.app/api/init
```

Or from your browser:
```javascript
fetch('https://navin-tapes.vercel.app/api/init', { method: 'POST' })
  .then(r => r.json())
  .then(d => console.log(d))
```

### Option 3: Local Development Setup
Run this command from your local machine:

```bash
npm run prisma:setup
```

This runs:
1. `prisma db push` - Apply database schema
2. `prisma generate` - Generate Prisma client
3. `prisma db seed` - Populate initial materials

## Database Status

Check database status anytime:
```bash
curl https://navin-tapes.vercel.app/api/init
```

Returns:
```json
{
  "success": true,
  "database": {
    "materials": 5,
    "purchases": 0,
    "sales": 0,
    "products": 0
  }
}
```

## Troubleshooting

### Materials Dropdown Still Empty
1. **Reload the page** - Wait 10-15 seconds for auto-initialization
2. **Manually trigger init:** Visit `https://navin-tapes.vercel.app/api/init` in your browser (GET request shows status)
3. **POST request:** `curl -X POST https://navin-tapes.vercel.app/api/init`
4. **Check logs:** Go to Vercel dashboard → Deployments → Function logs

### Database Connection Errors
1. Verify `DATABASE_URL` environment variable is set in Vercel
2. Check that Supabase project is active
3. Ensure database credentials are correct

### Still Having Issues?
1. Run `npm run prisma:setup` locally to update the database
2. Push changes to GitHub
3. Vercel will redeploy automatically
4. Reload the deployed app

## Build Process
- ✅ Builds successfully without database connections
- ✅ Auto-initializes on first app load
- ✅ Handles data safely (upsert prevents duplicates)
- ✅ No manual setup required after deployment

