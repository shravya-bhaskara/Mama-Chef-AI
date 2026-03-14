import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, type CreateRecipeRequest } from "@shared/routes";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import {
  Loader2,
  Plus,
  X,
  Search,
  Utensils,
  Info,
  History,
  Calendar,
  ShieldPlus,
  Sparkles,
  Timer,
  ShoppingBag,
  Bot,
  Crown,
  Youtube,
  BookOpen,
  ChefHat,
  Heart,
  Flame,
  UtensilsCrossed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useIngredients } from "@/contexts/IngredientsContext";
import { useUser } from "@/contexts/UserContext";

const formSchema = z.object({
  ingredients: z.array(z.string()).min(1, "At least one ingredient is required"),
  preferences: z.object({
    cuisine: z.string().optional(),
    familySize: z.string().optional(),
    culture: z.string().optional(),
    dietaryRestrictions: z.string().optional(),
  }),
});

export default function Home() {
  const { toast } = useToast();
  const { userId } = useUser();
  const { ingredients, addIngredient: addToContext, removeIngredient: removeFromContext, setIngredients: setContextIngredients } = useIngredients();
  const [ingredientInput, setIngredientInput] = useState("");
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set());

  const form = useForm<CreateRecipeRequest>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: ingredients,
      preferences: {
        cuisine: "",
        familySize: "",
        culture: "",
        dietaryRestrictions: "",
      },
    },
  });

  // Sync form with context ingredients on mount and when context changes
  useEffect(() => {
    form.setValue("ingredients", ingredients);
  }, [ingredients, form]);

  const mutation = useMutation({
    mutationFn: async (data: CreateRecipeRequest) => {
      const res = await apiRequest("POST", "/api/recipes", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "Recipes generated!",
        description: "Check out the suggestions below.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate recipes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addIngredient = () => {
    if (ingredientInput.trim() && !ingredients.includes(ingredientInput.trim())) {
      addToContext(ingredientInput.trim());
      setIngredientInput("");
    }
  };

  const removeIngredient = (ing: string) => {
    removeFromContext(ing);
  };

  const handleLikeRecipe = async (recipe: any, index: number) => {
    const recipeId = `recipe-${index}`;
    
    if (likedRecipes.has(recipeId)) {
      setLikedRecipes(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipeId);
        return newSet;
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/favorites", {
        userId,
        recipeType: 'recipe',
        recipeData: recipe,
      });
      
      setLikedRecipes(prev => new Set(prev).add(recipeId));
      toast({
        title: "Added to favorites! ❤️",
        description: "Recipe saved to your favorites.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to favorites.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: CreateRecipeRequest) => {
    mutation.mutate(data);
  };

  const planningSections = [
    {
      title: "Weekly AI Meal Planner",
      description:
        "Build a 7-day plan for breakfast, lunch, dinner, and snacks based on your family size, pantry ingredients, and preferred cuisine.",
      icon: Calendar,
      highlight: "Free first month · then premium",
      points: [
        "Auto-generates weekly schedule with prep-friendly meal flow",
        "Adapts to leftovers to reduce food waste",
        "Creates a smart grocery add-on list",
      ],
    },
    {
      title: "Weekly AI Health Meal Plan",
      description:
        "Get weekly plans designed for calorie balance, protein goals, vitamins, and probiotic-rich foods essential for healthy nutrition.",
      icon: ShieldPlus,
      highlight: "Free first month · then premium",
      points: [
        "Daily nutrition targets for calories and protein",
        "Vitamin-forward suggestions with fruit/veg rotation",
        "Gut-friendly probiotic ideas through the week",
      ],
    },
  ];

  const premiumPacks = [
    "No-fuss lunchbox packs with home-available ingredients",
    "Batch-cook friendly family boxes for weekdays",
    "Regional lunchbox twists (Indian, Mediterranean, Asian, and more)",
  ];

  const festivalFeatures = [
    "Festival recommendations by region, cuisine, and cultural traditions",
    "Learns from your past cooking choices to personalize holiday menus",
    "Suggests beginner, family-style, and celebration-size options",
  ];

  const agentFeatures = [
    "Planner Agent: creates weekly schedules",
    "Nutrition Agent: monitors calorie, protein, vitamin, and probiotic goals",
    "Budget Agent: optimizes for pantry-first and low-cost substitutions",
  ];

  const rescueIdeas = [
    "15-minute chickpea masala wrap",
    "One-pan garlic egg fried rice",
    "Greek yogurt veggie toast with seeds",
    "Microwave sweet potato protein bowl",
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF5] pb-12">
      <header className="bg-white border-b border-orange-100 py-6 px-4 mb-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-display font-bold text-gray-800 tracking-tight">Mama's Kitchen AI</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/favorites">
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2">
                <Heart className="h-4 w-4" />
                Favorites
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-2">
                <History className="h-4 w-4" />
                History
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 space-y-8">
        <Card className="border-orange-100 shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <UtensilsCrossed className="h-6 w-6 text-orange-500" />
              What's in your pantry?
            </CardTitle>
            <CardDescription>Enter the ingredients you have and discover recipes from cuisines around the world. Your ingredients will be saved as you navigate.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormLabel className="text-gray-700">Ingredients</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Tomato, Chicken, Spinach..."
                      value={ingredientInput}
                      onChange={(e) => setIngredientInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addIngredient())}
                      className="border-orange-200 focus-visible:ring-orange-500"
                    />
                    <Button type="button" onClick={addIngredient} className="bg-orange-500 hover:bg-orange-600">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {ingredients.map((ing) => (
                        <motion.div
                          key={ing}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                        >
                          <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 px-3 py-1 gap-2">
                            {ing}
                            <X className="h-3 w-3 cursor-pointer hover:text-orange-900" onClick={() => removeIngredient(ing)} />
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  {form.formState.errors.ingredients && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.ingredients.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="preferences.cuisine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cuisine Preference</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-orange-200">
                              <SelectValue placeholder="Select cuisine" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Italian">Italian</SelectItem>
                            <SelectItem value="Indian">Indian</SelectItem>
                            <SelectItem value="Chinese">Chinese</SelectItem>
                            <SelectItem value="Mexican">Mexican</SelectItem>
                            <SelectItem value="American">American</SelectItem>
                            <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                            <SelectItem value="Any">Any Cuisine</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferences.familySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Family Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-orange-200">
                              <SelectValue placeholder="How many people?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-2">1-2 People</SelectItem>
                            <SelectItem value="3-4">3-4 People</SelectItem>
                            <SelectItem value="5+">5+ People</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="preferences.culture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cultural Background</FormLabel>
                        <Input {...field} placeholder="e.g. French, Japanese, etc." className="border-orange-200" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferences.dietaryRestrictions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dietary Restrictions</FormLabel>
                        <Input {...field} placeholder="e.g. Vegetarian, Gluten-free" className="border-orange-200" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={mutation.isPending} className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-lg font-bold shadow-lg shadow-orange-200">
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Cooking up some ideas...
                    </>
                  ) : (
                    "Get Recipe Ideas"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <h2 className="text-2xl font-display font-bold text-gray-800">AI Planning Features</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {planningSections.map((section) => (
              <Link key={section.title} href="/meal-planner">
                <Card className="border-orange-100 bg-white hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg text-gray-900">{section.title}</CardTitle>
                        <CardDescription className="mt-2">{section.description}</CardDescription>
                      </div>
                      <section.icon className="h-5 w-5 text-orange-500 shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100">{section.highlight}</Badge>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {section.points.map((point) => (
                        <li key={point} className="flex gap-2">
                          <span className="text-orange-500">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <Link href="/recipe-packs">
            <Card className="border-orange-100 bg-white hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg text-gray-900">Recipe Packs for Subscribers</CardTitle>
                  <Crown className="h-5 w-5 text-amber-500" />
                </div>
                <CardDescription>
                  Curated recipe packs focused on simple lunchbox recipes using ingredients usually available at home.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge className="bg-amber-50 text-amber-700 border border-amber-100">Try Now</Badge>
                {premiumPacks.map((pack) => (
                  <p key={pack} className="text-sm text-gray-700 flex gap-2">
                    <ShoppingBag className="h-4 w-4 text-orange-500 mt-0.5" />
                    <span>{pack}</span>
                  </p>
                ))}
              </CardContent>
            </Card>
          </Link>

          <Link href="/festival-recipes">
            <Card className="border-orange-100 bg-white hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg text-gray-900">Festival & Cultural Recipes</CardTitle>
                  <Sparkles className="h-5 w-5 text-pink-500" />
                </div>
                <CardDescription>
                  Discover recipes for festivals with recommendations tuned by cuisine, region, culture, and your past usage patterns.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {festivalFeatures.map((feature) => (
                  <p key={feature} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-pink-500">✦</span>
                    <span>{feature}</span>
                  </p>
                ))}
              </CardContent>
            </Card>
          </Link>

          <Card className="border-orange-100 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg text-gray-900">AI Agents Orchestration</CardTitle>
                <Bot className="h-5 w-5 text-indigo-500" />
              </div>
              <CardDescription>
                Multi-agent planning keeps tasks efficient by splitting planning, nutrition, and budget responsibilities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {agentFeatures.map((feature) => (
                <p key={feature} className="text-sm text-gray-700">• {feature}</p>
              ))}
            </CardContent>
          </Card>

          <Link href="/quick-meals">
            <Card className="border-orange-100 bg-white hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg text-gray-900">5-Minute Dinner Rescue</CardTitle>
                  <Timer className="h-5 w-5 text-rose-500" />
                </div>
                <CardDescription>
                  A dedicated section for emergency quick dinners when you need something fast and reliable.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2">
                {rescueIdeas.map((idea) => (
                  <Badge key={idea} variant="outline" className="justify-start py-2 px-3 bg-rose-50/40 border-rose-100 text-gray-700">
                    {idea}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </Link>
        </section>

        <AnimatePresence>
          {mutation.data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 gap-6"
            >
              <div className="flex items-center justify-between mt-8 mb-4">
                <h2 className="text-2xl font-display font-bold text-gray-800 flex items-center gap-2">
                  <ChefHat className="h-6 w-6 text-orange-500" />
                  Mama's Suggestions
                </h2>
                <Badge className="bg-orange-100 text-orange-700">
                  {mutation.data.suggestions.length} Recipes from Around the World
                </Badge>
              </div>
              {mutation.data.suggestions.map((suggestion: any, idx: number) => {
                const isLiked = likedRecipes.has(`recipe-${idx}`);
                return (
                  <Card key={idx} className="border-orange-100 overflow-hidden hover:shadow-md transition-shadow relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`absolute top-4 right-4 z-10 ${isLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                      onClick={() => handleLikeRecipe(suggestion, idx)}
                    >
                      <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                    </Button>
                    
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start gap-4 pr-12">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <ChefHat className="h-5 w-5 text-orange-500" />
                            <h3 className="text-xl font-bold text-gray-900">{suggestion.name}</h3>
                          </div>
                          <p className="text-gray-600">{suggestion.description}</p>
                          
                          {/* Meal Type & Cooking Time */}
                          <div className="flex gap-2 flex-wrap">
                            {suggestion.mealType && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                {suggestion.mealType}
                              </Badge>
                            )}
                            {suggestion.cookingTime && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                ⏱️ {suggestion.cookingTime}
                              </Badge>
                            )}
                            {suggestion.servings && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                🍽️ {suggestion.servings}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Recipe Links */}
                      <div className="flex gap-2 flex-wrap">
                        {suggestion.videoUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
                            onClick={() => window.open(suggestion.videoUrl, "_blank")}
                          >
                            <Youtube className="h-4 w-4" />
                            Watch Video
                          </Button>
                        )}
                        {suggestion.blogUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 gap-2"
                            onClick={() => window.open(suggestion.blogUrl, "_blank")}
                          >
                            <BookOpen className="h-4 w-4" />
                            Read Recipe
                          </Button>
                        )}
                        {!suggestion.videoUrl && !suggestion.blogUrl && suggestion.recipeSearchQuery && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-orange-200 text-orange-600 hover:bg-orange-50 gap-2"
                            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(suggestion.recipeSearchQuery)}`, "_blank")}
                          >
                            <Search className="h-4 w-4" />
                            Find Recipe
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Ingredients */}
                        <div>
                          <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Ingredients</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {suggestion.ingredientsUsed.map((ing: string) => (
                              <Badge key={ing} variant="outline" className="bg-white text-gray-700 border-gray-200 font-normal text-xs">
                                {ing}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Nutritional Info */}
                        {(suggestion.calories || suggestion.protein) && (
                          <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                            <div className="flex items-center gap-2 mb-1">
                              <Flame className="h-4 w-4 text-orange-500" />
                              <span className="text-sm font-bold text-orange-700">Nutrition</span>
                            </div>
                            <div className="flex gap-3 text-xs">
                              {suggestion.calories > 0 && (
                                <span className="text-orange-700 font-medium">{suggestion.calories} cal</span>
                              )}
                              {suggestion.protein > 0 && (
                                <span className="text-blue-700 font-medium">{suggestion.protein}g protein</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cooking Instructions */}
                      {suggestion.instructions && suggestion.instructions.length > 0 && (
                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-2 mb-3">
                            <ChefHat className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-bold text-blue-700">Cooking Steps</span>
                          </div>
                          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-900">
                            {suggestion.instructions.map((step: string, i: number) => (
                              <li key={i} className="leading-relaxed">{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Nutritional Details */}
                      {suggestion.nutritionalInfo && (
                        <div className="bg-green-50/50 p-4 rounded-lg border border-green-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Info className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-bold text-green-700">Nutritional Benefits</span>
                          </div>
                          <p className="text-sm text-green-900 leading-relaxed">{suggestion.nutritionalInfo}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
