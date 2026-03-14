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
import { Loader2, Sparkles, ChevronLeft, Clock, ChefHat, Youtube, BookOpen, Flame, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";

const formSchema = z.object({
  festival: z.string().min(1, "Festival name is required"),
  region: z.string().optional(),
  culture: z.string().optional(),
  fastingType: z.enum(['fasting', 'non-fasting', 'both']).optional(),
  mealType: z.enum(['Starter', 'Main Course', 'Drinks', 'Dessert', 'all']).optional(),
});

type FormData = z.infer<typeof formSchema>;

const festivalImages: Record<string, string> = {
  diwali: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=900&h=400&fit=crop",
  christmas: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=900&h=400&fit=crop",
  holi: "https://images.unsplash.com/photo-1534854638093-bada1813ca19?w=900&h=400&fit=crop",
  thanksgiving: "https://images.unsplash.com/photo-1574226516831-e1dff420e562?w=900&h=400&fit=crop",
  eid: "https://images.unsplash.com/photo-1561043433-aaf687c4cf04?w=900&h=400&fit=crop",
  "new year": "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=900&h=400&fit=crop",
  easter: "https://images.unsplash.com/photo-1613743983303-b3e89f8a2b80?w=900&h=400&fit=crop",
  halloween: "https://images.unsplash.com/photo-1508361001413-7a9dca21d08a?w=900&h=400&fit=crop",
  navratri: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=900&h=400&fit=crop",
  chinese: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=900&h=400&fit=crop",
};

function getFestivalImage(festivalName: string): string {
  const lower = festivalName.toLowerCase();
  for (const [key, url] of Object.entries(festivalImages)) {
    if (lower.includes(key)) return url;
  }
  return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=400&fit=crop";
}

export default function FestivalRecipes() {
  const { toast } = useToast();
  const { userId } = useUser();
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set());

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      festival: "", 
      region: "", 
      culture: "",
      fastingType: 'both',
      mealType: 'all',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/festival-recipes", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Festival recipes generated! 🎉",
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

  const handleLike = async (recipe: any, recipeId: string) => {
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
        recipeType: 'festival_recipe',
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

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const difficultyColors: Record<string, string> = {
    Beginner: "bg-green-50 text-green-700 border-green-200",
    Intermediate: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Advanced: "bg-red-50 text-red-700 border-red-200",
  };

  const festivalData = mutation.data?.recipes;

  return (
    <div className="min-h-screen bg-[#FFFDF5] pb-12">
      <header className="bg-white border-b border-orange-100 py-6 px-4 mb-8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-display font-bold text-gray-800 tracking-tight">Festival & Cultural Recipes</h1>
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
                        <Input {...field} placeholder="e.g., Diwali, Christmas, Thanksgiving" className="border-orange-200" data-testid="input-festival" />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fastingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fasting Preference</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-orange-200">
                              <SelectValue placeholder="Select fasting type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="both">Both Fasting & Non-Fasting</SelectItem>
                            <SelectItem value="fasting">Fasting-Friendly Only</SelectItem>
                            <SelectItem value="non-fasting">Non-Fasting Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mealType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meal Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-orange-200">
                              <SelectValue placeholder="Select meal type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="Starter">Starters</SelectItem>
                            <SelectItem value="Main Course">Main Course</SelectItem>
                            <SelectItem value="Drinks">Drinks</SelectItem>
                            <SelectItem value="Dessert">Desserts</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-lg font-bold shadow-lg shadow-orange-200"
                  data-testid="button-get-festival-recipes"
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
          {mutation.data && festivalData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Festival Hero Banner */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={getFestivalImage(mutation.variables?.festival || "")}
                  alt={`${mutation.variables?.festival} celebration`}
                  className="w-full h-52 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6">
                  <div className="flex items-center gap-3">
                    {festivalData.festivalEmoji && (
                      <span className="text-4xl">{festivalData.festivalEmoji}</span>
                    )}
                    <div>
                      <h2 className="text-3xl font-display font-bold text-white">{mutation.variables?.festival}</h2>
                      <p className="text-orange-200 text-sm mt-0.5">Festival Recipe Collection</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cultural Celebration Paragraph */}
              {festivalData.celebrationParagraph && (
                <Card className="border-amber-200 bg-amber-50/60">
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <span className="text-2xl shrink-0">{festivalData.festivalEmoji || "🎉"}</span>
                      <p className="text-amber-900 leading-relaxed text-base italic">{festivalData.celebrationParagraph}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recipes */}
              {festivalData.festivalRecipes?.map((recipe: any, idx: number) => {
                const recipeId = `festival-${idx}`;
                const isLiked = likedRecipes.has(recipeId);
                return (
                  <Card key={idx} className="border-orange-100 hover:shadow-md transition-shadow relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`absolute top-4 right-4 z-10 ${isLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                      onClick={() => handleLike(recipe, recipeId)}
                    >
                      <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                    </Button>

                    <CardHeader>
                      <div className="space-y-3 pr-12">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <ChefHat className="h-5 w-5 text-orange-500" />
                              <CardTitle className="text-2xl text-gray-900">{recipe.name}</CardTitle>
                            </div>
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
                          {recipe.mealType && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                              {recipe.mealType}
                            </Badge>
                          )}
                          {recipe.fastingStatus && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {recipe.fastingStatus}
                            </Badge>
                          )}
                          {recipe.cookingTime && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              <Clock className="h-3 w-3 mr-1" />
                              {recipe.cookingTime}
                            </Badge>
                          )}
                        </div>

                      {/* Recipe links */}
                      <div className="flex gap-2 flex-wrap">
                        {recipe.videoUrl && (
                          <a href={recipe.videoUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 gap-2">
                              <Youtube className="h-4 w-4" /> Watch on YouTube
                            </Button>
                          </a>
                        )}
                        {recipe.blogUrl && (
                          <a href={recipe.blogUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50 gap-2">
                              <BookOpen className="h-4 w-4" /> Read Full Recipe
                            </Button>
                          </a>
                        )}
                        {!recipe.videoUrl && !recipe.blogUrl && recipe.recipeSearchQuery && (
                          <a href={`https://www.google.com/search?q=${encodeURIComponent(recipe.recipeSearchQuery + ' recipe')}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="border-orange-200 text-orange-600 hover:bg-orange-50 gap-2">
                              🔍 Find Recipe Online
                            </Button>
                          </a>
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

                    {recipe.nutritionalInfo && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <h4 className="font-bold text-blue-700 text-sm mb-1 flex items-center gap-1">
                          <Flame className="h-3.5 w-3.5" /> Nutritional Info
                        </h4>
                        <p className="text-sm text-blue-900">{recipe.nutritionalInfo}</p>
                      </div>
                    )}

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
              );
            })}

              {festivalData.festivalTraditions && festivalData.festivalTraditions.length > 0 && (
                <Card className="border-purple-200 bg-purple-50/50">
                  <CardHeader>
                    <CardTitle className="text-purple-700">Festival Traditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {festivalData.festivalTraditions.map((tradition: string, idx: number) => (
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
