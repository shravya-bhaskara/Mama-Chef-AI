import { useQuery } from "@tanstack/react-query";
import { type Recipe } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Utensils, Info, ChevronLeft, Calendar, Youtube, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function History() {
  const { data: recipes, isLoading } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading your kitchen history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] pb-12">
      <header className="bg-white border-b border-orange-100 py-6 px-4 mb-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Utensils className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-display font-bold text-gray-800 tracking-tight">Kitchen History</h1>
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
        {!recipes || recipes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-orange-200">
            <h2 className="text-xl font-bold text-gray-700">No recipes yet</h2>
            <p className="text-gray-500 mt-2 mb-6">Start entering ingredients on the home page to see your history!</p>
            <Link href="/">
              <Button className="bg-orange-500 hover:bg-orange-600">Go to Home</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <Calendar className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                    {format(new Date(recipe.createdAt!), "MMMM d, yyyy")}
                  </span>
                </div>
                
                <Card className="border-orange-100 bg-white/50 shadow-sm mb-4">
                  <CardHeader className="pb-4">
                    <div className="flex flex-wrap gap-2">
                      {recipe.ingredients.map((ing) => (
                        <Badge key={ing} variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                          {ing}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                </Card>

                <div className="grid grid-cols-1 gap-4 ml-4 md:ml-8">
                  {(recipe.suggestions as any[]).map((suggestion: any, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="border-orange-100 overflow-hidden hover:shadow-md transition-shadow bg-white">
                        <div className="p-5 space-y-3">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{suggestion.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                              {suggestion.videoUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
                                  onClick={() => window.open(suggestion.videoUrl, "_blank")}
                                >
                                  <Youtube className="h-3 w-3" />
                                  Watch Video
                                </Button>
                              )}
                              {suggestion.recipeUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-blue-200 text-blue-600 hover:bg-blue-50 gap-2"
                                  onClick={() => window.open(suggestion.recipeUrl, "_blank")}
                                >
                                  <BookOpen className="h-3 w-3" />
                                  Read Recipe
                                </Button>
                              )}
                              {!suggestion.videoUrl && !suggestion.recipeUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-orange-200 text-orange-600 hover:bg-orange-50 gap-2"
                                  onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(suggestion.recipeSearchQuery)}`, "_blank")}
                                >
                                  <Search className="h-3 w-3" />
                                  Find Recipe
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-2 mb-1">
                              <Info className="h-3 w-3 text-blue-500" />
                              <span className="text-xs font-bold text-blue-700">Nutrition</span>
                            </div>
                            <p className="text-xs text-blue-900 leading-relaxed">{suggestion.nutritionalInfo}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
