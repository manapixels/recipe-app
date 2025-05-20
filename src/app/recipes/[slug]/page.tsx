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
    <div>
      <div className="text-2xl font-bold mb-2">{recipe?.name}</div>
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">by</span>
          <div className="h-8 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
            {recipe.author?.avatar_url ? (
              <Image
                className="h-5 w-5 rounded-full mx-1"
                src={`${BUCKET_URL}/avatars/${recipe.author.avatar_url}`}
                alt=""
                width={20}
                height={20}
              />
            ) : (
              <div className="h-5 w-5 rounded-full mx-1 bg-gray-200"></div>
            )}
            {recipe.author?.username ? (
              <Link href={`/profiles/${recipe.author.username}`} className="hover:underline">
                <b>{recipe.author?.name}</b>
              </Link>
            ) : (
              <b>{recipe.author?.name || 'Unknown Author'}</b>
            )}
          </div>
        </div>
        <div className="bg-gray-50 p-1 rounded-lg text-center ring-1 ring-inset ring-gray-500/10">
          <div className="font-medium">{DIFFICULTY_LEVELS[recipe.difficulty]}</div>
        </div>
      </div>
      <div
        className={`w-full h-72 md:h-96 mb-4 bg-gray-300 bg-center bg-cover rounded-2xl ${recipe?.image_banner_url ? '' : 'grayscale opacity-50'}`}
        style={{
          backgroundImage: recipe?.image_banner_url
            ? `url(${BUCKET_URL}/recipe_banners/${recipe.image_banner_url})`
            : 'none',
        }}
      />
      <div className="w-full md:w-2/3">
        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <span className="h-8 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
            {CATEGORY_OPTIONS.find(opt => opt.value === recipe.category)?.label}
          </span>
          <span className="h-8 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
            {
              SUBCATEGORY_OPTIONS[recipe.category]?.find(opt => opt.value === recipe.subcategory)
                ?.label
            }
          </span>
        </div>

        <div className="mb-8">{recipe?.description}</div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="border border-gray-200 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-500">Total Time</div>
            <div className="font-medium">{formatTime(recipe.total_time)}</div>
          </div>
          <div className="border border-gray-200 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-500">Servings</div>
            <div className="font-medium">{recipe.servings}</div>
          </div>
        </div>

        <RecipeIngredients recipe={recipe} />

        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Instructions</h3>
          <ol className="list-decimal list-inside space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="text-gray-600">
                {instruction.content}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
