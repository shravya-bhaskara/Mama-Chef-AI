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
