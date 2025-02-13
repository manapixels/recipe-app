import Image from 'next/image';
import Link from 'next/link';
import { Recipe, DIFFICULTY_LEVELS } from '@/types/recipe';
import { BUCKET_URL } from '@/constants';

export default function RecipeListItemInMyRecipes({ recipe }: { recipe: Recipe }) {
  // Helper function to format difficulty level
  const formatDifficulty = (level: number) => {
    return DIFFICULTY_LEVELS[level] || 'Unknown';
  };

  // Helper function to format time
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg">
      <div className="w-full md:w-48 relative aspect-square flex-shrink-0">
        {recipe?.image_thumbnail_url ? (
          <Image
            src={`${BUCKET_URL}/recipe_thumbnails/${recipe?.image_thumbnail_url}`}
            alt={`${recipe?.name}`}
            className="rounded-lg object-cover w-full h-full"
            width="300"
            height="300"
          />
        ) : (
          <div className="bg-gray-200 rounded-lg w-full h-full flex justify-center items-center">
            <Image
              src="/recipe-placeholder.svg"
              alt="Recipe"
              width="100"
              height="100"
              className="grayscale opacity-20"
            />
          </div>
        )}
      </div>

      <div className="min-w-0 py-2 flex-grow flex flex-col md:gap-4 justify-between">
        <div>
          {/* Recipe name & tags */}
          <div className="flex gap-4">
            <Link
              href={`/recipes/${recipe?.slug}`}
              className="truncate text-md md:text-sm font-semibold mb-1"
            >
              {recipe?.name}
            </Link>
            <div className="items-center gap-2 mb-2 hidden md:flex">
              <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                {recipe.category}
              </span>
              <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                {recipe.subcategory.replace('.', ' / ')}
              </span>
            </div>
          </div>

          {/* Recipe details */}
          <div className="text-sm text-gray-500 space-y-1">
            <p>
              Prep: {formatTime(recipe.prep_time)} • Cook: {formatTime(recipe.cook_time)}
            </p>
            <p>Difficulty: {formatDifficulty(recipe.difficulty)}</p>
            <p>Servings: {recipe.servings}</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
              recipe.status === 'published'
                ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                : recipe.status === 'draft'
                  ? 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
                  : 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'
            }`}
          >
            {recipe.status.charAt(0).toUpperCase() + recipe.status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
