import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Apple, ChevronLeft, ShoppingCart, Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  planType: z.enum(['weekly', 'health']),
  preferences: z.object({
    familySize: z.string().optional(),
    cuisine: z.string().optional(),
    dietaryRestrictions: z.string().optional(),
    calorieGoal: z.string().optional(),
    proteinGoal: z.string().optional(),
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function MealPlanner() {
  const { toast } = useToast();
  const [planType, setPlanType] = useState<'weekly' | 'health'>('weekly');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planType: 'weekly',
      preferences: {
        familySize: '',
        cuisine: '',
        dietaryRestrictions: '',
        calorieGoal: '',
        proteinGoal: '',
      },
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        preferences: {
          ...data.preferences,
          calorieGoal: data.preferences.calorieGoal ? parseInt(data.preferences.calorieGoal) : undefined,
          proteinGoal: data.preferences.proteinGoal ? parseInt(data.preferences.proteinGoal) : undefined,
        },
      };
      const res = await apiRequest("POST", "/api/meal-plans", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Meal plan generated!",
        description: "Your personalized meal plan is ready.",
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

  const renderMealCard = (meal: any, mealType: string) => (
    <Card className="border-orange-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-orange-600 uppercase">{mealType}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <h4 className="font-bold text-gray-900">{meal.name}</h4>
        <p className="text-sm text-gray-600">{meal.description}</p>
        {meal.prepTime && <p className="text-xs text-gray-500">⏱️ {meal.prepTime}</p>}
        {meal.calories && (
          <div className="flex gap-2 text-xs">
            <Badge variant="outline">{meal.calories} cal</Badge>
            {meal.protein && <Badge variant="outline">{meal.protein}g protein</Badge>}
          </div>
        )}
        {meal.nutrition && <p className="text-xs text-blue-600">{meal.nutrition}</p>}
      </CardContent>
    </Card>
  );

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
                  {renderMealCard(plan.weekPlan[day].breakfast, 'Breakfast')}
                  {renderMealCard(plan.weekPlan[day].lunch, 'Lunch')}
                  {renderMealCard(plan.weekPlan[day].dinner, 'Dinner')}
                  {renderMealCard(plan.weekPlan[day].snacks, 'Snacks')}
                </>
              )}
            </div>
            {plan.weekPlan[day]?.dailyTotals && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex gap-4 text-sm font-medium">
                    <span>Daily Totals:</span>
                    <span>{plan.weekPlan[day].dailyTotals.calories} cal</span>
                    <span>{plan.weekPlan[day].dailyTotals.protein}g protein</span>
                    <span>{plan.weekPlan[day].dailyTotals.carbs}g carbs</span>
                    <span>{plan.weekPlan[day].dailyTotals.fats}g fats</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ))}

        {/* Grocery List */}
        {(plan.groceryList || plan.shoppingList) && (
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                Shopping List
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plan.groceryList && (
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
              )}
              {plan.shoppingList && (
                <ul className="space-y-1 text-sm">
                  {plan.shoppingList.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        {(plan.mealPrepTips || plan.nutritionTips) && (
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle className="text-purple-700">Tips & Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.mealPrepTips && (
                <div>
                  <h4 className="font-bold text-purple-700 mb-2">Meal Prep Tips</h4>
                  <ul className="space-y-1 text-sm">
                    {plan.mealPrepTips.map((tip: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-600">→</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {plan.nutritionTips && (
                <div>
                  <h4 className="font-bold text-purple-700 mb-2">Nutrition Tips</h4>
                  <ul className="space-y-1 text-sm">
                    {plan.nutritionTips.map((tip: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-600">→</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
            <h1 className="text-2xl font-display font-bold text-gray-800 tracking-tight">AI Meal Planner</h1>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 space-y-8">
        <Card className="border-orange-100 shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Create Your Meal Plan</CardTitle>
            <CardDescription>Get a personalized 7-day meal plan tailored to your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={planType} onValueChange={(value) => { setPlanType(value as 'weekly' | 'health'); form.setValue('planType', value as 'weekly' | 'health'); }}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="weekly" className="gap-2">
                  <Utensils className="h-4 w-4" />
                  Weekly Planner
                </TabsTrigger>
                <TabsTrigger value="health" className="gap-2">
                  <Apple className="h-4 w-4" />
                  Health-Focused
                </TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <TabsContent value="weekly" className="space-y-4 mt-0">
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
                                <SelectItem value="Any">Any Cuisine</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

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
                  </TabsContent>

                  <TabsContent value="health" className="space-y-4 mt-0">
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
                        name="preferences.dietaryRestrictions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dietary Restrictions</FormLabel>
                            <Input {...field} placeholder="e.g., Vegetarian, Low-carb" className="border-orange-200" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="preferences.calorieGoal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Daily Calorie Goal</FormLabel>
                            <Input {...field} type="number" placeholder="e.g., 2000" className="border-orange-200" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="preferences.proteinGoal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Daily Protein Goal (g)</FormLabel>
                            <Input {...field} type="number" placeholder="e.g., 150" className="border-orange-200" />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <Button 
                    type="submit" 
                    disabled={mutation.isPending} 
                    className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-lg font-bold shadow-lg shadow-orange-200"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating meal plan...
                      </>
                    ) : (
                      "Generate Meal Plan"
                    )}
                  </Button>
                </form>
              </Form>
            </Tabs>
          </CardContent>
        </Card>

        <AnimatePresence>
          {mutation.data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-display font-bold text-gray-800">Your 7-Day Meal Plan</h2>
              {renderWeekPlan(mutation.data.meals)}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
