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
        model: "gpt-5.1",
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

  return httpServer;
}
