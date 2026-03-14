import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Apple, ChevronLeft, Heart, Sparkles, ChefHat, Utensils } from "lucide-react";
import { Link } from "wouter";

export default function MealPlanner() {
  const planningOptions = [
    {
      title: "Weekly Meal Planner",
      description: "Build a comprehensive 7-day plan for breakfast, lunch, dinner, and snacks. Perfect for families looking to organize their weekly meals with diverse cuisines from around the world.",
      icon: Calendar,
      color: "orange",
      href: "/weekly-planner",
      features: [
        "Complete 7-day meal schedule",
        "Organized grocery shopping list",
        "Meal prep tips and leftover ideas",
        "Age-appropriate meal suggestions",
        "Family-size customization"
      ]
    },
    {
      title: "Health-Focused Meal Planner",
      description: "Get a nutrition-optimized 7-day plan designed for specific calorie goals, protein targets, and balanced macros. Ideal for fitness enthusiasts and health-conscious individuals.",
      icon: Apple,
      color: "green",
      href: "/health-planner",
      features: [
        "Daily calorie and protein tracking",
        "Vitamin-rich meal suggestions",
        "Macro-balanced recipes",
        "Probiotic and gut-health foods",
        "Healthy substitution tips"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF5] pb-12">
      <header className="bg-white border-b border-orange-100 py-6 px-4 mb-8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-orange-500" />
            <h1 className="text-2xl font-display font-bold text-gray-800 tracking-tight">AI Meal Planner</h1>
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
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-3xl font-display font-bold text-gray-800">Choose Your Meal Planning Style</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the meal planner that best fits your lifestyle. Both options provide AI-powered meal plans with recipes from cuisines around the world.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {planningOptions.map((option) => (
            <Link key={option.title} href={option.href}>
              <Card className={`border-${option.color}-100 hover:shadow-xl transition-all cursor-pointer h-full bg-white group`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-3 flex-1">
                      <div className={`inline-flex items-center justify-center p-3 rounded-lg bg-${option.color}-50 group-hover:bg-${option.color}-100 transition-colors`}>
                        <option.icon className={`h-8 w-8 text-${option.color}-600`} />
                      </div>
                      <CardTitle className="text-xl text-gray-900">{option.title}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">{option.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700">Features:</h4>
                    <ul className="space-y-2">
                      {option.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className={`text-${option.color}-500 mt-0.5`}>✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    className={`w-full bg-${option.color}-600 hover:bg-${option.color}-700 text-white shadow-lg`}
                  >
                    <Utensils className="mr-2 h-4 w-4" />
                    Start {option.title.split(' ')[0]} Planning
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="border-purple-200 bg-purple-50/50 mt-12">
          <CardContent className="py-8">
            <div className="text-center space-y-3">
              <ChefHat className="h-12 w-12 text-purple-600 mx-auto" />
              <h3 className="text-xl font-bold text-purple-900">Why Use Our AI Meal Planners?</h3>
              <p className="text-purple-800 max-w-2xl mx-auto">
                Our AI-powered meal planners create personalized weekly schedules with recipes from cuisines worldwide. 
                Each plan includes complete cooking instructions, nutritional information, organized grocery lists, and helpful meal prep tips.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">10-15 Recipes Per Week</Badge>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">Global Cuisines</Badge>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">Age-Appropriate Options</Badge>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">Detailed Instructions</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
