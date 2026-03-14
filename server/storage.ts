import { db } from "./db";
import { 
  recipes, 
  mealPlans, 
  quickMeals, 
  festivalRecipes,
  favorites,
  hostelMeals,
  type Recipe, 
  type InsertRecipe,
  type MealPlan,
  type QuickMeal,
  type FestivalRecipe,
  type Favorite,
  type HostelMeal
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: number): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe & { suggestions: any }): Promise<Recipe>;
  
  // Meal Plans
  getMealPlans(): Promise<MealPlan[]>;
  getMealPlan(id: number): Promise<MealPlan | undefined>;
  createMealPlan(plan: any): Promise<MealPlan>;
  
  // Quick Meals
  getQuickMeals(): Promise<QuickMeal[]>;
  createQuickMeal(meal: any): Promise<QuickMeal>;
  
  // Festival Recipes
  getFestivalRecipes(): Promise<FestivalRecipe[]>;
  createFestivalRecipe(recipe: any): Promise<FestivalRecipe>;
  
  // Hostel Meals
  getHostelMeals(): Promise<HostelMeal[]>;
  createHostelMeal(meal: any): Promise<HostelMeal>;
  
  // Favorites
  getFavorites(userId: string): Promise<Favorite[]>;
  addFavorite(favorite: any): Promise<Favorite>;
  removeFavorite(userId: string, id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getRecipes(): Promise<Recipe[]> {
    return await db.select().from(recipes).orderBy(desc(recipes.createdAt));
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe;
  }

  async createRecipe(recipe: InsertRecipe & { suggestions: any }): Promise<Recipe> {
    const [newRecipe] = await db.insert(recipes).values(recipe).returning();
    return newRecipe;
  }

  // Meal Plans
  async getMealPlans(): Promise<MealPlan[]> {
    return await db.select().from(mealPlans).orderBy(desc(mealPlans.createdAt));
  }

  async getMealPlan(id: number): Promise<MealPlan | undefined> {
    const [plan] = await db.select().from(mealPlans).where(eq(mealPlans.id, id));
    return plan;
  }

  async createMealPlan(plan: any): Promise<MealPlan> {
    const [newPlan] = await db.insert(mealPlans).values(plan).returning();
    return newPlan;
  }

  // Quick Meals
  async getQuickMeals(): Promise<QuickMeal[]> {
    return await db.select().from(quickMeals).orderBy(desc(quickMeals.createdAt));
  }

  async createQuickMeal(meal: any): Promise<QuickMeal> {
    const [newMeal] = await db.insert(quickMeals).values(meal).returning();
    return newMeal;
  }

  // Festival Recipes
  async getFestivalRecipes(): Promise<FestivalRecipe[]> {
    return await db.select().from(festivalRecipes).orderBy(desc(festivalRecipes.createdAt));
  }

  async createFestivalRecipe(recipe: any): Promise<FestivalRecipe> {
    const [newRecipe] = await db.insert(festivalRecipes).values(recipe).returning();
    return newRecipe;
  }

  // Hostel Meals
  async getHostelMeals(): Promise<HostelMeal[]> {
    return await db.select().from(hostelMeals).orderBy(desc(hostelMeals.createdAt));
  }

  async createHostelMeal(meal: any): Promise<HostelMeal> {
    const [newMeal] = await db.insert(hostelMeals).values(meal).returning();
    return newMeal;
  }

  // Favorites
  async getFavorites(userId: string): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt));
  }

  async addFavorite(favorite: any): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    return newFavorite;
  }

  async removeFavorite(userId: string, id: number): Promise<void> {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.id, id)));
  }
}

export const storage = new DatabaseStorage();
