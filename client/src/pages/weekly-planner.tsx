import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, ChevronLeft, ShoppingCart, Youtube, BookOpen, Flame, Dumbbell, Wheat, Droplets, ChefHat, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";

const formSchema = z.object({
  preferences: z.object({
    familySize: z.string().optional(),
    cuisine: z.string().optional(),
    dietaryRestrictions: z.string().optional(),
    ageBracket: z.string().optional(),
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function WeeklyPlanner() {
  const { toast } = useToast();
  const { userId } = useUser();
  const [likedMeals, setLikedMeals] = useState<Set<string>>(new Set());

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferences: {
        familySize: '',
        cuisine: '',
        dietaryRestrictions: '',
        ageBracket: '',
      },
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        planType: 'weekly',
        preferences: data.preferences,
      };
      const res = await apiRequest("POST", "/api/meal-plans", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Weekly meal plan generated! 🎉",
        description: "Your personalized 7-day meal plan is ready.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const handleLike = async (meal: any, day: string, mealType: string) => {
    const mealId = `${day}-${mealType}`;
    
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
        recipeType: 'meal_plan',
        recipeData: { ...meal, day, mealType },
      });
      
      setLikedMeals(prev => new Set(prev).add(mealId));
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

  const renderMealCard = (meal: any, mealType: string, day: string) => {
    const mealId = `${day}-${mealType}`;
    const isLiked = likedMeals.has(mealId);

    return (
      <Card className="border-orange-100 relative">
        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-2 right-2 z-10 ${isLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
          onClick={() => handleLike(meal, day, mealType)}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
        </Button>
        
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-orange-500" />
            <CardTitle className="text-sm font-bold text-orange-600 uppercase">{mealType}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <h4 className="font-bold text-gray-900">{meal.name}</h4>
          <p className="text-sm text-gray-600">{meal.description}</p>
          {meal.prepTime && <p className="text-xs text-gray-500">⏱️ {meal.prepTime}</p>}

          {meal.mealType && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              {meal.mealType}
            </Badge>
          )}

          {(meal.calories || meal.protein || meal.carbs || meal.fats) && (
            <div className="bg-orange-50 rounded-lg p-2 space-y-1">
              <div className="flex flex-wrap gap-2 text-xs">
                {meal.calories > 0 && (
                  <span className="flex items-center gap-1 text-orange-700 font-medium">
                    <Flame className="h-3 w-3" /> {meal.calories} cal
                  </span>
                )}
                {meal.protein > 0 && (
                  <span className="flex items-center gap-1 text-blue-700 font-medium">
                    <Dumbbell className="h-3 w-3" /> {meal.protein}g protein
                  </span>
                )}
                {meal.carbs > 0 && (
                  <span className="flex items-center gap-1 text-amber-700 font-medium">
                    <Wheat className="h-3 w-3" /> {meal.carbs}g carbs
                  </span>
                )}
                {meal.fats > 0 && (
                  <span className="flex items-center gap-1 text-green-700 font-medium">
                    <Droplets className="h-3 w-3" /> {meal.fats}g fats
                  </span>
                )}
              </div>
            </div>
          )}

          {meal.instructions && meal.instructions.length > 0 && (
            <div className="mt-3">
              <h5 className="font-semibold text-xs text-gray-700 mb-2">Cooking Steps:</h5>
              <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600">
                {meal.instructions.slice(0, 3).map((step: string, i: number) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          <div className="flex gap-2 flex-wrap pt-1">
            {meal.videoUrl && (
              <a href={meal.videoUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 rounded-md px-2 py-1 transition-colors">
                <Youtube className="h-3 w-3" /> Watch
              </a>
            )}
            {meal.blogUrl && (
              <a href={meal.blogUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-md px-2 py-1 transition-colors">
                <BookOpen className="h-3 w-3" /> Recipe
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderWeekPlan = (plan: any) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return (
      <div className="space-y-8">
        {days.map((day) => (
          <div key={day} className="space-y-3">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              {day}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plan.weekPlan[day] && (
                <>
                  {renderMealCard(plan.weekPlan[day].breakfast, 'Breakfast', day)}
                  {renderMealCard(plan.weekPlan[day].lunch, 'Lunch', day)}
                  {renderMealCard(plan.weekPlan[day].dinner, 'Dinner', day)}
                  {renderMealCard(plan.weekPlan[day].snacks, 'Snacks', day)}
                </>
              )}
            </div>
          </div>
        ))}

        {plan.groceryList && (
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                Shopping List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(plan.groceryList).map(([category, items]: [string, any]) => (
                  <div key={category}>
                    <h4 className="font-bold text-green-700 capitalize mb-2">{category}</h4>
                    <ul className="space-y-1 text-sm">
                      {items.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {plan.mealPrepTips && (
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle className="text-purple-700">Meal Prep Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {plan.mealPrepTips.map((tip: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-purple-600">→</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] pb-12">
      <header className="bg-white border-b border-orange-100 py-6 px-4 mb-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-display font-bold text-gray-800 tracking-tight">Weekly Meal Planner</h1>
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

      <main className="max-w-7xl mx-auto px-4 space-y-8">
        <Card className="border-orange-100 shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-orange-500" />
              Create Your Weekly Meal Plan
            </CardTitle>
            <CardDescription>Get a personalized 7-day meal plan with dishes from around the world, tailored to your family's needs</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="preferences.familySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Family Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-orange-200">
                              <SelectValue placeholder="Select family size" />
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
                            <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                            <SelectItem value="Japanese">Japanese</SelectItem>
                            <SelectItem value="Thai">Thai</SelectItem>
                            <SelectItem value="Any">Any Cuisine</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="preferences.ageBracket"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age Bracket</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-orange-200">
                              <SelectValue placeholder="Select age group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Kids (2-12)">Kids (2-12 years)</SelectItem>
                            <SelectItem value="Teens (13-19)">Teens (13-19 years)</SelectItem>
                            <SelectItem value="Adults (20-60)">Adults (20-60 years)</SelectItem>
                            <SelectItem value="Seniors (60+)">Seniors (60+ years)</SelectItem>
                            <SelectItem value="Mixed">Mixed Ages</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Input {...field} placeholder="e.g., Vegetarian, Gluten-free" className="border-orange-200" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={mutation.isPending} 
                  className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-lg font-bold shadow-lg shadow-orange-200"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating your weekly meal plan...
                    </>
                  ) : (
                    <>
                      <ChefHat className="mr-2 h-5 w-5" />
                      Generate Weekly Meal Plan
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <AnimatePresence>
          {mutation.data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-display font-bold text-gray-800 flex items-center gap-2">
                <ChefHat className="h-6 w-6 text-orange-500" />
                Your 7-Day Meal Plan
              </h2>
              {renderWeekPlan(mutation.data.meals)}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
