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
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, ChevronLeft, Clock, ChefHat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  festival: z.string().min(1, "Festival name is required"),
  region: z.string().optional(),
  culture: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function FestivalRecipes() {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      festival: "",
      region: "",
      culture: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/festival-recipes", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Festival recipes generated!",
        description: "Discover authentic recipes for your celebration.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate festival recipes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const difficultyColors: Record<string, string> = {
    Beginner: "bg-green-50 text-green-700 border-green-200",
    Intermediate: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Advanced: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] pb-12">
      <header className="bg-white border-b border-orange-100 py-6 px-4 mb-8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-display font-bold text-gray-800 tracking-tight">Festival & Cultural Recipes</h1>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 space-y-8">
        <Card className="border-orange-100 shadow-sm bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Discover Festival Recipes</CardTitle>
            <CardDescription>
              Enter a festival or celebration and get authentic recipes with cultural context
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="festival"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Festival Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Diwali, Christmas, Thanksgiving" className="border-orange-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., North India, Southern US" className="border-orange-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="culture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Culture (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Indian, Mexican, Italian" className="border-orange-200" />
                        </FormControl>
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
                      Finding festival recipes...
                    </>
                  ) : (
                    "Get Festival Recipes"
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
              <h2 className="text-2xl font-display font-bold text-gray-800">Festival Recipe Collection</h2>

              {mutation.data.recipes.festivalRecipes.map((recipe: any, idx: number) => (
                <Card key={idx} className="border-orange-100 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-2xl text-gray-900">{recipe.name}</CardTitle>
                          {recipe.culturalName && (
                            <p className="text-sm text-orange-600 font-medium mt-1">{recipe.culturalName}</p>
                          )}
                        </div>
                        <Badge className={difficultyColors[recipe.difficulty] || "bg-gray-50 text-gray-700"}>
                          {recipe.difficulty}
                        </Badge>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {recipe.category && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            <ChefHat className="h-3 w-3 mr-1" />
                            {recipe.category}
                          </Badge>
                        )}
                        {recipe.cookingTime && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            <Clock className="h-3 w-3 mr-1" />
                            {recipe.cookingTime}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recipe.significance && (
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-bold text-yellow-800 mb-2">Festival Significance</h4>
                        <p className="text-sm text-yellow-900">{recipe.significance}</p>
                      </div>
                    )}

                    {recipe.culturalContext && (
                      <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                        <h4 className="font-bold text-pink-800 mb-2">Cultural Context</h4>
                        <p className="text-sm text-pink-900">{recipe.culturalContext}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-gray-700 mb-2">Ingredients:</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {recipe.ingredients.map((ing: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-orange-500">•</span>
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-700 mb-2">Instructions:</h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                        {recipe.instructions.map((step: string, i: number) => (
                          <li key={i} className="ml-2">{step}</li>
                        ))}
                      </ol>
                    </div>

                    {recipe.servingSuggestions && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h4 className="font-bold text-green-700 text-sm mb-1">Serving Suggestions</h4>
                        <p className="text-sm text-green-900">{recipe.servingSuggestions}</p>
                      </div>
                    )}

                    {recipe.variations && recipe.variations.length > 0 && (
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <h4 className="font-bold text-indigo-700 text-sm mb-2">Variations</h4>
                        <ul className="space-y-1 text-sm text-indigo-900">
                          {recipe.variations.map((variation: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-indigo-600">→</span>
                              <span>{variation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {mutation.data.recipes.festivalTraditions && mutation.data.recipes.festivalTraditions.length > 0 && (
                <Card className="border-purple-200 bg-purple-50/50">
                  <CardHeader>
                    <CardTitle className="text-purple-700">Festival Traditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {mutation.data.recipes.festivalTraditions.map((tradition: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-purple-600">✦</span>
                          <span>{tradition}</span>
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
