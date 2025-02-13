import { Metadata } from 'next';
import { fetchRecipe } from '@/api/recipe';
import { BUCKET_URL } from '@/constants';
import { Recipe } from '@/types/recipe';
import { Profile } from '@/types/profile';

export const metadata: Metadata = {
  title: 'recipe-app | Recipe Details',
};

export default async function RecipeDetailsPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const recipe = (await fetchRecipe(slug)) as Recipe & {
    created_by: Profile & {
      recipes_created?: number;
    };
  };

  // Helper function to format difficulty level
  const formatDifficulty = (level: number) => {
    switch (level) {
      case 1:
        return 'Easy';
      case 2:
        return 'Medium';
      case 3:
        return 'Advanced';
      default:
        return 'Unknown';
    }
  };

  // Helper function to format time
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  return (
    <div>
      <div
        className={`w-full h-72 md:h-96 bg-gray-300 bg-center bg-cover rounded-2xl ${recipe?.image_banner_url ? '' : 'grayscale opacity-5'}`}
        style={{
          backgroundImage: `url(${recipe?.image_banner_url ? `${BUCKET_URL}/recipe_banners/${recipe.image_banner_url}` : '/recipe-placeholder.svg'})`,
        }}
      />

      <div className="flex flex-col md:flex-row justify-between mt-8">
        <div className="w-full md:w-2/3">
          <div className="text-3xl font-medium mb-2">{recipe?.name}</div>
          <div className="flex items-center text-gray-600 mb-4">
            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 mr-2">
              {recipe?.category}
            </span>
            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
              {recipe?.subcategory.replace('.', ' / ')}
            </span>
          </div>

          <div className="border border-gray-200 px-5 py-3 mb-4 rounded-2xl md:rounded-lg flex items-center font-medium text-sm">
            Created by{' '}
            {recipe.created_by?.avatar_url ? (
              <img
                className="h-10 w-10 rounded-full mx-2"
                src={`${BUCKET_URL}/avatars/${recipe.created_by.avatar_url}`}
                alt=""
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="2.5em"
                height="2.5em"
                viewBox="0 0 24 24"
                className="mx-2"
              >
                <path
                  className="fill-gray-700"
                  d="M12 12q-1.65 0-2.825-1.175T8 8q0-1.65 1.175-2.825T12 4q1.65 0 2.825 1.175T16 8q0 1.65-1.175 2.825T12 12m-8 8v-2.8q0-.85.438-1.562T5.6 14.55q1.55-.775 3.15-1.162T12 13q1.65 0 3.25.388t3.15 1.162q.725.375 1.163 1.088T20 17.2V20z"
                ></path>
              </svg>
            )}
            {recipe.created_by?.name}
          </div>

          <div className="mb-8">{recipe?.description}</div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="border border-gray-200 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-500">Prep Time</div>
              <div className="font-medium">{formatTime(recipe.prep_time)}</div>
            </div>
            <div className="border border-gray-200 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-500">Cook Time</div>
              <div className="font-medium">{formatTime(recipe.cook_time)}</div>
            </div>
            <div className="border border-gray-200 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-500">Difficulty</div>
              <div className="font-medium">{formatDifficulty(recipe.difficulty)}</div>
            </div>
            <div className="border border-gray-200 p-4 rounded-lg text-center">
              <div className="text-sm text-gray-500">Servings</div>
              <div className="font-medium">{recipe.servings}</div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-medium mb-4">Ingredients</h3>
            <ul className="list-disc list-inside space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-gray-600">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-medium mb-4">Instructions</h3>
            <ol className="list-decimal list-inside space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="text-gray-600">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
