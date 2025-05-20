import React from 'react';
import { Metadata } from 'next';
import RecipeList from './_components/RecipeList';

export const metadata: Metadata = {
  title: 'recipe-app | All recipes',
};

export default function RecipesPage() {
  return <RecipeList />;
}
