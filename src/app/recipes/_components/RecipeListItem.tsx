'use client';

import Image from 'next/image';
import Link from 'next/link';
import pluralize from 'pluralize';

import { Recipe, DIFFICULTY_LEVELS, SUBCATEGORY_OPTIONS } from '@/types/recipe';
import { BUCKET_URL } from '@/constants';

export default function RecipeListItem({ recipe }: { recipe: Recipe }) {
  // Helper function to format difficulty level
  const formatDifficulty = (level: number) => {
    return DIFFICULTY_LEVELS[level] || 'Unknown';
  };

  // Helper function to format time
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} ${pluralize('min', minutes)}`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes} ${pluralize('min', remainingMinutes)}`
      : `${hours} ${pluralize('hour', hours)}`;
  };

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      key={recipe.slug}
      className="px-0 md:px-3 py-3 rounded-lg hover:bg-gray-100 flex md:block overflow-hidden"
    >
      <div className="w-32 md:w-full relative aspect-square flex-shrink-0">
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

      <div className="min-w-0 py-2 px-3 md:px-0">
        <p className="truncate text-md md:text-sm font-semibold">{recipe.name}</p>
        <p className="text-sm text-gray-500 capitalize">
          {
            SUBCATEGORY_OPTIONS[recipe.category]?.find(opt => opt.value === recipe.subcategory)
              ?.label
          }
        </p>
        <p className="text-sm text-gray-500">
          {recipe.servings} {pluralize('serving', recipe.servings)}
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
            {formatTime(recipe.total_time)}
          </span>
          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 capitalize">
            {formatDifficulty(recipe.difficulty)}
          </span>
        </div>
      </div>
    </Link>
  );
}
