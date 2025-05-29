import { Metadata } from 'next';
import ProtectedWrapper from '@/_components/auth/ProtectedWrapper';
import RecipeListInManageRecipes from './_components/RecipeListInManageRecipes';

export const metadata: Metadata = {
  title: 'recipe-app | Manage Recipes',
};

export default async function ManageRecipesPage() {
  return (
    <ProtectedWrapper>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">
          Manage My Recipes
        </h1>
        <RecipeListInManageRecipes />
      </div>
    </ProtectedWrapper>
  );
}
