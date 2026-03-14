import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface IngredientsContextType {
  ingredients: string[];
  addIngredient: (ingredient: string) => void;
  removeIngredient: (ingredient: string) => void;
  setIngredients: (ingredients: string[]) => void;
  clearIngredients: () => void;
}

const IngredientsContext = createContext<IngredientsContextType | undefined>(undefined);

export function IngredientsProvider({ children }: { children: ReactNode }) {
  const [ingredients, setIngredientsState] = useState<string[]>(() => {
    // Load from localStorage on init
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mama-chef-ingredients');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  // Save to localStorage whenever ingredients change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mama-chef-ingredients', JSON.stringify(ingredients));
    }
  }, [ingredients]);

  const addIngredient = (ingredient: string) => {
    if (ingredient.trim() && !ingredients.includes(ingredient.trim())) {
      setIngredientsState([...ingredients, ingredient.trim()]);
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredientsState(ingredients.filter(i => i !== ingredient));
  };

  const setIngredients = (newIngredients: string[]) => {
    setIngredientsState(newIngredients);
  };

  const clearIngredients = () => {
    setIngredientsState([]);
  };

  return (
    <IngredientsContext.Provider
      value={{
        ingredients,
        addIngredient,
        removeIngredient,
        setIngredients,
        clearIngredients,
      }}
    >
      {children}
    </IngredientsContext.Provider>
  );
}

export function useIngredients() {
  const context = useContext(IngredientsContext);
  if (context === undefined) {
    throw new Error('useIngredients must be used within an IngredientsProvider');
  }
  return context;
}
