import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Timer, Plus, X, ChevronLeft, Clock, Youtube, BookOpen, Flame, Dumbbell, ChefHat, Heart, GraduationCap, UtensilsCrossed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useIngredients } from "@/contexts/IngredientsContext";
import { useUser } from "@/contexts/UserContext";

export default function QuickMeals() {
  const { toast } = useToast();
  const { userId } = useUser();
  const { ingredients, addIngredient: addToContext, removeIngredient: removeFromContext } = useIngredients();
  const [ingredientInput, setIngredientInput] = useState("");
  const [likedMeals, setLikedMeals] = useState<Set<string>>(new Set());

  const mutation = useMutation({
    mutationFn: async (data: { ingredients: string[] }) => {
      const res = await apiRequest("POST", "/api/quick-meals", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Quick meals generated!",
        description: "Check out your 5-minute dinner ideas below.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate quick meals. Please try again.",
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

  const handleLike = async (meal: any, mealId: string) => {
    if (likedMeals.has(mealId)) {
      setLikedMeals(prev => {
        const newSet = new Set(prev);
        newSet.delete(mealId);
        return newSet;
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/favorites", {
        userId,
        recipeType: 'quick_meal',
        recipeData: meal,
      });
      
      setLikedMeals(prev => new Set(prev).add(mealId));
      toast({
        title: "Added to favorites! ❤️",
        description: "Meal saved to your favorites.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to favorites.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.length === 0) {
      toast({
        title: "No ingredients",
        description: "Please add at least one ingredient.",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate({ ingredients });
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] pb-12">
      <header className="bg-white border-b border-orange-100 py-6 px-4 mb-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Timer className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-display font-bold text-gray-800 tracking-tight">Quick Meals & Hostel Food</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/favorites">
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2">
                <Heart className="h-4 w-4" />
                Favorites
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 space-y-8">
        <Card className="border-orange-100 shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-orange-500" />
              Quick Meal Ideas
            </CardTitle>
            <CardDescription>
              Enter ingredients for ultra-quick 5-minute dinners AND creative hostel-friendly meals with minimal equipment!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">Available Ingredients</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Bread, Eggs, Cheese..."
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
              </div>

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-lg font-bold shadow-lg shadow-orange-200"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Finding quick meals...
                  </>
                ) : (
                  "Get Quick Meal Ideas"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <AnimatePresence>
          {mutation.data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Tabs defaultValue="quick" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="quick" className="gap-2">
                    <Timer className="h-4 w-4" />
                    5-Minute Dinners ({mutation.data.meals.quickMeals?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="hostel" className="gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Hostel Quick Food ({mutation.data.meals.hostelMeals?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="quick" className="space-y-6">
                  <h2 className="text-2xl font-display font-bold text-gray-800 flex items-center gap-2">
                    <Timer className="h-6 w-6 text-orange-500" />
                    5-Minute Dinner Rescue
                  </h2>
                  <div className="grid grid-cols-1 gap-6">
                    {mutation.data.meals.quickMeals?.map((meal: any, idx: number) => {
                      const mealId = `quick-${idx}`;
                      const isLiked = likedMeals.has(mealId);
                      return (
                        <Card key={idx} className="border-orange-100 hover:shadow-md transition-shadow relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`absolute top-2 right-2 z-10 ${isLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                            onClick={() => handleLike(meal, mealId)}
                          >
                            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                          </Button>

                          <CardHeader>
                            <div className="flex justify-between items-start pr-10">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <ChefHat className="h-5 w-5 text-orange-500" />
                                  <CardTitle className="text-xl text-gray-900">{meal.name}</CardTitle>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                  <Badge className="bg-rose-50 text-rose-700 border-rose-200">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {meal.prepTime}
                                  </Badge>
                                  {meal.mealType && (
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                      {meal.mealType}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="font-bold text-gray-700 mb-2">Ingredients:</h4>
                              <div className="flex flex-wrap gap-2">
                                {meal.ingredients.map((ing: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-gray-700">
                                    {ing}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-bold text-gray-700 mb-2">Instructions:</h4>
                              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                                {meal.instructions.map((step: string, i: number) => (
                                  <li key={i}>{step}</li>
                                ))}
                              </ol>
                            </div>

                            {(meal.calories || meal.protein) && (
                              <div className="flex gap-3 flex-wrap">
                                {meal.calories > 0 && (
                                  <span className="flex items-center gap-1 text-sm text-orange-700 font-medium bg-orange-50 border border-orange-200 rounded-md px-3 py-1">
                                    <Flame className="h-4 w-4" /> {meal.calories} cal
                                  </span>
                                )}
                                {meal.protein > 0 && (
                                  <span className="flex items-center gap-1 text-sm text-blue-700 font-medium bg-blue-50 border border-blue-200 rounded-md px-3 py-1">
                                    <Dumbbell className="h-4 w-4" /> {meal.protein}g protein
                                  </span>
                                )}
                              </div>
                            )}

                            {meal.nutrition && (
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <h4 className="font-bold text-blue-700 text-sm mb-1">Nutritional Highlights</h4>
                                <p className="text-sm text-blue-900">{meal.nutrition}</p>
                              </div>
                            )}

                            {meal.servingSuggestions && (
                              <div className="bg-green-50 p-3 rounded-lg">
                                <h4 className="font-bold text-green-700 text-sm mb-1">Serving Suggestions</h4>
                                <p className="text-sm text-green-900">{meal.servingSuggestions}</p>
                              </div>
                            )}

                            <div className="flex gap-3 flex-wrap pt-1">
                              {meal.videoUrl && (
                                <a href={meal.videoUrl} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 gap-2">
                                    <Youtube className="h-4 w-4" /> Watch on YouTube
                                  </Button>
                                </a>
                              )}
                              {meal.recipeUrl && (
                                <a href={meal.recipeUrl} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50 gap-2">
                                    <BookOpen className="h-4 w-4" /> Read Full Recipe
                                  </Button>
                                </a>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="hostel" className="space-y-6">
                  <h2 className="text-2xl font-display font-bold text-gray-800 flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-purple-500" />
                    Hostel Quick Food Ideas
                  </h2>
                  <p className="text-gray-600">Creative meals with minimal ingredients, perfect for dorm cooking with limited equipment!</p>
                  <div className="grid grid-cols-1 gap-6">
                    {mutation.data.meals.hostelMeals?.map((meal: any, idx: number) => {
                      const mealId = `hostel-${idx}`;
                      const isLiked = likedMeals.has(mealId);
                      return (
                        <Card key={idx} className="border-purple-100 hover:shadow-md transition-shadow relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`absolute top-2 right-2 z-10 ${isLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                            onClick={() => handleLike(meal, mealId)}
                          >
                            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                          </Button>

                          <CardHeader>
                            <div className="flex justify-between items-start pr-10">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <GraduationCap className="h-5 w-5 text-purple-500" />
                                  <CardTitle className="text-xl text-gray-900">{meal.name}</CardTitle>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                  <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {meal.prepTime}
                                  </Badge>
                                  {meal.mealType && (
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                      {meal.mealType}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {meal.equipment && meal.equipment.length > 0 && (
                              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                <h4 className="font-bold text-purple-700 text-sm mb-2">Equipment Needed:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {meal.equipment.map((equip: string, i: number) => (
                                    <Badge key={i} variant="outline" className="bg-white text-purple-700 border-purple-200">
                                      {equip}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <h4 className="font-bold text-gray-700 mb-2">Ingredients:</h4>
                              <div className="flex flex-wrap gap-2">
                                {meal.ingredients.map((ing: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-gray-700">
                                    {ing}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-bold text-gray-700 mb-2">Instructions:</h4>
                              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                                {meal.instructions.map((step: string, i: number) => (
                                  <li key={i}>{step}</li>
                                ))}
                              </ol>
                            </div>

                            {(meal.calories || meal.protein) && (
                              <div className="flex gap-3 flex-wrap">
                                {meal.calories > 0 && (
                                  <span className="flex items-center gap-1 text-sm text-orange-700 font-medium bg-orange-50 border border-orange-200 rounded-md px-3 py-1">
                                    <Flame className="h-4 w-4" /> {meal.calories} cal
                                  </span>
                                )}
                                {meal.protein > 0 && (
                                  <span className="flex items-center gap-1 text-sm text-blue-700 font-medium bg-blue-50 border border-blue-200 rounded-md px-3 py-1">
                                    <Dumbbell className="h-4 w-4" /> {meal.protein}g protein
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="flex gap-3 flex-wrap pt-1">
                              {meal.videoUrl && (
                                <a href={meal.videoUrl} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 gap-2">
                                    <Youtube className="h-4 w-4" /> Watch on YouTube
                                  </Button>
                                </a>
                              )}
                              {meal.recipeUrl && (
                                <a href={meal.recipeUrl} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50 gap-2">
                                    <BookOpen className="h-4 w-4" /> Read Full Recipe
                                  </Button>
                                </a>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>

              {mutation.data.meals.timeSavingTips && mutation.data.meals.timeSavingTips.length > 0 && (
                <Card className="border-purple-200 bg-purple-50/50">
                  <CardHeader>
                    <CardTitle className="text-purple-700">Time-Saving Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {mutation.data.meals.timeSavingTips.map((tip: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-purple-600">→</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
