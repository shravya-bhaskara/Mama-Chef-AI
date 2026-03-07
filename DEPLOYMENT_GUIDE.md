# MamaChef AI - Recipe Enhancement Update

## What's New

Your MamaChef AI app now provides **direct links to cooking content** instead of Google search links!

For each recipe suggestion, users will now get:
- 🎥 **YouTube Video Link** - Most popular and recent cooking video
- 📖 **Cooking Blog Article Link** - High-quality recipe from popular cooking websites

## Changes Made

### Backend Updates
1. **New File**: `/app/server/recipeSearch.ts`
   - `searchYouTubeRecipe()` - Fetches popular YouTube cooking videos
   - `searchCookingBlog()` - Finds recipes from top cooking blogs
   
2. **Updated**: `/app/server/routes.ts`
   - Now fetches real YouTube and blog URLs for each recipe
   - Runs parallel searches for better performance

3. **Updated**: `/app/shared/schema.ts`
   - Added `videoUrl` and `blogUrl` fields to recipe suggestions

### Frontend Updates
1. **Updated**: `/app/client/src/pages/home.tsx`
   - New "Watch Video" button (red) for YouTube links
   - New "Read Recipe" button (blue) for blog links
   - Falls back to Google search if APIs not configured

2. **Updated**: `/app/client/src/pages/history.tsx`
   - Same button improvements for historical recipes

### Dependencies
- Added `axios` for API calls

## Required API Keys

To enable the new features, you need two API keys:

### 1. YouTube Data API v3 Key
**How to get it:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "YouTube Data API v3"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the API key

**Free Quota:** 10,000 units/day (approximately 100-200 searches)

### 2. Google Custom Search API
**How to get it:**
1. Go to [Google Custom Search API](https://developers.google.com/custom-search/v1/overview)
2. Click "Get a Key" and create/select a project
3. Copy the API key
4. Create a Custom Search Engine at [Programmable Search Engine](https://programmablesearchengine.google.com/)
   - Configure it to search the entire web
   - Copy the "Search Engine ID" (cx parameter)

**Free Quota:** 100 searches/day

## Environment Setup

Add these environment variables to your deployment environment:

```bash
# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key_here

# Google Custom Search API
GOOGLE_SEARCH_API_KEY=your_google_search_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here

# Database (required for app to run)
DATABASE_URL=postgresql://user:password@host:port/database

# OpenAI (should already be configured)
AI_INTEGRATIONS_OPENAI_API_KEY=your_openai_key
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
```

## Local Development

1. **Install dependencies:**
   ```bash
   cd /app
   yarn install
   ```

2. **Set up database:**
   - Ensure PostgreSQL is running
   - Set `DATABASE_URL` environment variable
   - Run migrations: `yarn db:push`

3. **Add API keys to environment variables**

4. **Build the application:**
   ```bash
   yarn build
   ```

5. **Start the server:**
   ```bash
   yarn start
   ```
   
   Or for development:
   ```bash
   yarn dev
   ```

## Deployment Instructions

### Option 1: Replit Deployment
1. Open your Repl
2. Go to "Secrets" (lock icon in sidebar)
3. Add the API keys listed above
4. Click "Run" button

### Option 2: Manual Deployment
1. Set all environment variables on your hosting platform
2. Build the application: `yarn build`
3. Start the server: `yarn start`
4. Application will run on port specified by `PORT` environment variable (default: 5000)

## How It Works

1. **User enters ingredients** and preferences
2. **AI generates recipe suggestions** using OpenAI GPT-5.1
3. **Backend searches** (in parallel):
   - YouTube for popular cooking videos
   - Google for top cooking blog articles
4. **Frontend displays** both links for each recipe
5. **Fallback**: If APIs aren't configured, shows Google search link

## Popular Cooking Sites Targeted

The blog search prioritizes these high-quality cooking websites:
- AllRecipes.com
- Food Network
- Bon Appétit
- Epicurious
- Serious Eats
- Tasty
- Delish
- BBC Good Food
- Simply Recipes
- The Spruce Eats

## Testing Without API Keys

The app will still work without API keys - it will:
- Show a warning in server logs
- Display the old Google search button as fallback
- All other features remain functional

## Support

If you encounter any issues:
1. Check server logs for API errors
2. Verify API keys are correctly set
3. Ensure API quotas haven't been exceeded
4. Check that APIs are enabled in Google Cloud Console
