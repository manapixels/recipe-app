import Image from 'next/image';
import Link from 'next/link';
import { Recipe } from '@/types/recipe';
import { BUCKET_URL } from '@/constants';
import { FavoriteButton } from '@/_components/ui/FavoriteButton';
import DifficultyDisplay from '@/_components/ui/DifficultyDisplay';
import { formatTime } from '@/utils/formatters';

export default function RecipeListItemInProfile({ recipe }: { recipe: Recipe }) {
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
        <div className="absolute top-2 right-2 z-20">
          <FavoriteButton
            recipeId={recipe.id}
            initialIsFavorited={!!recipe.is_favorited}
            size="sm"
          />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-md mb-1 group-hover:text-primary transition-colors duration-200">
          {recipe.name}
        </h3>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <DifficultyDisplay difficulty={recipe.difficulty} iconSize={14} />
          <span className="mx-1">|</span>
          <span>{formatTime(recipe.total_time)}</span>
        </div>
      </div>
    </Link>
  );
}
