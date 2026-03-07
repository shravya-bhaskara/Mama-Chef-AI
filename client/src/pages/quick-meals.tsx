import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Timer, Plus, X, ChevronLeft, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function QuickMeals() {
  const { toast } = useToast();
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);

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
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput("");
    }
  };

  const removeIngredient = (ing: string) => {
    setIngredients(ingredients.filter((i) => i !== ing));
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
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Timer className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-display font-bold text-gray-800 tracking-tight">5-Minute Dinner Rescue</h1>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 space-y-8">
        <Card className="border-orange-100 shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Quick Meal Ideas</CardTitle>
            <CardDescription>
              Enter the ingredients you have and get ultra-quick dinner ideas that take 5 minutes or less!
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
              <h2 className="text-2xl font-display font-bold text-gray-800">Your 5-Minute Dinner Ideas</h2>
              <div className="grid grid-cols-1 gap-6">
                {mutation.data.meals.quickMeals.map((meal: any, idx: number) => (
                  <Card key={idx} className="border-orange-100 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-gray-900">{meal.name}</CardTitle>
                          <div className="flex gap-2 mt-2">
                            <Badge className="bg-rose-50 text-rose-700 border-rose-200">
                              <Clock className="h-3 w-3 mr-1" />
                              {meal.prepTime}
                            </Badge>
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
                    </CardContent>
                  </Card>
                ))}
              </div>

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
