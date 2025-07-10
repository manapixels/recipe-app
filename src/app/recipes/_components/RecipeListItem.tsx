'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Recipe, SUBCATEGORY_OPTIONS } from '@/types/recipe';
import { BUCKET_URL } from '@/constants';
import DifficultyDisplay from '@/_components/ui/DifficultyDisplay';
import { FavoriteButton } from '@/_components/ui/FavoriteButton';
import RatingDisplay from '@/_components/ui/RatingDisplay';
import { formatTime } from '@/utils/formatters';

interface RecipeListItemProps {
  recipe: Recipe;
  initialIsFavorited: boolean;
  avgRating?: number;
  totalRatings?: number;
}

export default function RecipeListItem({
  recipe,
  initialIsFavorited,
  avgRating,
  totalRatings,
}: RecipeListItemProps) {
  const subcategoryLabel = SUBCATEGORY_OPTIONS[recipe.category]?.find(
    opt => opt.value === recipe.subcategory
  )?.label;

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      key={recipe.slug}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150 overflow-hidden group"
    >
      <div className="w-32 md:w-full relative aspect-square flex-shrink-0">
        {recipe?.image_thumbnail_url ? (
          <Image
            src={`${BUCKET_URL}/recipe_thumbnails/${recipe?.image_thumbnail_url}`}
            alt={`${recipe?.name}`}
            className="rounded-lg md:rounded-none md:rounded-t-lg object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ease-in-out"
            width={300}
            height={300}
          />
        ) : (
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg md:rounded-none md:rounded-t-lg w-full h-full flex justify-center items-center">
            <Image
              src="/recipe-placeholder.svg"
              alt="Recipe"
              width="100"
              height="100"
              className="grayscale opacity-20 dark:opacity-50"
            />
          </div>
        )}
        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton recipeId={recipe.id} initialIsFavorited={initialIsFavorited} />
        </div>
      </div>

      <div className="p-4">
        <p className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-1">
          {recipe.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mb-2">
          {subcategoryLabel}
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-200 dark:ring-gray-600/20">
            {formatTime(recipe.total_time)}
          </span>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <DifficultyDisplay difficulty={recipe.difficulty} iconSize={14} />
          </div>
        </div>

        {/* Rating display */}
        {avgRating !== undefined && totalRatings !== undefined && (
          <div className="mt-2">
            <RatingDisplay
              rating={avgRating}
              reviewCount={totalRatings}
              iconSize={14}
              className="text-xs"
              textClassName="text-xs text-gray-500 dark:text-gray-400 ml-1"
            />
          </div>
        )}
      </div>
    </Link>
  );
}
