# Emergent Deployment Setup Guide

## Quick Setup Steps

### 1. Database Setup (REQUIRED)

This app uses PostgreSQL. Since Emergent provides MongoDB, you need an external PostgreSQL database.

**Recommended: Neon PostgreSQL (Free Tier)**

1. Go to https://neon.tech
2. Sign up for free account
3. Create a new project
4. Copy the connection string (looks like: `postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require`)
5. Add to `.env` file as `DATABASE_URL`

**Alternative Options:**
- Supabase: https://supabase.com (free tier)
- Railway: https://railway.app (free trial)
- ElephantSQL: https://www.elephantsql.com (free tier)

### 2. Update Supervisor Configuration

The current supervisor config is incorrect. It needs to be updated to run this Node.js monorepo.

**Required Supervisor Config** (`/etc/supervisor/conf.d/supervisord.conf`):

```ini
# UPDATED CONFIG FOR NODE.JS EXPRESS + REACT MONOREPO
[program:nodejs]
command=yarn start
directory=/app
autostart=true
autorestart=true
environment=NODE_ENV="production",PORT="3000"
stderr_logfile=/var/log/supervisor/nodejs.err.log
stdout_logfile=/var/log/supervisor/nodejs.out.log
stopsignal=TERM
stopwaitsecs=30
stopasgroup=true
killasgroup=true
```

**To update:**
```bash
# Backup current config
sudo cp /etc/supervisor/conf.d/supervisord.conf /etc/supervisor/conf.d/supervisord.conf.backup

# Edit the file (replace entire contents with above config)
sudo nano /etc/supervisor/conf.d/supervisord.conf

# Reload supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl restart all
```

### 3. Environment Variables

Update the `/app/.env` file with your actual values:

```bash
# Required
DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require
AI_INTEGRATIONS_OPENAI_API_KEY=your_openai_key_here
PORT=3000

# Optional (for YouTube and blog recipe links)
YOUTUBE_API_KEY=your_youtube_api_key
GOOGLE_SEARCH_API_KEY=your_google_search_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
```

### 4. Database Migration

Run database migrations to create tables:

```bash
cd /app
yarn db:push
```

### 5. Build and Start

```bash
cd /app
yarn build
yarn start
```

Or with supervisor (after config update):
```bash
sudo supervisorctl restart nodejs
```

## Environment Variables Reference

| Variable | Required | Description | Where to Get |
|----------|----------|-------------|--------------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | Neon.tech, Supabase, etc. |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | ✅ Yes | OpenAI API key | OpenAI Dashboard or Emergent |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | ✅ Yes | OpenAI base URL | Usually `https://api.openai.com/v1` |
| `PORT` | ✅ Yes | Server port (must be 3000 for Emergent) | Set to `3000` |
| `NODE_ENV` | ✅ Yes | Environment mode | Set to `production` |
| `YOUTUBE_API_KEY` | ❌ No | YouTube Data API v3 key | [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_SEARCH_API_KEY` | ❌ No | Google Custom Search API key | [Google Developers](https://developers.google.com/custom-search) |
| `GOOGLE_SEARCH_ENGINE_ID` | ❌ No | Custom Search Engine ID | [Programmable Search](https://programmablesearchengine.google.com/) |

## Verification Steps

### 1. Check if database is connected:
```bash
cd /app
NODE_ENV=production node -e "require('./dist/index.cjs')" 2>&1 | grep -i "database\|error" | head -20
```

### 2. Check if server is running:
```bash
ps aux | grep "node.*dist/index.cjs"
```

### 3. Check logs:
```bash
# If using supervisor
tail -f /var/log/supervisor/nodejs.*.log

# If running manually
tail -f /tmp/app.log
```

### 4. Test the application:
```bash
# Health check
curl http://localhost:3000/

# Test API
curl http://localhost:3000/api/recipes
```

## Troubleshooting

### Issue: "DATABASE_URL must be set"
**Solution:** Add DATABASE_URL to .env file with your PostgreSQL connection string

### Issue: "Cannot find module"
**Solution:** Run `yarn install` and `yarn build` again

### Issue: "Port already in use"
**Solution:** 
```bash
# Find process using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```

### Issue: Supervisor config not updating
**Solution:**
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl status
```

### Issue: YouTube/Blog links not showing
**Solution:** This is optional. Check:
1. Are YOUTUBE_API_KEY and GOOGLE_SEARCH_API_KEY set?
2. Check logs for API errors
3. Verify API keys are valid and have quota remaining
4. App will fallback to Google search if APIs aren't configured

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Client Browser                   │
│  (React App + API calls)                │
└─────────────────┬───────────────────────┘
                  │ Port 3000
                  ▼
┌─────────────────────────────────────────┐
│      Express.js Server (Node.js)        │
│  • Serves React frontend (static)       │
│  • API routes (/api/*)                  │
│  • OpenAI integration                   │
│  • YouTube + Google Search APIs         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    PostgreSQL Database (External)       │
│  • Stores recipes, suggestions          │
│  • Drizzle ORM                          │
└─────────────────────────────────────────┘
```

## Files Changed for Deployment

✅ `/app/server/index.ts` - Updated default port to 3000
✅ `/app/.env` - Created with all required variables
✅ `/app/.env.example` - Created example file
✅ `/app/DEPLOYMENT_GUIDE.md` - Created comprehensive guide
✅ `/app/EMERGENT_SETUP.md` - This file

## Support

For deployment issues:
1. Check server logs first
2. Verify all environment variables are set
3. Ensure database is accessible
4. Check Emergent platform documentation

App will work without YouTube/Google Search API keys - it will just show Google search fallback buttons.
