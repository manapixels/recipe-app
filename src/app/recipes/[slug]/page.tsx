import { Metadata } from 'next';
import { fetchRecipe } from '@/api/recipe';
import { BUCKET_URL } from '@/constants';
import { CATEGORY_OPTIONS, DIFFICULTY_LEVELS, Recipe, SUBCATEGORY_OPTIONS } from '@/types/recipe';
import { Profile } from '@/types/profile';
import Image from 'next/image';
import Link from 'next/link';
import RecipeIngredients from '../_components/RecipeIngredients';

export const metadata: Metadata = {
  title: 'recipe-app | Recipe Details',
};

export default async function RecipeDetailsPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const recipe = (await fetchRecipe(slug)) as Recipe & {
    author: Profile & {
      recipes_created?: number;
    };
  };

  // Helper function to format time
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
        {recipe?.name}
      </div>
      <div className="flex flex-wrap justify-between items-center gap-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">by</span>
          <div className="h-8 inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10 dark:ring-gray-600">
            {recipe.author?.avatar_url ? (
              <Image
                className="h-5 w-5 rounded-full mx-1"
                src={`${BUCKET_URL}/avatars/${recipe.author.avatar_url}`}
                alt={`${recipe.author?.name || 'Author'}'s avatar`}
                width={20}
                height={20}
              />
            ) : (
              <div className="h-5 w-5 rounded-full mx-1 bg-gray-300 dark:bg-gray-600"></div>
            )}
            {recipe.author?.username ? (
              <Link
                href={`/profiles/${recipe.author.username}`}
                className="hover:underline font-semibold"
              >
                {recipe.author?.name || recipe.author?.username}
              </Link>
            ) : (
              <span className="font-semibold">{recipe.author?.name || 'Unknown Author'}</span>
            )}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-1 rounded-lg text-center ring-1 ring-inset ring-gray-500/10 dark:ring-gray-600">
          <div className="font-medium text-gray-800 dark:text-gray-200">
            {DIFFICULTY_LEVELS[recipe.difficulty]}
          </div>
        </div>
      </div>
      <div
        className={`w-full h-60 sm:h-72 md:h-96 mb-6 bg-gray-300 dark:bg-gray-700 bg-center bg-cover rounded-2xl shadow-lg ${recipe?.image_banner_url ? '' : 'grayscale opacity-60'}`}
        style={{
          backgroundImage: recipe?.image_banner_url
            ? `url(${BUCKET_URL}/recipe_banners/${recipe.image_banner_url})`
            : 'none',
        }}
      />
      {/* Ensure the content below the banner is constrained and centered */}
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-wrap items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
          <span className="h-8 inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10 dark:ring-gray-600">
            {CATEGORY_OPTIONS.find(opt => opt.value === recipe.category)?.label}
          </span>
          <span className="h-8 inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10 dark:ring-gray-600">
            {SUBCATEGORY_OPTIONS[recipe.category]?.find(opt => opt.value === recipe.subcategory)
              ?.label || recipe.subcategory}
          </span>
        </div>

        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-8">
          {recipe?.description}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg text-center bg-gray-50 dark:bg-gray-700/50">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Time</div>
            <div className="font-medium text-lg text-gray-800 dark:text-gray-200">
              {formatTime(recipe.total_time)}
            </div>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg text-center bg-gray-50 dark:bg-gray-700/50">
            <div className="text-sm text-gray-500 dark:text-gray-400">Servings</div>
            <div className="font-medium text-lg text-gray-800 dark:text-gray-200">
              {recipe.servings}
            </div>
          </div>
        </div>

        <RecipeIngredients recipe={recipe} />

        <div className="mb-8">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Instructions
          </h3>
          <ol className="list-decimal list-inside space-y-4 prose prose-sm sm:prose-base dark:prose-invert max-w-none">
            {recipe.instructions.map((instruction, index) => (
              <li key={index}>{instruction.content}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
