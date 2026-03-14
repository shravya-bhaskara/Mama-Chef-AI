import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { IngredientsProvider } from "@/contexts/IngredientsContext";
import { UserProvider } from "@/contexts/UserContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import History from "@/pages/history";
import MealPlanner from "@/pages/meal-planner";
import WeeklyPlanner from "@/pages/weekly-planner";
import HealthPlanner from "@/pages/health-planner";
import QuickMeals from "@/pages/quick-meals";
import FestivalRecipes from "@/pages/festival-recipes";
import RecipePacks from "@/pages/recipe-packs";
import Favorites from "@/pages/favorites";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/history" component={History} />
      <Route path="/meal-planner" component={MealPlanner} />
      <Route path="/weekly-planner" component={WeeklyPlanner} />
      <Route path="/health-planner" component={HealthPlanner} />
      <Route path="/quick-meals" component={QuickMeals} />
      <Route path="/festival-recipes" component={FestivalRecipes} />
      <Route path="/recipe-packs" component={RecipePacks} />
      <Route path="/favorites" component={Favorites} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <IngredientsProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </IngredientsProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
