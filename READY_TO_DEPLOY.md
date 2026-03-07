# 🚀 MamaChef AI - Deployment Ready

## ✅ What's Been Done

### Code Changes
1. ✅ **Port Updated**: Changed default port from 5000 → 3000 (Emergent standard)
2. ✅ **Recipe Links Enhanced**: Added YouTube video + cooking blog links
3. ✅ **API Integration**: Integrated YouTube Data API v3 + Google Custom Search
4. ✅ **Dependencies**: Installed axios for API calls
5. ✅ **Environment Setup**: Created .env file with all required variables

### Files Modified
- `/app/server/index.ts` - Port changed to 3000
- `/app/server/routes.ts` - Added real URL fetching
- `/app/server/recipeSearch.ts` - New file for YouTube/blog search
- `/app/shared/schema.ts` - Added videoUrl and blogUrl fields
- `/app/client/src/pages/home.tsx` - Updated UI with video/blog buttons
- `/app/client/src/pages/history.tsx` - Updated UI with video/blog buttons
- `/app/.env` - Created with placeholders
- `/app/.env.example` - Created example file

## 🔧 Required Before Deployment

### 1. **Database Setup** (CRITICAL)
The app uses PostgreSQL. You need to provide a DATABASE_URL connection string.

**Quick Option - Neon (2 minutes, free):**
```
1. Visit: https://neon.tech
2. Sign up → Create project
3. Copy connection string
4. Replace DATABASE_URL in /app/.env
```

### 2. **API Keys** (from Emergent/Platform)
Update in `/app/.env`:
- `AI_INTEGRATIONS_OPENAI_API_KEY` - Your OpenAI key
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - Usually set by platform

### 3. **Optional API Keys** (for enhanced recipe links)
- `YOUTUBE_API_KEY` - YouTube Data API v3
- `GOOGLE_SEARCH_API_KEY` - Google Custom Search  
- `GOOGLE_SEARCH_ENGINE_ID` - Custom Search Engine ID

*Without these, app still works but shows Google search fallback*

## 🎯 Deployment Commands

### Build the application:
```bash
cd /app
yarn build
```

### Run in production:
```bash
cd /app
export $(cat .env | xargs)
yarn start
```

### Or with PM2 (recommended):
```bash
cd /app
pm2 start dist/index.cjs --name mamachef
pm2 save
```

## 📋 Environment Variables Checklist

Copy this to your deployment platform:

```bash
# REQUIRED
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]
AI_INTEGRATIONS_OPENAI_API_KEY=your_key
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1

# OPTIONAL (for enhanced features)
YOUTUBE_API_KEY=your_youtube_key
GOOGLE_SEARCH_API_KEY=your_google_key
GOOGLE_SEARCH_ENGINE_ID=your_cx_id
```

## 🏗️ Architecture

```
Port 3000 → Express.js Server
              ├─ Serves React frontend (static)
              ├─ API routes (/api/recipes)
              ├─ OpenAI integration (recipe generation)
              └─ YouTube + Google Search (recipe links)
                   ↓
              PostgreSQL Database (external)
```

## 🧪 Testing After Deployment

### 1. Health Check:
```bash
curl http://localhost:3000/
```

### 2. Test Recipe API:
```bash
curl http://localhost:3000/api/recipes
```

### 3. Test Recipe Generation:
```bash
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients": ["tomato", "pasta", "basil"],
    "preferences": {
      "cuisine": "Italian",
      "familySize": "3-4"
    }
  }'
```

## 📱 Features Overview

**Current Features:**
- ✅ AI recipe generation with OpenAI GPT-5.1
- ✅ Ingredient-based recipe search
- ✅ Cuisine and dietary preferences
- ✅ Recipe history tracking
- ✅ **NEW**: Direct YouTube video links (most popular + recent)
- ✅ **NEW**: Direct cooking blog links (high-quality sites)
- ✅ Nutritional information
- ✅ Responsive UI with Tailwind CSS

**Fallback Behavior:**
- Without YouTube/Google API keys → Shows Google search button
- Database connection fails → App won't start (needs DATABASE_URL)
- OpenAI API fails → Returns error message to user

## 📚 Documentation Files

1. `/app/DEPLOYMENT_GUIDE.md` - Detailed deployment instructions
2. `/app/EMERGENT_SETUP.md` - Emergent-specific setup guide
3. `/app/READY_TO_DEPLOY.md` - This file
4. `/app/.env.example` - Environment variable template
5. `/app/README.md` - Original project README

## 🆘 Troubleshooting

**Error: "DATABASE_URL must be set"**
→ Update DATABASE_URL in .env with actual PostgreSQL connection string

**Error: "Port 3000 already in use"**
→ Kill existing process: `lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9`

**YouTube/Blog links not showing**
→ Optional feature - add API keys or accept Google search fallback

**Build fails**
→ Run: `rm -rf node_modules && yarn install && yarn build`

## 🎉 You're Ready!

Once you've updated the environment variables (especially DATABASE_URL), the app is ready to deploy!

**Quick Deploy:**
```bash
# 1. Update .env with real values
nano /app/.env

# 2. Build
cd /app && yarn build

# 3. Start
yarn start
```

App will be available at: `http://localhost:3000`
