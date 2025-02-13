'use client';

import Image from 'next/image';
import Link from 'next/link';
import Tippy from '@tippyjs/react';

import { Recipe, DIFFICULTY_LEVELS } from '@/types/recipe';
import { BUCKET_URL } from '@/constants';

export default function RecipeListItem({ recipe }: { recipe: Recipe }) {
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
        <div className="absolute top-3 right-3 flex gap-2">
          <Tippy content={`${formatTime(recipe.prep_time + recipe.cook_time)} total`}>
            <span className="bg-base-600 text-white text-xs font-medium px-2.5 py-0.5 rounded">
              {formatTime(recipe.prep_time)} + {formatTime(recipe.cook_time)}
            </span>
          </Tippy>
          <span className="bg-base-500 text-white text-xs font-medium px-2.5 py-0.5 rounded">
            {formatDifficulty(recipe.difficulty)}
          </span>
        </div>
      </div>

      <div className="min-w-0 py-2 px-3 md:px-0">
        <p className="truncate text-md md:text-sm font-semibold">{recipe.name}</p>
        <p className="text-sm text-gray-500">
          {recipe.category} • {recipe.subcategory.replace('.', ' / ')}
        </p>
        <p className="text-sm text-gray-500">{recipe.servings} servings</p>
      </div>
    </Link>
  );
}
