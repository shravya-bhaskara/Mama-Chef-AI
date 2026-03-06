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
import { useState } from "react";
import { Loader2, Plus, X, Search, Utensils, Info, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";

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
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);

  const form = useForm<CreateRecipeRequest>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: [],
      preferences: {
        cuisine: "",
        familySize: "",
        culture: "",
        dietaryRestrictions: "",
      },
    },
  });

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
      const newIngredients = [...ingredients, ingredientInput.trim()];
      setIngredients(newIngredients);
      form.setValue("ingredients", newIngredients);
      setIngredientInput("");
    }
  };

  const removeIngredient = (ing: string) => {
    const newIngredients = ingredients.filter((i) => i !== ing);
    setIngredients(newIngredients);
    form.setValue("ingredients", newIngredients);
  };

  const onSubmit = (data: CreateRecipeRequest) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] pb-12">
      <header className="bg-white border-b border-orange-100 py-6 px-4 mb-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Utensils className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-display font-bold text-gray-800 tracking-tight">Mama's Kitchen AI</h1>
          </div>
          <Link href="/history">
            <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-2">
              <History className="h-4 w-4" />
              History
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 space-y-8">
        <Card className="border-orange-100 shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">What's in your pantry?</CardTitle>
            <CardDescription>Enter the ingredients you have and let Mama's AI help you decide what to cook.</CardDescription>
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

        <AnimatePresence>
          {mutation.data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 gap-6"
            >
              <h2 className="text-2xl font-display font-bold text-gray-800 mt-8 mb-4">Mama's Suggestions</h2>
              {mutation.data.suggestions.map((suggestion: any, idx: number) => (
                <Card key={idx} className="border-orange-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{suggestion.name}</h3>
                        <p className="text-gray-600 mt-1">{suggestion.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        className="border-orange-200 text-orange-600 hover:bg-orange-50 shrink-0 gap-2"
                        onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(suggestion.recipeSearchQuery)}`, "_blank")}
                      >
                        <Search className="h-4 w-4" />
                        Find Recipe
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Ingredients Used</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {suggestion.ingredientsUsed.map((ing: string) => (
                            <Badge key={ing} variant="outline" className="bg-white text-gray-700 border-gray-200 font-normal">
                              {ing}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Info className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-bold text-blue-700">Nutritional Benefits</span>
                        </div>
                        <p className="text-sm text-blue-900 leading-relaxed">{suggestion.nutritionalInfo}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
