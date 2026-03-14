import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Heart, ChevronLeft, ChefHat, Trash2, Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { motion } from "framer-motion";

export default function Favorites() {
  const { toast } = useToast();
  const { userId } = useUser();

  const { data: favorites, isLoading } = useQuery({
    queryKey: [`/api/favorites/${userId}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/favorites/${userId}`);
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (favoriteId: number) => {
      await apiRequest("DELETE", `/api/favorites/${userId}/${favoriteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${userId}`] });
      toast({
        title: "Removed from favorites",
        description: "Recipe has been removed from your favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from favorites.",
        variant: "destructive",
      });
    },
  });

  const handleRemove = (favoriteId: number) => {
    deleteMutation.mutate(favoriteId);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] pb-12">
      <header className="bg-white border-b border-orange-100 py-6 px-4 mb-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500 fill-current" />
            <h1 className="text-2xl font-display font-bold text-gray-800 tracking-tight">My Favorite Recipes</h1>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : !favorites || favorites.length === 0 ? (
          <Card className="border-orange-100">
            <CardContent className="py-16 text-center">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">No favorites yet</h2>
              <p className="text-gray-600 mb-6">Start adding recipes to your favorites by clicking the heart icon on any recipe!</p>
              <Link href="/">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Utensils className="mr-2 h-4 w-4" />
                  Explore Recipes
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">
                {favorites.length} {favorites.length === 1 ? 'Recipe' : 'Recipes'} Saved
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite: any) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="border-orange-100 hover:shadow-lg transition-shadow relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 z-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleRemove(favorite.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <CardHeader>
                      <div className="flex items-start gap-2 pr-8">
                        <ChefHat className="h-5 w-5 text-orange-500 shrink-0 mt-1" />
                        <div>
                          <CardTitle className="text-lg text-gray-900">{favorite.recipeData.name}</CardTitle>
                          {favorite.recipeType && (
                            <Badge variant="outline" className="mt-2 text-xs bg-orange-50 text-orange-700 border-orange-200">
                              {favorite.recipeType.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {favorite.recipeData.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{favorite.recipeData.description}</p>
                      )}

                      {favorite.recipeData.mealType && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                          {favorite.recipeData.mealType}
                        </Badge>
                      )}

                      {(favorite.recipeData.calories || favorite.recipeData.protein) && (
                        <div className="flex gap-2 flex-wrap text-xs">
                          {favorite.recipeData.calories && (
                            <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded">
                              {favorite.recipeData.calories} cal
                            </span>
                          )}
                          {favorite.recipeData.protein && (
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {favorite.recipeData.protein}g protein
                            </span>
                          )}
                        </div>
                      )}

                      {favorite.recipeData.cookingTime && (
                        <p className="text-xs text-gray-500">⏱️ {favorite.recipeData.cookingTime}</p>
                      )}

                      {favorite.recipeData.prepTime && (
                        <p className="text-xs text-gray-500">⏱️ {favorite.recipeData.prepTime}</p>
                      )}

                      {favorite.recipeData.day && favorite.recipeData.mealType && (
                        <p className="text-xs text-gray-500">
                          📅 {favorite.recipeData.day} - {favorite.recipeData.mealType}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
