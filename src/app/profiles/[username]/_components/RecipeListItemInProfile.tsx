import Image from 'next/image';
import Link from 'next/link';
import { Recipe, DIFFICULTY_LEVELS } from '@/types/recipe';
import { BUCKET_URL } from '@/constants';

export default function RecipeListItemInProfile({ recipe }: { recipe: Recipe }) {
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
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150 overflow-hidden group"
    >
      <div className="aspect-square relative">
        {recipe?.image_thumbnail_url ? (
          <Image
            src={`${BUCKET_URL}/recipe_thumbnails/${recipe?.image_thumbnail_url}`}
            alt={recipe?.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ease-in-out"
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <Image
              src="/recipe-placeholder.svg"
              alt="Recipe"
              width={64}
              height={64}
              className="opacity-20 dark:opacity-50"
            />
          </div>
        )}
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-base-500 text-white text-xs font-medium px-2.5 py-0.5 rounded dark:bg-base-600 dark:text-base-50">
            {formatDifficulty(recipe.difficulty)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <p className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-1">
          {recipe.name}
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-200 dark:ring-gray-600/20 capitalize">
            {recipe.category}
          </span>
          <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-200 dark:ring-gray-600/20 capitalize">
            {recipe.subcategory.replace('.', ' / ')}
          </span>
          <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-200 dark:ring-gray-600/20">
            {formatTime(recipe.total_time)}
          </span>
        </div>
      </div>
    </Link>
  );
}
