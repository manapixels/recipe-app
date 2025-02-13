import { Metadata } from 'next';
import { fetchRecipes } from '@/api/recipe';
import RecipeListItem from './_components/RecipeListItem';
import { Recipe } from '@/types/recipe';

export const metadata: Metadata = {
  title: 'recipe-app | All recipes',
};

export default async function RecipesPage() {
  const recipes = (await fetchRecipes()) as Recipe[];

  return (
    <div className="flex w-full flex-col md:col-span-4">
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {recipes?.map((recipe, i) => {
          return <RecipeListItem recipe={recipe} key={i} />;
        })}
      </div>
    </div>
  );
}
