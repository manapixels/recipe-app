import { Metadata } from 'next';
import ProtectedWrapper from '@/_components/auth/ProtectedWrapper';
import { RecipeListInMyRecipes } from './_components/RecipeListInMyRecipes';

export const metadata: Metadata = {
  title: 'recipe-app | My Recipes',
};

export default function MyRecipesPage() {
  return (
    <ProtectedWrapper>
      <div className="flex w-full flex-col md:col-span-4">
        <RecipeListInMyRecipes />
      </div>
    </ProtectedWrapper>
  );
}
