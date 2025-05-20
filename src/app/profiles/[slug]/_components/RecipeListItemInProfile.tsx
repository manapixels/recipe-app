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
      className="block bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-square relative">
        {recipe?.image_thumbnail_url ? (
          <Image
            src={`${BUCKET_URL}/recipe_thumbnails/${recipe?.image_thumbnail_url}`}
            alt={recipe?.name}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Image
              src="/recipe-placeholder.svg"
              alt="Recipe"
              width={64}
              height={64}
              className="opacity-20"
            />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className="bg-base-500 text-white text-xs font-medium px-2.5 py-0.5 rounded">
            {formatDifficulty(recipe.difficulty)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate">{recipe.name}</h3>
        <p className="text-sm text-gray-500">
          {recipe.category} • {recipe.subcategory.replace('.', ' / ')}
        </p>
        <p className="text-sm text-gray-500">{formatTime(recipe.total_time)} total</p>
      </div>
    </Link>
  );
}
