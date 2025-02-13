import { useEffect, useState } from 'react';
import { useUser } from '@/_contexts/UserContext';
import RecipeListItemInMyRecipes from './RecipeListItemInMyRecipes';
import { Recipe } from '@/types/recipe';
import { fetchUserRecipes } from '@/api/recipe';
import RecipeListItemSkeleton from '@/_components/ui/Skeletons/RecipeListItemSkeleton';

export const RecipeListInMyRecipes = () => {
  const { user } = useUser();
  const [draftRecipes, setDraftRecipes] = useState<Recipe[]>([]);
  const [publishedRecipes, setPublishedRecipes] = useState<Recipe[]>([]);
  const [archivedRecipes, setArchivedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      if (user?.id) {
        const result = await fetchUserRecipes(user.id);
        if (result) {
          const recipes = result as Recipe[];

          setDraftRecipes(recipes.filter(recipe => recipe.status === 'draft'));
          setPublishedRecipes(recipes.filter(recipe => recipe.status === 'published'));
          setArchivedRecipes(recipes.filter(recipe => recipe.status === 'archived'));
        }
      }
      setIsLoading(false);
    };
    fetchRecipes();
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-medium text-md md:text-xl text-gray-600 md:text-black mb-4">
          Draft Recipes
        </h2>
        {isLoading && draftRecipes.length === 0 && <RecipeListItemSkeleton />}
        <div className="flex flex-col gap-7 md:gap-4 bg-gray-50 rounded-2xl py-2 md:px-8 md:py-8">
          {draftRecipes.length > 0 ? (
            draftRecipes.map((recipe, i) => (
              <RecipeListItemInMyRecipes recipe={recipe} key={recipe.id || i} />
            ))
          ) : (
            <div className="text-center text-gray-500">No draft recipes.</div>
          )}
        </div>
      </div>
      <div>
        <h2 className="font-medium text-md md:text-xl text-gray-600 md:text-black mb-4">
          Published Recipes
        </h2>
        {isLoading && publishedRecipes.length === 0 && <RecipeListItemSkeleton />}
        <div className="flex flex-col gap-7 md:gap-4 bg-gray-50 rounded-2xl py-2 md:px-8 md:py-8">
          {publishedRecipes.length > 0 ? (
            publishedRecipes.map((recipe, i) => (
              <RecipeListItemInMyRecipes recipe={recipe} key={recipe.id || i} />
            ))
          ) : (
            <div className="text-center text-gray-500">No published recipes.</div>
          )}
        </div>
      </div>
      <div>
        <h2 className="font-medium text-md md:text-xl text-gray-600 md:text-black mb-4">
          Archived Recipes
        </h2>
        {isLoading && archivedRecipes.length === 0 && <RecipeListItemSkeleton />}
        <div className="flex flex-col gap-7 md:gap-4 bg-gray-50 rounded-2xl py-2 md:px-8 md:py-8">
          {archivedRecipes.length > 0 ? (
            archivedRecipes.map((recipe, i) => (
              <RecipeListItemInMyRecipes recipe={recipe} key={recipe.id || i} />
            ))
          ) : (
            <div className="text-center text-gray-500">No archived recipes.</div>
          )}
        </div>
      </div>
    </div>
  );
};
