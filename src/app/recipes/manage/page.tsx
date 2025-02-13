import { Metadata } from 'next';
import ProtectedWrapper from '@/_components/auth/ProtectedWrapper';
import RecipeListInManageRecipes from './_components/RecipeListInManageRecipes';

export const metadata: Metadata = {
  title: 'recipe-app | Manage Recipes',
};

export default async function ManageRecipesPage() {
  return (
    <ProtectedWrapper>
      <div className="flex w-full flex-col md:col-span-4">
        <h2 className="font-bold text-xl mb-4">Manage My Recipes</h2>
        <RecipeListInManageRecipes />
      </div>
    </ProtectedWrapper>
  );
}
