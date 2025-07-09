import { Metadata } from 'next';
import { fetchRecipe } from '@/api/recipe';
import { BUCKET_URL } from '@/constants';
import { CATEGORY_OPTIONS, Recipe, SUBCATEGORY_OPTIONS } from '@/types/recipe';
import { Profile } from '@/types/profile';
import Image from 'next/image';
import Link from 'next/link';
import { FavoriteButton } from '@/_components/ui/FavoriteButton';
import DifficultyDisplay from '@/_components/ui/DifficultyDisplay';
import RatingDisplay from '@/_components/ui/RatingDisplay';
import { RecipeVersioningWrapper } from '../_components/versioning/RecipeVersioningWrapper';
import { NutritionFacts } from '@/_components/ui/NutritionFacts';
import { estimateRecipeNutrition } from '@/utils/nutritionEstimator';
import { Clock, Star, Printer, Gauge } from 'lucide-react';
import { formatTime } from '@/utils/formatters';
import DynamicRecipeContent from './DynamicRecipeContent';

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

  // Handle case where recipe might not be found
  if (!recipe) {
    return <div className="text-center py-10">Recipe not found.</div>;
  }

  // Get all ingredients from recipe components for nutrition estimation
  const allIngredients = recipe.components?.flatMap(component => component.ingredients) || [];

  // Get nutrition info - use provided data or estimate from ingredients
  const nutritionInfo =
    recipe.nutrition_info || estimateRecipeNutrition(allIngredients, recipe.servings);

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Image */}
        <div>
          <div
            className={`relative w-full h-[400px] md:h-[500px] bg-gray-300 dark:bg-gray-700 bg-center bg-cover rounded-2xl shadow-lg ${recipe?.image_banner_url ? '' : 'grayscale opacity-60'}`}
            style={{
              backgroundImage: recipe?.image_banner_url
                ? `url(${BUCKET_URL}/recipe_banners/${recipe.image_banner_url})`
                : 'none',
            }}
          >
            {!recipe?.image_banner_url && (
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Placeholder Icon/Text if no image */}
                <span className="text-gray-500 text-2xl">No Image</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recipe Details */}
        <div className="flex flex-col space-y-4 self-center">
          {/* Recipe Category and Subcategory Tags */}
          <div className="flex gap-2 flex-wrap">
            <Link href={`/recipes?category=${recipe.category}`} passHref>
              <span className="h-8 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                {CATEGORY_OPTIONS.find(opt => opt.value === recipe.category)?.label}
              </span>
            </Link>
            <Link
              href={`/recipes?category=${recipe.category}&subcategory=${recipe.subcategory}`}
              passHref
            >
              <span className="h-8 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                {SUBCATEGORY_OPTIONS[recipe.category]?.find(opt => opt.value === recipe.subcategory)
                  ?.label || recipe.subcategory}
              </span>
            </Link>
            <span className="h-8 inline-flex items-center rounded-md px-2 py-1 text-xs text-gray-300 dark:text-gray-300">
              |
            </span>
            {/* Author Info */}
            {recipe.author?.username ? (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Link
                  href={`/profiles/${recipe.author.username}`}
                  className="h-8 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
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
                      className="font-semibold hover:text-gray-900"
                    >
                      {recipe.author?.name || recipe.author?.username}
                    </Link>
                  ) : (
                    <span className="font-semibold">{recipe.author?.name || 'Unknown Author'}</span>
                  )}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold">{recipe.author?.name || 'Unknown Author'}</span>
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {recipe.name}
          </h1>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <RatingDisplay
              rating={(recipe as any).rating || 4.5}
              reviewCount={(recipe as any).review_count || 25}
            />
          </div>

          {/* Recipe description */}
          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mt-8 mb-8">
            {recipe?.description}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-5 h-5 mr-1" />
            <span>{formatTime(recipe.total_time)}</span>
          </div>

          {/* Difficulty Info */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Gauge className="w-5 h-5 mr-1" />
            <DifficultyDisplay difficulty={recipe.difficulty} iconSize={20} />
          </div>

          {/* Compact Nutrition Display */}
          {nutritionInfo && (
            <NutritionFacts
              nutrition={nutritionInfo}
              servings={recipe.servings}
              compact={true}
              className="mt-2"
            />
          )}

          <div className="w-1/2"></div>

          <div className="flex items-center gap-2">
            <FavoriteButton
              recipeId={recipe.id}
              initialIsFavorited={!!recipe.is_favorited}
              className="text-black px-6 py-3 rounded-lg text-base font-semibold"
              size="sm"
            />
            <button className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm">
              <Printer className="w-5 h-5" /> Print this recipe
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic content that updates with servings changes */}
      <DynamicRecipeContent recipe={recipe} />

      {/* Nutrition Facts Section */}
      {nutritionInfo && (
        <div className="mt-16 border-t pt-16">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
            Nutrition Information
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <NutritionFacts
              nutrition={nutritionInfo}
              servings={recipe.servings}
              className="max-w-md"
            />
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                About These Nutrition Facts
              </h3>
              <p>
                {recipe.nutrition_info
                  ? 'Nutritional values provided by the recipe author.'
                  : 'Nutritional values are automatically estimated based on the ingredients in this recipe.'}
              </p>
              <p>
                Values are calculated per serving based on {recipe.servings} total serving
                {recipe.servings !== 1 ? 's' : ''}.
              </p>
              <p className="text-xs">
                * Actual nutritional content may vary based on specific brands, preparation methods,
                and portion sizes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* "You might also like..." Section (Placeholder) */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          You might also like...
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Placeholder for related recipes - map through actual related recipe data here */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
            >
              <div className="w-full h-32 bg-gray-300 dark:bg-gray-700"></div>{' '}
              {/* Placeholder Image */}
              <div className="p-3">
                <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                  Recipe Name {index + 1}
                </h3>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Star className="w-3 h-3 text-yellow-400 mr-1" />
                  <span>4.5 (32)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Original description placement - consider if this should be moved or restyled */}
      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mt-8 mb-8">
        {recipe?.description}
      </div>

      {/* Recipe Versioning & Diary Section */}
      <div className="mt-16 border-t pt-16">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          Recipe Versions & Cooking Diary
        </h2>
        <RecipeVersioningWrapper
          recipe={recipe}
          initialVersionId={recipe.version_id || undefined}
        />
      </div>
    </div>
  );
}
