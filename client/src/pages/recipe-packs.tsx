import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Crown, ChevronLeft, ShoppingBag, Youtube, BookOpen, Info,
  Globe, Package, UtensilsCrossed,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const packs = [
  {
    id: "no-fuss",
    title: "No-Fuss Lunchbox Packs",
    description: "Simple lunchbox recipes using ingredients you almost always have at home. Minimal prep, maximum taste.",
    icon: Package,
    color: "orange",
    badge: "Beginner Friendly",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
    cardBorder: "border-orange-200",
    ingredients: ["bread", "eggs", "cheese", "butter", "vegetables", "rice", "pasta"],
    systemPrompt: "No-fuss lunchbox meals using simple home-available ingredients that take under 20 minutes",
  },
  {
    id: "batch-cook",
    title: "Batch-Cook Family Boxes",
    description: "Cook once, eat all week. Family-friendly recipes designed for batch cooking and reheating on busy weekdays.",
    icon: UtensilsCrossed,
    color: "blue",
    badge: "Family Favorite",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-100",
    cardBorder: "border-blue-200",
    ingredients: ["chicken", "lentils", "rice", "potatoes", "onions", "tomatoes", "beans"],
    systemPrompt: "Batch-cook friendly family lunchbox recipes — great for prepping on Sunday and reheating through the week",
  },
  {
    id: "regional",
    title: "Regional Lunchbox Twists",
    description: "Explore lunchbox classics from Indian, Mediterranean, Asian and global cuisines with culturally rich flavors.",
    icon: Globe,
    color: "purple",
    badge: "Global Flavors",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-100",
    cardBorder: "border-purple-200",
    ingredients: ["spices", "rice", "chickpeas", "flatbread", "yogurt", "herbs", "vegetables"],
    systemPrompt: "Regional lunchbox recipes from diverse global cuisines — Indian, Mediterranean, Asian, and more",
  },
];

export default function RecipePacks() {
  const { toast } = useToast();
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  const mutation = useMutation({
    mutationFn: async ({ packId, ingredients, systemPrompt }: { packId: string; ingredients: string[]; systemPrompt: string }) => {
      const res = await apiRequest("POST", "/api/recipes", {
        ingredients,
        preferences: {
          culture: "Any",
          familySize: "3-4",
          cuisine: "Any",
          dietaryRestrictions: systemPrompt,
        },
      });
      const data = await res.json();
      return { packId, data };
    },
    onSuccess: ({ packId, data }) => {
      setResults((prev) => ({ ...prev, [packId]: data }));
      toast({
        title: "Pack recipes ready!",
        description: "Your curated recipe pack is ready below.",
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

  const handleGenerate = (pack: typeof packs[0]) => {
    setSelectedPack(pack.id);
    mutation.mutate({
      packId: pack.id,
      ingredients: pack.ingredients,
      systemPrompt: pack.systemPrompt,
    });
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] pb-12">
      <header className="bg-white border-b border-orange-100 py-6 px-4 mb-8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Crown className="h-8 w-8 text-amber-500" />
            <h1 className="text-2xl font-display font-bold text-gray-800 tracking-tight">Recipe Packs</h1>
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
        <div className="text-center space-y-2 pb-2">
          <h2 className="text-3xl font-display font-bold text-gray-800">Curated Recipe Packs</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Click a pack to instantly generate curated lunchbox recipes tailored to that theme — using ingredients you likely already have.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {packs.map((pack) => (
            <Card
              key={pack.id}
              className={`${pack.cardBorder} bg-white hover:shadow-lg transition-all cursor-pointer ${selectedPack === pack.id ? "ring-2 ring-orange-400" : ""}`}
              onClick={() => handleGenerate(pack)}
              data-testid={`card-pack-${pack.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <pack.icon className="h-8 w-8 text-orange-500 shrink-0 mt-0.5" />
                  <Badge className={pack.badgeColor}>{pack.badge}</Badge>
                </div>
                <CardTitle className="text-lg text-gray-900 mt-3">{pack.title}</CardTitle>
                <CardDescription className="text-sm">{pack.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={mutation.isPending && selectedPack === pack.id}
                  data-testid={`button-generate-${pack.id}`}
                  onClick={(e) => { e.stopPropagation(); handleGenerate(pack); }}
                >
                  {mutation.isPending && selectedPack === pack.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      {results[pack.id] ? "Regenerate Pack" : "Get This Pack"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <AnimatePresence>
          {packs.map((pack) => {
            const packResult = results[pack.id];
            if (!packResult) return null;

            return (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <pack.icon className="h-6 w-6 text-orange-500" />
                  <h3 className="text-xl font-display font-bold text-gray-800">{pack.title}</h3>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {packResult.suggestions?.map((suggestion: any, idx: number) => (
                    <Card key={idx} className="border-orange-100 hover:shadow-md transition-shadow">
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">{suggestion.name}</h4>
                            <p className="text-gray-600 mt-1">{suggestion.description}</p>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            {suggestion.videoUrl && (
                              <a href={suggestion.videoUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 gap-2">
                                  <Youtube className="h-4 w-4" /> Watch
                                </Button>
                              </a>
                            )}
                            {suggestion.blogUrl && (
                              <a href={suggestion.blogUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50 gap-2">
                                  <BookOpen className="h-4 w-4" /> Recipe
                                </Button>
                              </a>
                            )}
                            {!suggestion.videoUrl && !suggestion.blogUrl && suggestion.recipeSearchQuery && (
                              <a href={`https://www.google.com/search?q=${encodeURIComponent(suggestion.recipeSearchQuery)}`} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="border-orange-200 text-orange-600 hover:bg-orange-50 gap-2">
                                  🔍 Find
                                </Button>
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Ingredients Used</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {suggestion.ingredientsUsed?.map((ing: string) => (
                                <Badge key={ing} variant="outline" className="bg-white text-gray-700 border-gray-200 font-normal">
                                  {ing}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {suggestion.nutritionalInfo && (
                            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                              <div className="flex items-center gap-2 mb-1">
                                <Info className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-bold text-blue-700">Nutritional Benefits</span>
                              </div>
                              <p className="text-sm text-blue-900 leading-relaxed">{suggestion.nutritionalInfo}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </main>
    </div>
  );
}
