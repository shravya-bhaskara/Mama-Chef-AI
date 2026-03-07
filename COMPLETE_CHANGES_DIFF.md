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

// Implementation of all new methods added to DatabaseStorage class
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

**ENTIRE FILE CREATED:**
- Function: `searchYouTubeRecipe(query: string)` - Searches YouTube Data API v3 for cooking videos
- Function: `searchCookingBlog(query: string)` - Searches Google Custom Search for cooking blogs
- Both functions return URLs or null if not found
- Includes error handling and fallbacks

---

### 5. Backend Routes (`/app/server/routes.ts`)

**MODIFIED:**
```typescript
// ADDED import
import { searchYouTubeRecipe, searchCookingBlog } from "./recipeSearch";

// MODIFIED existing recipe endpoint to add YouTube and blog URLs
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
```

**ADDED: Complete implementation of:**
- Meal Plans GET and POST endpoints
- Quick Meals GET and POST endpoints
- Festival Recipes GET and POST endpoints
- All use OpenAI gpt-4o-mini model
- Comprehensive prompts for each feature

---

### 6. Server Configuration (`/app/server/index.ts`)

**CHANGED:**
```typescript
// OLD:
const port = parseInt(process.env.PORT || "5000", 10);

// NEW:
const port = parseInt(process.env.PORT || "3000", 10);
```

**ADDED CORS middleware:**
```typescript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
```

---

### 7. New Frontend Pages (All NEW FILES)

#### `/app/client/src/pages/meal-planner.tsx`
- Weekly meal planner with tabs (Weekly & Health-focused)
- Form for preferences (family size, cuisine, dietary restrictions, calorie goals)
- Displays 7-day meal plans with grocery lists
- Shows nutrition summaries and meal prep tips

#### `/app/client/src/pages/quick-meals.tsx`
- 5-minute dinner rescue interface
- Ingredient input with tagging
- Displays ultra-quick meal ideas with instructions
- Time-saving tips section

#### `/app/client/src/pages/festival-recipes.tsx`
- Festival name input with region/culture filters
- Displays authentic recipes with cultural context
- Shows difficulty levels, cooking times
- Festival traditions and variations

---

### 8. Frontend Router (`/app/client/src/App.tsx`)

**ADDED imports:**
```typescript
import MealPlanner from "@/pages/meal-planner";
import QuickMeals from "@/pages/quick-meals";
import FestivalRecipes from "@/pages/festival-recipes";
```

**ADDED routes:**
```typescript
<Route path="/meal-planner" component={MealPlanner} />
<Route path="/quick-meals" component={QuickMeals} />
<Route path="/festival-recipes" component={FestivalRecipes} />
```

---

### 9. Home Page Updates (`/app/client/src/pages/home.tsx`)

**ADDED imports:**
```typescript
import { Youtube, BookOpen } from "lucide-react";
```

**CHANGED: Made planning cards clickable:**
```typescript
<Link href="/meal-planner">
  <Card className="...hover:shadow-lg cursor-pointer">
    {/* Weekly AI Meal Planner */}
  </Card>
</Link>

<Link href="/quick-meals">
  <Card className="...hover:shadow-lg cursor-pointer">
    {/* 5-Minute Dinner Rescue */}
  </Card>
</Link>

<Link href="/festival-recipes">
  <Card className="...hover:shadow-lg cursor-pointer">
    {/* Festival Recipes */}
  </Card>
</Link>
```

**MODIFIED: Recipe display buttons:**
```typescript
// Added video and blog buttons
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
// Falls back to Google search if no URLs
```

---

### 10. History Page Updates (`/app/client/src/pages/history.tsx`)

**ADDED imports:**
```typescript
import { Youtube, BookOpen } from "lucide-react";
```

**ADDED: Video and blog buttons** (same structure as home page)

---

### 11. Dependencies (`package.json`)

**ADDED:**
```json
{
  "dependencies": {
    "axios": "^1.x.x"
  }
}
```

---

### 12. Environment Configuration (`.env`)

**Structure (you need to fill in your keys):**
```
PORT=3000
NODE_ENV=production
DATABASE_URL=your_postgresql_url
AI_INTEGRATIONS_OPENAI_API_KEY=your_openai_key
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
YOUTUBE_API_KEY=your_youtube_key
GOOGLE_SEARCH_API_KEY=your_google_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
```

---

## Files Created:
1. `/app/server/recipeSearch.ts` - NEW
2. `/app/client/src/pages/meal-planner.tsx` - NEW
3. `/app/client/src/pages/quick-meals.tsx` - NEW
4. `/app/client/src/pages/festival-recipes.tsx` - NEW
5. `/app/.env` - NEW
6. `/app/.env.example` - NEW

## Files Modified:
1. `/app/shared/schema.ts` - Added 3 new tables
2. `/app/server/storage.ts` - Added storage methods for new features
3. `/app/shared/routes.ts` - Added new API route definitions
4. `/app/server/routes.ts` - Added new endpoints + enhanced recipe endpoint
5. `/app/server/index.ts` - Changed port to 3000 + added CORS
6. `/app/client/src/App.tsx` - Added new routes
7. `/app/client/src/pages/home.tsx` - Made cards clickable, added video/blog buttons
8. `/app/client/src/pages/history.tsx` - Added video/blog buttons
9. `/app/package.json` - Added axios dependency

## Database Migration Required:
```bash
yarn db:push
```
This creates: meal_plans, quick_meals, festival_recipes tables

---

## Key Changes Summary:

### Features Added:
1. ✅ YouTube video links for recipes
2. ✅ Cooking blog article links for recipes
3. ✅ AI Weekly Meal Planner (7-day plans)
4. ✅ Health-Oriented Meal Planning
5. ✅ 5-Minute Dinner Rescue
6. ✅ Festival & Cultural Recipes

### Technical Changes:
- Port: 5000 → 3000
- Added CORS middleware
- Added 3 new database tables
- Added 6 new API endpoints
- Added 3 new frontend pages
- Enhanced existing recipe endpoint
- Added axios for API calls
- Model: gpt-4o-mini (for all OpenAI calls)

### UI Changes:
- Clickable feature cards on home page
- Video (red) and Blog (blue) buttons for recipes
- New navigation routes
- Consistent design across all pages
