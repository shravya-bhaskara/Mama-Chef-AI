# Complete Changes Diff - MamaChef AI

## Summary of All Changes Made

### 1. Database Schema Updates (`/app/shared/schema.ts`)

**ADDED:**
```typescript
// New tables for additional features
export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  planType: text("plan_type").notNull(),
  preferences: jsonb("preferences").notNull(),
  meals: jsonb("meals").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quickMeals = pgTable("quick_meals", {
  id: serial("id").primaryKey(),
  ingredients: text("ingredients").array().notNull(),
  meals: jsonb("meals").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const festivalRecipes = pgTable("festival_recipes", {
  id: serial("id").primaryKey(),
  festival: text("festival").notNull(),
  region: text("region"),
  culture: text("culture"),
  recipes: jsonb("recipes").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Updated RecipeSuggestion type
export type RecipeSuggestion = {
  name: string;
  description: string;
  ingredientsUsed: string[];
  nutritionalInfo: string;
  recipeSearchQuery: string;
  videoUrl?: string;    // ADDED
  blogUrl?: string;     // ADDED
};
```

---

### 2. Storage Layer (`/app/server/storage.ts`)

**ADDED:**
```typescript
// New imports
import { 
  recipes, 
  mealPlans,      // ADDED
  quickMeals,     // ADDED
  festivalRecipes, // ADDED
  type Recipe, 
  type InsertRecipe,
  type MealPlan,      // ADDED
  type QuickMeal,     // ADDED
  type FestivalRecipe // ADDED
} from "@shared/schema";

// New interface methods
export interface IStorage {
  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: number): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe & { suggestions: any }): Promise<Recipe>;
  
  // ADDED - Meal Plans
  getMealPlans(): Promise<MealPlan[]>;
  getMealPlan(id: number): Promise<MealPlan | undefined>;
  createMealPlan(plan: any): Promise<MealPlan>;
  
  // ADDED - Quick Meals
  getQuickMeals(): Promise<QuickMeal[]>;
  createQuickMeal(meal: any): Promise<QuickMeal>;
  
  // ADDED - Festival Recipes
  getFestivalRecipes(): Promise<FestivalRecipe[]>;
  createFestivalRecipe(recipe: any): Promise<FestivalRecipe>;
}

// All new method implementations added
```

---

### 3. API Routes Definition (`/app/shared/routes.ts`)

**ADDED:**
```typescript
export const api = {
  recipes: { /* existing */ },
  
  // ADDED - Meal Plans routes
  mealPlans: {
    list: {
      method: 'GET' as const,
      path: '/api/meal-plans' as const,
      responses: { 200: z.array(z.any()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/meal-plans' as const,
      input: z.object({
        planType: z.enum(['weekly', 'health']),
        preferences: z.object({
          familySize: z.string().optional(),
          cuisine: z.string().optional(),
          dietaryRestrictions: z.string().optional(),
          calorieGoal: z.number().optional(),
          proteinGoal: z.number().optional(),
        }),
      }),
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
  
  // ADDED - Quick Meals routes
  quickMeals: {
    list: {
      method: 'GET' as const,
      path: '/api/quick-meals' as const,
      responses: { 200: z.array(z.any()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/quick-meals' as const,
      input: z.object({
        ingredients: z.array(z.string()),
      }),
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
  
  // ADDED - Festival Recipes routes
  festivalRecipes: {
    list: {
      method: 'GET' as const,
      path: '/api/festival-recipes' as const,
      responses: { 200: z.array(z.any()) },
    },
    create: {
      method: 'POST' as const,
      path: '/api/festival-recipes' as const,
      input: z.object({
        festival: z.string(),
        region: z.string().optional(),
        culture: z.string().optional(),
      }),
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
};
```

---

### 4. Recipe Search Helper (`/app/server/recipeSearch.ts`) - NEW FILE

**CREATED NEW FILE:**
```typescript
import axios from 'axios';

// YouTube Data API v3 search
export async function searchYouTubeRecipe(query: string): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    console.warn('YouTube API key not configured');
    return null;
  }

  try {
    const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        videoCategoryId: '26',
        maxResults: 5,
        order: 'relevance',
        key: apiKey,
      },
    });

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      return null;
    }

    const videoIds = searchResponse.data.items.map((item: any) => item.id.videoId).join(',');
    
    const statsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'statistics,contentDetails',
        id: videoIds,
        key: apiKey,
      },
    });

    if (!statsResponse.data.items || statsResponse.data.items.length === 0) {
      return null;
    }

    const sortedVideos = statsResponse.data.items.sort((a: any, b: any) => {
      const viewsA = parseInt(a.statistics.viewCount || '0');
      const viewsB = parseInt(b.statistics.viewCount || '0');
      return viewsB - viewsA;
    });

    const topVideo = sortedVideos[0];
    return `https://www.youtube.com/watch?v=${topVideo.id}`;
  } catch (error: any) {
    console.error('YouTube API error:', error.response?.data || error.message);
    return null;
  }
}

// Google Custom Search API for cooking blogs
export async function searchCookingBlog(query: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  
  if (!apiKey || !searchEngineId) {
    console.warn('Google Custom Search API not configured');
    return null;
  }

  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx: searchEngineId,
        q: `${query} recipe`,
        num: 5,
        dateRestrict: 'y1',
        sort: 'date',
      },
    });

    if (!response.data.items || response.data.items.length === 0) {
      return null;
    }

    const popularCookingSites = [
      'allrecipes.com', 'foodnetwork.com', 'bonappetit.com',
      'epicurious.com', 'seriouseats.com', 'tasty.co',
      'delish.com', 'bbcgoodfood.com', 'simplyrecipes.com',
      'thespruceeats.com',
    ];

    for (const item of response.data.items) {
      const domain = new URL(item.link).hostname.replace('www.', '');
      if (popularCookingSites.some(site => domain.includes(site))) {
        return item.link;
      }
    }

    return response.data.items[0].link;
  } catch (error: any) {
    console.error('Google Search API error:', error.response?.data || error.message);
    return null;
  }
}
```

---

### 5. Backend Routes (`/app/server/routes.ts`)

**MODIFIED:**
```typescript
// ADDED import
import { searchYouTubeRecipe, searchCookingBlog } from "./recipeSearch";

// MODIFIED existing recipe endpoint
app.post(api.recipes.create.path, async (req, res) => {
  // ... existing validation ...
  
  // ADDED: Fetch YouTube videos and blog URLs
  const suggestionsWithLinks = await Promise.all(
    generatedData.suggestions.map(async (suggestion: any) => {
      const [videoUrl, blogUrl] = await Promise.all([
        searchYouTubeRecipe(suggestion.recipeSearchQuery),
        searchCookingBlog(suggestion.recipeSearchQuery),
      ]);

      return {
        ...suggestion,
        videoUrl: videoUrl || undefined,
        blogUrl: blogUrl || undefined,
      };
    })
  );
  
  // ... rest of code ...
});

// ADDED: Meal Plans endpoints (GET and POST)
app.get(api.mealPlans.list.path, async (req, res) => {
  // Implementation with comprehensive prompt for weekly/health plans
});

app.post(api.mealPlans.create.path, async (req, res) => {
  // Implementation with gpt-4o-mini model
});

// ADDED: Quick Meals endpoints (GET and POST)
app.get(api.quickMeals.list.path, async (req, res) => {
  // Implementation
});

app.post(api.quickMeals.create.path, async (req, res) => {
  // Implementation with 5-minute meal focus
});

// ADDED: Festival Recipes endpoints (GET and POST)
app.get(api.festivalRecipes.list.path, async (req, res) => {
  // Implementation
});

app.post(api.festivalRecipes.create.path, async (req, res) => {
  // Implementation with cultural context
});

// CHANGED: All OpenAI model references from "gpt-5.1" to "gpt-4o-mini"
```

---

### 6. Server Configuration (`/app/server/index.ts`)

**CHANGED:**
```typescript
// OLD:
const port = parseInt(process.env.PORT || "5000", 10);

// NEW:
const port = parseInt(process.env.PORT || "3000", 10);
```

---

### 7. New Frontend Pages

#### **`/app/client/src/pages/meal-planner.tsx`** - NEW FILE (350+ lines)
- Weekly meal planner with tabs
- Health-focused planning option
- Displays 7-day plans with grocery lists

#### **`/app/client/src/pages/quick-meals.tsx`** - NEW FILE (200+ lines)
- 5-minute dinner rescue interface
- Ingredient tagging system
- Quick meal results display

#### **`/app/client/src/pages/festival-recipes.tsx`** - NEW FILE (300+ lines)
- Festival recipe search
- Cultural context display
- Region and culture filters

---

### 8. Frontend Router (`/app/client/src/App.tsx`)

**MODIFIED:**
```typescript
// ADDED imports
import MealPlanner from "@/pages/meal-planner";
import QuickMeals from "@/pages/quick-meals";
import FestivalRecipes from "@/pages/festival-recipes";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/history" component={History} />
      <Route path="/meal-planner" component={MealPlanner} />      // ADDED
      <Route path="/quick-meals" component={QuickMeals} />        // ADDED
      <Route path="/festival-recipes" component={FestivalRecipes} /> // ADDED
      <Route component={NotFound} />
    </Switch>
  );
}
```

---

### 9. Home Page Updates (`/app/client/src/pages/home.tsx`)

**MODIFIED:**
```typescript
// ADDED imports
import { Youtube, BookOpen } from "lucide-react";
import { Link } from "wouter";

// CHANGED: Made planning feature cards clickable with Link wrappers
<Link href="/meal-planner">
  <Card className="...hover:shadow-lg cursor-pointer">
    {/* Weekly AI Meal Planner content */}
  </Card>
</Link>

<Link href="/quick-meals">
  <Card className="...hover:shadow-lg cursor-pointer">
    {/* 5-Minute Dinner Rescue content */}
  </Card>
</Link>

<Link href="/festival-recipes">
  <Card className="...hover:shadow-lg cursor-pointer">
    {/* Festival Recipes content */}
  </Card>
</Link>

// MODIFIED: Recipe display to show video and blog buttons
{suggestion.videoUrl && (
  <Button variant="outline" className="border-red-200 text-red-600">
    <Youtube className="h-4 w-4" />
    Watch Video
  </Button>
)}
{suggestion.blogUrl && (
  <Button variant="outline" className="border-blue-200 text-blue-600">
    <BookOpen className="h-4 w-4" />
    Read Recipe
  </Button>
)}
```

---

### 10. History Page Updates (`/app/client/src/pages/history.tsx`)

**MODIFIED:**
```typescript
// ADDED imports
import { Youtube, BookOpen } from "lucide-react";

// ADDED: Same video/blog button structure as home page
{suggestion.videoUrl && (
  <Button size="sm" variant="outline" className="border-red-200">
    <Youtube className="h-3 w-3" />
    Watch Video
  </Button>
)}
{suggestion.blogUrl && (
  <Button size="sm" variant="outline" className="border-blue-200">
    <BookOpen className="h-3 w-3" />
    Read Recipe
  </Button>
)}
```

---

### 11. Environment Configuration (`/app/.env`)

**CREATED/MODIFIED:**
```bash
# Server Port
PORT=3000                    # CHANGED from 5000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://neondb_owner:npg_JDMdR68WgTxy@ep-little-sun-a1lve0se-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# OpenAI API (CHANGED multiple times)
AI_INTEGRATIONS_OPENAI_API_KEY=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
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1

# YouTube Data API v3 (ADDED)
YOUTUBE_API_KEY=AIzaSyBlU-jPip4kPKBn_u61iQi7oooQ8LUzOno

# Google Custom Search API (ADDED)
GOOGLE_SEARCH_API_KEY=AIzaSyBlU-jPip4kPKBn_u61iQi7oooQ8LUzOno
GOOGLE_SEARCH_ENGINE_ID=e55a78aa793cb45e7
```

---

### 12. Dependencies (`/app/package.json`)

**ADDED:**
```json
{
  "dependencies": {
    "axios": "^1.x.x"  // ADDED for API calls
  }
}
```

---

## Files Created:
1. `/app/server/recipeSearch.ts`
2. `/app/client/src/pages/meal-planner.tsx`
3. `/app/client/src/pages/quick-meals.tsx`
4. `/app/client/src/pages/festival-recipes.tsx`
5. `/app/.env`
6. `/app/.env.example`
7. `/app/DEPLOYMENT_GUIDE.md`
8. `/app/EMERGENT_SETUP.md`
9. `/app/FEATURES_COMPLETE.md`
10. `/app/READY_TO_DEPLOY.md`
11. `/app/HEALTH_CHECK_REPORT.md`

## Files Modified:
1. `/app/shared/schema.ts` - Added 3 new tables
2. `/app/server/storage.ts` - Added storage methods
3. `/app/shared/routes.ts` - Added new API route definitions
4. `/app/server/routes.ts` - Added new endpoints, enhanced existing
5. `/app/server/index.ts` - Changed port from 5000 to 3000
6. `/app/client/src/App.tsx` - Added new routes
7. `/app/client/src/pages/home.tsx` - Made cards clickable, added video/blog buttons
8. `/app/client/src/pages/history.tsx` - Added video/blog buttons
9. `/app/package.json` - Added axios dependency

## Database Migration Required:
```bash
yarn db:push
```
This creates the new tables: meal_plans, quick_meals, festival_recipes

---

## Current Issue:
- Backend works (tested with curl - returns 201 success)
- Frontend shows error in browser
- Possible cache issue or CORS problem
