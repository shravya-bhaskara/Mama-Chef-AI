import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  ingredients: text("ingredients").array().notNull(),
  preferences: jsonb("preferences").notNull(),
  suggestions: jsonb("suggestions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRecipeSchema = createInsertSchema(recipes).pick({
  ingredients: true,
  preferences: true,
});

export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;

export type RecipeSuggestion = {
  name: string;
  description: string;
  ingredientsUsed: string[];
  nutritionalInfo: string;
  recipeSearchQuery: string;
  videoUrl?: string;
  blogUrl?: string;
};

export type RecipeGenerationRequest = {
  ingredients: string[];
  preferences: {
    cuisine?: string;
    familySize?: string;
    culture?: string;
    dietaryRestrictions?: string;
  };
};

// Meal Plans Table
export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  planType: text("plan_type").notNull(), // 'weekly' or 'health'
  preferences: jsonb("preferences").notNull(),
  meals: jsonb("meals").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type MealPlan = typeof mealPlans.$inferSelect;

// Quick Meals Table
export const quickMeals = pgTable("quick_meals", {
  id: serial("id").primaryKey(),
  ingredients: text("ingredients").array().notNull(),
  meals: jsonb("meals").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type QuickMeal = typeof quickMeals.$inferSelect;

// Festival Recipes Table
export const festivalRecipes = pgTable("festival_recipes", {
  id: serial("id").primaryKey(),
  festival: text("festival").notNull(),
  region: text("region"),
  culture: text("culture"),
  recipes: jsonb("recipes").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type FestivalRecipe = typeof festivalRecipes.$inferSelect;

// Favorites Table
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Simple device-based user ID
  recipeType: text("recipe_type").notNull(), // 'recipe', 'meal_plan', 'quick_meal', 'festival_recipe', 'hostel_meal'
  recipeId: serial("recipe_id"),
  recipeData: jsonb("recipe_data").notNull(), // Store the full recipe data
  createdAt: timestamp("created_at").defaultNow(),
});

export type Favorite = typeof favorites.$inferSelect;

// Hostel Meals Table
export const hostelMeals = pgTable("hostel_meals", {
  id: serial("id").primaryKey(),
  ingredients: text("ingredients").array(),
  meals: jsonb("meals").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type HostelMeal = typeof hostelMeals.$inferSelect;
