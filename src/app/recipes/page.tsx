import React from 'react';
import { Metadata } from 'next';
import RecipeList from './_components/RecipeList';
import { RecipeCategory, RecipeSubcategory } from '@/types/recipe'; // Import types

export const metadata: Metadata = {
  title: 'recipe-app | All recipes',
};

interface RecipesPageProps {
  searchParams?: {
    category?: RecipeCategory;
    subcategory?: RecipeSubcategory;
    search?: string;
    // Add other potential search params here if needed
  };
}

export default function RecipesPage({ searchParams }: RecipesPageProps) {
  const initialCategory = searchParams?.category;
  const initialSubcategory = searchParams?.subcategory;
  const initialSearch = searchParams?.search;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">All Recipes</h1>
      <RecipeList
        initialCategory={initialCategory}
        initialSubcategory={initialSubcategory}
        initialSearch={initialSearch}
      />
    </div>
  );
}
