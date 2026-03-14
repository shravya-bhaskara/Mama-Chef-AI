import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { searchYouTubeRecipe, searchCookingBlog } from "./recipeSearch";

const openAiApiKey =
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

const openAiBaseUrl =
  process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || process.env.OPENAI_BASE_URL;

const openAiModel =
  process.env.AI_INTEGRATIONS_OPENAI_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";

const openai = openAiApiKey
  ? new OpenAI({
      apiKey: openAiApiKey,
      ...(openAiBaseUrl ? { baseURL: openAiBaseUrl } : {}),
    })
  : null;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.recipes.list.path, async (req, res) => {
    try {
      const allRecipes = await storage.getRecipes();
      res.json(allRecipes);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  app.get(api.recipes.get.path, async (req, res) => {
    try {
      const recipe = await storage.getRecipe(Number(req.params.id));
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });

  app.post(api.recipes.create.path, async (req, res) => {
    try {
      if (!openai) {
        return res.status(503).json({
          message:
            "Recipe generation is not configured. Set OPENAI_API_KEY or AI_INTEGRATIONS_OPENAI_API_KEY.",
        });
      }

      const input = api.recipes.create.input.parse(req.body);
      
      const prompt = `You are an expert culinary assistant designed to help people worldwide figure out what to cook from dishes across any part of the world.
The user has the following ingredients at home: ${input.ingredients.join(', ')}.
Their preferences are: 
- Cuisine: ${input.preferences.cuisine || 'Any'}
- Culture: ${input.preferences.culture || 'Any'}
- Family Size: ${input.preferences.familySize || 'Not specified'}
- Dietary Restrictions: ${input.preferences.dietaryRestrictions || 'None'}

Please provide 10-15 recipe suggestions that utilize these ingredients and fit their preferences. 
Include diverse recipes from various cuisines and cultures around the world.
For each recipe, provide COMPLETE step-by-step cooking instructions, full ingredient lists, detailed nutritional information, approximate cooking time, and meal type category.

Respond in JSON format with the following structure:
{
  "suggestions": [
    {
      "name": "Recipe Name",
      "description": "Short description of the recipe and why it fits",
      "mealType": "Starter/Main Course/Drinks/Dessert",
      "cookingTime": "e.g., 30 minutes",
      "servings": "e.g., 4 servings",
      "ingredientsUsed": ["ingredient 1 with quantity", "ingredient 2 with quantity"],
      "instructions": ["Step 1: detailed instruction", "Step 2: detailed instruction", "Step 3: ..."],
      "nutritionalInfo": "Detailed breakdown: calories, protein, carbs, fats, vitamins, minerals",
      "calories": 450,
      "protein": 25,
      "dishImageQuery": "professional food photography of [dish name]",
      "recipeSearchQuery": "Google search query to find similar recipes, e.g. 'traditional italian tomato basil pasta recipe'"
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: openAiModel,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const responseContent = response.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error("Failed to generate recipes from AI");
      }

      const generatedData = JSON.parse(responseContent);

      // Fetch YouTube videos and blog URLs for each suggestion
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

      const newRecipe = await storage.createRecipe({
        ingredients: input.ingredients,
        preferences: input.preferences,
        suggestions: suggestionsWithLinks,
      });

      res.status(201).json(newRecipe);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error(err);
      res.status(500).json({ message: "An error occurred while generating recipes" });
    }
  });

  // Meal Plans Routes
  app.get(api.mealPlans.list.path, async (req, res) => {
    try {
      const plans = await storage.getMealPlans();
      res.json(plans);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  app.post(api.mealPlans.create.path, async (req, res) => {
    try {
      if (!openai) {
        return res.status(503).json({
          message:
            "Meal plan generation is not configured. Set OPENAI_API_KEY or AI_INTEGRATIONS_OPENAI_API_KEY.",
        });
      }

      const input = api.mealPlans.create.input.parse(req.body);
      
      const prompt = input.planType === 'weekly' 
        ? `You are an expert meal planning assistant. Create a comprehensive 7-day meal plan with dishes from any part of the world.
Family Size: ${input.preferences.familySize || 'Not specified'}
Cuisine Preference: ${input.preferences.cuisine || 'Any'}
Dietary Restrictions: ${input.preferences.dietaryRestrictions || 'None'}
Age Bracket: ${input.preferences.ageBracket || 'All ages'}

Create a meal plan with breakfast, lunch, dinner, and snacks for each day of the week (Monday to Sunday).
For each meal, include:
- Recipe name
- Key ingredients with quantities
- Prep time
- Complete step-by-step cooking instructions
- Detailed nutritional information (calories estimate, key nutrients, vitamins)
- Meal type (Starter/Main Course/Drinks/Dessert)
- A short Google-friendly search query to find the recipe online
- Dish image search query for professional food photography

Provide 10-15 diverse recipe options across the week from various world cuisines.

Also provide:
- A grocery shopping list organized by category
- Meal prep tips for the week
- Suggestions for using leftovers

Respond in JSON format with this structure:
{
  "weekPlan": {
    "Monday": {
      "breakfast": { "name": "", "ingredients": [], "prepTime": "", "instructions": [], "description": "", "nutrition": "", "calories": 0, "protein": 0, "mealType": "", "recipeSearchQuery": "", "dishImageQuery": "" },
      "lunch": { "name": "", "ingredients": [], "prepTime": "", "instructions": [], "description": "", "nutrition": "", "calories": 0, "protein": 0, "mealType": "", "recipeSearchQuery": "", "dishImageQuery": "" },
      "dinner": { "name": "", "ingredients": [], "prepTime": "", "instructions": [], "description": "", "nutrition": "", "calories": 0, "protein": 0, "mealType": "", "recipeSearchQuery": "", "dishImageQuery": "" },
      "snacks": { "name": "", "ingredients": [], "prepTime": "", "instructions": [], "description": "", "nutrition": "", "calories": 0, "protein": 0, "mealType": "", "recipeSearchQuery": "", "dishImageQuery": "" }
    }
  },
  "groceryList": {
    "produce": [],
    "proteins": [],
    "grains": [],
    "dairy": [],
    "pantry": []
  },
  "mealPrepTips": [],
  "leftoverIdeas": []
}`
        : `You are a nutrition-focused meal planning assistant. Create a health-oriented 7-day meal plan with dishes from around the world.
Family Size: ${input.preferences.familySize || 'Not specified'}
Dietary Restrictions: ${input.preferences.dietaryRestrictions || 'None'}
Calorie Goal: ${input.preferences.calorieGoal || 'Not specified'} calories per day
Protein Goal: ${input.preferences.proteinGoal || 'Not specified'}g per day
Age Bracket: ${input.preferences.ageBracket || 'All ages'}

Create a balanced meal plan focusing on nutritional goals:
- Daily calorie targets
- Protein distribution across meals
- Vitamin-rich ingredients
- Probiotic foods for gut health
- Balanced macros (protein, carbs, healthy fats)

For each day (Monday-Sunday), provide breakfast, lunch, dinner, and snacks with:
- Recipe name
- Complete step-by-step cooking instructions
- Calorie count
- Protein content (grams)
- Carbohydrates (grams)
- Fats (grams)
- Key vitamins and minerals
- Brief description
- Meal type category
- A short Google-friendly search query to find the recipe online
- Dish image search query

Include 10-15 diverse healthy recipes across the week.

Also include:
- Daily nutrition summary
- Weekly shopping list
- Healthy substitution tips

Respond in JSON format with this structure:
{
  "weekPlan": {
    "Monday": {
      "breakfast": { "name": "", "calories": 0, "protein": 0, "carbs": 0, "fats": 0, "vitamins": [], "instructions": [], "description": "", "mealType": "", "recipeSearchQuery": "", "dishImageQuery": "" },
      "lunch": { "name": "", "calories": 0, "protein": 0, "carbs": 0, "fats": 0, "vitamins": [], "instructions": [], "description": "", "mealType": "", "recipeSearchQuery": "", "dishImageQuery": "" },
      "dinner": { "name": "", "calories": 0, "protein": 0, "carbs": 0, "fats": 0, "vitamins": [], "instructions": [], "description": "", "mealType": "", "recipeSearchQuery": "", "dishImageQuery": "" },
      "snacks": { "name": "", "calories": 0, "protein": 0, "carbs": 0, "fats": 0, "vitamins": [], "instructions": [], "description": "", "mealType": "", "recipeSearchQuery": "", "dishImageQuery": "" },
      "dailyTotals": { "calories": 0, "protein": 0, "carbs": 0, "fats": 0 }
    }
  },
  "shoppingList": [],
  "nutritionTips": [],
  "substitutions": []
}`;

      const response = await openai.chat.completions.create({
        model: openAiModel,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const responseContent = response.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error("Failed to generate meal plan");
      }

      const generatedPlan = JSON.parse(responseContent);

      // Fetch YouTube links for dinners (one per day to keep API calls manageable)
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const enrichedWeekPlan = { ...generatedPlan.weekPlan };
      await Promise.all(
        days.map(async (day) => {
          if (enrichedWeekPlan[day]) {
            const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];
            for (const mealType of meals) {
              const meal = enrichedWeekPlan[day][mealType];
              if (meal?.recipeSearchQuery) {
                const [videoUrl, blogUrl] = await Promise.all([
                  searchYouTubeRecipe(meal.recipeSearchQuery),
                  searchCookingBlog(meal.recipeSearchQuery),
                ]);
                enrichedWeekPlan[day][mealType] = {
                  ...meal,
                  videoUrl: videoUrl || undefined,
                  blogUrl: blogUrl || undefined,
                };
              }
            }
          }
        })
      );

      const enrichedPlan = { ...generatedPlan, weekPlan: enrichedWeekPlan };

      const newPlan = await storage.createMealPlan({
        planType: input.planType,
        preferences: input.preferences,
        meals: enrichedPlan,
      });

      res.status(201).json(newPlan);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to generate meal plan" });
    }
  });

  // Quick Meals Routes
  app.get(api.quickMeals.list.path, async (req, res) => {
    try {
      const meals = await storage.getQuickMeals();
      res.json(meals);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch quick meals" });
    }
  });

  app.post(api.quickMeals.create.path, async (req, res) => {
    try {
      if (!openai) {
        return res.status(503).json({
          message:
            "Quick meal generation is not configured. Set OPENAI_API_KEY or AI_INTEGRATIONS_OPENAI_API_KEY.",
        });
      }

      const input = api.quickMeals.create.input.parse(req.body);
      
      const prompt = `You are a quick meal expert specializing in 5-minute dinner solutions and hostel-friendly quick cooking for busy families and students.
Available ingredients: ${input.ingredients.join(', ')}

Generate 10-12 ultra-quick ideas divided into two categories:
1. **5-Minute Dinner Rescue** (6-7 recipes): Quick family meals
2. **Hostel Quick Food Ideas** (4-5 recipes): Minimal ingredient, creative meals perfect for hostel/dorm cooking with limited equipment

For each meal, provide:
- Name
- Category (Quick Dinner / Hostel Food)
- Meal Type (Starter/Main Course/Drinks/Dessert)
- Ingredients needed with quantities
- Preparation time (should be ≤5 minutes)
- Complete step-by-step instructions
- Equipment needed (microwave, toaster, kettle, etc.)
- Nutritional highlights (include approximate calories and key nutrients)
- Calorie estimate
- Protein estimate (grams)
- Serving suggestions
- Dish image search query for professional food photography
- A short Google-friendly search query to find this recipe online

Respond in JSON format:
{
  "quickMeals": [
    {
      "name": "",
      "category": "Quick Dinner",
      "mealType": "",
      "ingredients": [],
      "prepTime": "",
      "instructions": [],
      "equipment": [],
      "nutrition": "",
      "calories": 0,
      "protein": 0,
      "servingSuggestions": "",
      "dishImageQuery": "",
      "recipeSearchQuery": ""
    }
  ],
  "hostelMeals": [
    {
      "name": "",
      "category": "Hostel Food",
      "mealType": "",
      "ingredients": [],
      "prepTime": "",
      "instructions": [],
      "equipment": [],
      "nutrition": "",
      "calories": 0,
      "protein": 0,
      "servingSuggestions": "",
      "dishImageQuery": "",
      "recipeSearchQuery": ""
    }
  ],
  "pantryEssentials": [],
  "timeSavingTips": []
}`;

      const response = await openai.chat.completions.create({
        model: openAiModel,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const responseContent = response.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error("Failed to generate quick meals");
      }

      const generatedMeals = JSON.parse(responseContent);

      // Fetch YouTube and blog links for each quick meal
      const quickMealsWithLinks = await Promise.all(
        (generatedMeals.quickMeals || []).map(async (meal: any) => {
          const [videoUrl, blogUrl] = await Promise.all([
            searchYouTubeRecipe(meal.recipeSearchQuery || meal.name),
            searchCookingBlog(meal.recipeSearchQuery || meal.name),
          ]);
          return { ...meal, videoUrl: videoUrl || undefined, blogUrl: blogUrl || undefined };
        })
      );

      // Fetch YouTube and blog links for hostel meals
      const hostelMealsWithLinks = await Promise.all(
        (generatedMeals.hostelMeals || []).map(async (meal: any) => {
          const [videoUrl, blogUrl] = await Promise.all([
            searchYouTubeRecipe(meal.recipeSearchQuery || meal.name),
            searchCookingBlog(meal.recipeSearchQuery || meal.name),
          ]);
          return { ...meal, videoUrl: videoUrl || undefined, blogUrl: blogUrl || undefined };
        })
      );

      const enrichedMeals = { 
        ...generatedMeals, 
        quickMeals: quickMealsWithLinks,
        hostelMeals: hostelMealsWithLinks
      };

      const newMeal = await storage.createQuickMeal({
        ingredients: input.ingredients,
        meals: enrichedMeals,
      });

      res.status(201).json(newMeal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to generate quick meals" });
    }
  });

  // Festival Recipes Routes
  app.get(api.festivalRecipes.list.path, async (req, res) => {
    try {
      const recipes = await storage.getFestivalRecipes();
      res.json(recipes);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch festival recipes" });
    }
  });

  app.post(api.festivalRecipes.create.path, async (req, res) => {
    try {
      if (!openai) {
        return res.status(503).json({
          message:
            "Festival recipe generation is not configured. Set OPENAI_API_KEY or AI_INTEGRATIONS_OPENAI_API_KEY.",
        });
      }

      const input = api.festivalRecipes.create.input.parse(req.body);
      
      const fastingFilter = (input as any).fastingType || 'both';
      const mealTypeFilter = (input as any).mealType || 'all';
      
      const prompt = `You are a cultural cuisine expert specializing in festival and traditional recipes from any part of the world.
Festival: ${input.festival}
Region: ${input.region || 'Any'}
Culture: ${input.culture || 'Any'}
Fasting Requirement: ${fastingFilter === 'fasting' ? 'Only fasting-friendly foods (no onion, no garlic, vegetarian)' : fastingFilter === 'non-fasting' ? 'Regular foods allowed' : 'Mix of both fasting and non-fasting options'}
Meal Type Filter: ${mealTypeFilter === 'all' ? 'All types (Starters, Main Course, Drinks, Desserts)' : mealTypeFilter}

Provide 10-15 authentic recipe recommendations for this festival from various world cuisines, including:
- Traditional main dishes
- Side dishes and accompaniments
- Desserts and sweets
- Beverages

For each recipe, include:
- Recipe name (with cultural/regional name if applicable)
- Meal Type (Starter/Main Course/Drinks/Dessert)
- Fasting Status (Fasting-Friendly / Non-Fasting)
- Significance to the festival
- Complete ingredients list with quantities
- Difficulty level (Beginner/Intermediate/Advanced)
- Cooking time
- Brief cultural context
- Complete step-by-step instructions (at least 5-8 detailed steps)
- Serving suggestions
- Variations (modern twists, dietary adaptations)
- Detailed nutritional info (key nutrients, vitamins, approximate calories, protein)
- Dish image search query for professional food photography
- A short Google-friendly search query to find this recipe online

Also provide:
- A warm, joyful cultural celebration paragraph (3-5 sentences) describing the spirit, traditions, and meaning of this festival — written to evoke joy and celebration
- Festival emoji that best represents this festival

Respond in JSON format:
{
  "festivalRecipes": [
    {
      "name": "",
      "culturalName": "",
      "category": "",
      "mealType": "",
      "fastingStatus": "",
      "significance": "",
      "ingredients": [],
      "difficulty": "",
      "cookingTime": "",
      "culturalContext": "",
      "instructions": [],
      "servingSuggestions": "",
      "variations": [],
      "nutritionalInfo": "",
      "dishImageQuery": "",
      "recipeSearchQuery": ""
    }
  ],
  "festivalTraditions": [],
  "cookingTips": [],
  "menuSuggestions": "",
  "celebrationParagraph": "",
  "festivalEmoji": ""
}`;

      const response = await openai.chat.completions.create({
        model: openAiModel,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const responseContent = response.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error("Failed to generate festival recipes");
      }

      const generatedRecipes = JSON.parse(responseContent);

      // Fetch YouTube and blog links for each festival recipe
      const recipesWithLinks = await Promise.all(
        (generatedRecipes.festivalRecipes || []).map(async (recipe: any) => {
          const [videoUrl, blogUrl] = await Promise.all([
            searchYouTubeRecipe(recipe.recipeSearchQuery || `${recipe.name} ${input.festival} recipe`),
            searchCookingBlog(recipe.recipeSearchQuery || `${recipe.name} ${input.festival}`),
          ]);
          return { ...recipe, videoUrl: videoUrl || undefined, blogUrl: blogUrl || undefined };
        })
      );

      const enrichedRecipes = { ...generatedRecipes, festivalRecipes: recipesWithLinks };

      const newRecipe = await storage.createFestivalRecipe({
        festival: input.festival,
        region: input.region || null,
        culture: input.culture || null,
        recipes: enrichedRecipes,
      });

      res.status(201).json(newRecipe);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to generate festival recipes" });
    }
  });

  // Favorites Routes
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const { userId, recipeType, recipeData } = req.body;
      
      if (!userId || !recipeType || !recipeData) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newFavorite = await storage.addFavorite({
        userId,
        recipeType,
        recipeData,
      });

      res.status(201).json(newFavorite);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:userId/:id", async (req, res) => {
    try {
      const userId = req.params.userId;
      const id = parseInt(req.params.id);
      
      await storage.removeFavorite(userId, id);
      res.status(200).json({ message: "Favorite removed successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  return httpServer;
}
