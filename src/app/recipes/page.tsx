import React from 'react';
import { Metadata } from 'next';
import RecipeList from './_components/RecipeList';

export const metadata: Metadata = {
  title: 'recipe-app | All recipes',
};

export default function RecipesPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">All Recipes</h1>
      <RecipeList />
    </div>
  );
}
