import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { searchYouTubeRecipe, searchCookingBlog } from "./recipeSearch";

// the openai instance uses process.env.AI_INTEGRATIONS_OPENAI_API_KEY inside the replit environment
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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
      const input = api.recipes.create.input.parse(req.body);
      
      const prompt = `You are an expert culinary assistant designed to help mothers worldwide figure out what to cook.
The user has the following ingredients at home: ${input.ingredients.join(', ')}.
Their preferences are: 
- Cuisine: ${input.preferences.cuisine || 'Any'}
- Culture: ${input.preferences.culture || 'Any'}
- Family Size: ${input.preferences.familySize || 'Not specified'}
- Dietary Restrictions: ${input.preferences.dietaryRestrictions || 'None'}

Please provide 3 recipe suggestions that utilize these ingredients and fit their preferences. 
Also, provide nutritional information for the key ingredients used and a search query they can use to find similar recipes online.
Respond in JSON format with the following structure:
{
  "suggestions": [
    {
      "name": "Recipe Name",
      "description": "Short description of the recipe and why it fits",
      "ingredientsUsed": ["ingredient 1", "ingredient 2"],
      "nutritionalInfo": "Brief breakdown of the nutrients brought in by these ingredients",
      "recipeSearchQuery": "Google search query to find similar recipes, e.g. 'traditional italian tomato basil pasta recipe'"
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
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
      const input = api.mealPlans.create.input.parse(req.body);
      
      const prompt = input.planType === 'weekly' 
        ? `You are an expert meal planning assistant. Create a comprehensive 7-day meal plan.
Family Size: ${input.preferences.familySize || 'Not specified'}
Cuisine Preference: ${input.preferences.cuisine || 'Any'}
Dietary Restrictions: ${input.preferences.dietaryRestrictions || 'None'}

Create a meal plan with breakfast, lunch, dinner, and snacks for each day of the week (Monday to Sunday).
For each meal, include:
- Recipe name
- Key ingredients
- Prep time
- Brief description
- Nutritional highlights

Also provide:
- A grocery shopping list organized by category
- Meal prep tips for the week
- Suggestions for using leftovers

Respond in JSON format with this structure:
{
  "weekPlan": {
    "Monday": {
      "breakfast": { "name": "", "ingredients": [], "prepTime": "", "description": "", "nutrition": "" },
      "lunch": { "name": "", "ingredients": [], "prepTime": "", "description": "", "nutrition": "" },
      "dinner": { "name": "", "ingredients": [], "prepTime": "", "description": "", "nutrition": "" },
      "snacks": { "name": "", "ingredients": [], "prepTime": "", "description": "", "nutrition": "" }
    },
    ... (repeat for all 7 days)
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
        : `You are a nutrition-focused meal planning assistant. Create a health-oriented 7-day meal plan.
Family Size: ${input.preferences.familySize || 'Not specified'}
Dietary Restrictions: ${input.preferences.dietaryRestrictions || 'None'}
Calorie Goal: ${input.preferences.calorieGoal || 'Not specified'} calories per day
Protein Goal: ${input.preferences.proteinGoal || 'Not specified'}g per day

Create a balanced meal plan focusing on nutritional goals:
- Daily calorie targets
- Protein distribution across meals
- Vitamin-rich ingredients
- Probiotic foods for gut health
- Balanced macros (protein, carbs, healthy fats)

For each day (Monday-Sunday), provide breakfast, lunch, dinner, and snacks with:
- Recipe name
- Calorie count
- Protein content
- Key vitamins and minerals
- Brief description

Also include:
- Daily nutrition summary
- Weekly shopping list
- Healthy substitution tips

Respond in JSON format with this structure:
{
  "weekPlan": {
    "Monday": {
      "breakfast": { "name": "", "calories": 0, "protein": 0, "vitamins": [], "description": "" },
      "lunch": { "name": "", "calories": 0, "protein": 0, "vitamins": [], "description": "" },
      "dinner": { "name": "", "calories": 0, "protein": 0, "vitamins": [], "description": "" },
      "snacks": { "name": "", "calories": 0, "protein": 0, "vitamins": [], "description": "" },
      "dailyTotals": { "calories": 0, "protein": 0, "carbs": 0, "fats": 0 }
    },
    ... (repeat for all 7 days)
  },
  "shoppingList": [],
  "nutritionTips": [],
  "substitutions": []
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const responseContent = response.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error("Failed to generate meal plan");
      }

      const generatedPlan = JSON.parse(responseContent);

      const newPlan = await storage.createMealPlan({
        planType: input.planType,
        preferences: input.preferences,
        meals: generatedPlan,
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
      const input = api.quickMeals.create.input.parse(req.body);
      
      const prompt = `You are a quick meal expert specializing in 5-minute dinner solutions for busy families.
Available ingredients: ${input.ingredients.join(', ')}

Generate 5 ultra-quick dinner ideas that:
- Take 5 minutes or less to prepare
- Use minimal ingredients (preferably from the list provided)
- Require minimal cooking (microwave, toaster, or no cooking preferred)
- Are family-friendly and nutritious
- Have simple, clear instructions

For each meal, provide:
- Name
- Ingredients needed
- Preparation time (should be ≤5 minutes)
- Step-by-step instructions (max 3 steps)
- Nutritional highlights
- Serving suggestions

Respond in JSON format:
{
  "quickMeals": [
    {
      "name": "",
      "ingredients": [],
      "prepTime": "",
      "instructions": [],
      "nutrition": "",
      "servingSuggestions": ""
    }
  ],
  "pantryEssentials": [],
  "timeSavingTips": []
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const responseContent = response.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error("Failed to generate quick meals");
      }

      const generatedMeals = JSON.parse(responseContent);

      const newMeal = await storage.createQuickMeal({
        ingredients: input.ingredients,
        meals: generatedMeals,
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
      const input = api.festivalRecipes.create.input.parse(req.body);
      
      const prompt = `You are a cultural cuisine expert specializing in festival and traditional recipes.
Festival: ${input.festival}
Region: ${input.region || 'Any'}
Culture: ${input.culture || 'Any'}

Provide authentic recipe recommendations for this festival, including:
- Traditional main dishes
- Side dishes and accompaniments
- Desserts and sweets
- Beverages

For each recipe, include:
- Recipe name (with cultural/regional name if applicable)
- Significance to the festival
- Ingredients list
- Difficulty level (Beginner/Intermediate/Advanced)
- Cooking time
- Brief cultural context
- Step-by-step instructions
- Serving suggestions
- Variations (modern twists, dietary adaptations)

Respond in JSON format:
{
  "festivalRecipes": [
    {
      "name": "",
      "culturalName": "",
      "category": "",
      "significance": "",
      "ingredients": [],
      "difficulty": "",
      "cookingTime": "",
      "culturalContext": "",
      "instructions": [],
      "servingSuggestions": "",
      "variations": []
    }
  ],
  "festivalTraditions": [],
  "cookingTips": [],
  "menuSuggestions": ""
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const responseContent = response.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error("Failed to generate festival recipes");
      }

      const generatedRecipes = JSON.parse(responseContent);

      const newRecipe = await storage.createFestivalRecipe({
        festival: input.festival,
        region: input.region || null,
        culture: input.culture || null,
        recipes: generatedRecipes,
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

  return httpServer;
}
