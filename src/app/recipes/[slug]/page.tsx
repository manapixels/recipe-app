import { Metadata } from 'next';
import { fetchRecipe } from '@/api/recipe';
import { BUCKET_URL } from '@/constants';
import { CATEGORY_OPTIONS, Recipe, SUBCATEGORY_OPTIONS, NutritionalInfo } from '@/types/recipe';
import { Profile } from '@/types/profile';
import Image from 'next/image';
import Link from 'next/link';
import RecipeIngredients from '../_components/RecipeIngredients';
import { FavoriteButton } from '@/_components/ui/FavoriteButton';
import DifficultyDisplay from '@/_components/ui/DifficultyDisplay';
import RatingDisplay from '@/_components/ui/RatingDisplay';
import { RecipeVersioningWrapper } from '../_components/versioning/RecipeVersioningWrapper';
import { Clock, Star, Printer, Gauge } from 'lucide-react';
import { formatTime } from '@/utils/formatters';
import { estimateRecipeNutrition } from '@/utils/nutritionEstimator';

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

  // Determine nutritional info source
  let displayNutritionInfo: NutritionalInfo | null = null;
  let nutritionSourceMessage = 'Details not provided';
  const creatorNutritionInfo = recipe.nutrition_info;

  // Check if creatorNutritionInfo and its nested properties are valid
  const isCreatorNutritionInfoValid = (info?: NutritionalInfo): boolean => {
    if (!info) return false;
    // Check if any of the nutrient values are present and valid, or if servingSize is present
    return (
      !!info.servingSize ||
      Object.values(info).some(nutrient => {
        if (typeof nutrient === 'object' && nutrient !== null && 'value' in nutrient) {
          return typeof (nutrient as { value?: number }).value === 'number';
        }
        return false;
      })
    );
  };

  const hasCreatorNutritionInfo = isCreatorNutritionInfoValid(creatorNutritionInfo);

  if (hasCreatorNutritionInfo) {
    displayNutritionInfo = creatorNutritionInfo!;
    nutritionSourceMessage = 'Provided by creator';
  } else {
    const estimatedInfo = estimateRecipeNutrition(recipe.ingredients, recipe.servings);
    if (estimatedInfo && Object.keys(estimatedInfo).length > 0) {
      displayNutritionInfo = estimatedInfo;
      nutritionSourceMessage = 'Estimated based on ingredients';
    } else {
      nutritionSourceMessage = 'Not available';
    }
  }

  // Helper function to generate display labels for nutrient keys
  const generateNutrientLabel = (key: string): string => {
    if (key === 'calories') return 'Calories';
    if (key === 'recipeServingSize') return 'Recipe Yield / Serving Size'; // For form input, not directly used here unless added to NutritionalInfo type
    if (key === 'servingSize') return 'Per Serving'; // Label for the recipe's servingSize if displayed

    // Improved camelCase to Title Case
    let result = key.replace(/([A-Z])/g, ' $1');
    result = result.charAt(0).toUpperCase() + result.slice(1);
    return result.includes('Content') ? result.replace('Content', '').trim() : result;
  };

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

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-5 h-5 mr-1" />
            <span>{formatTime(recipe.total_time)}</span>
          </div>

          {/* Difficulty Info */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Gauge className="w-5 h-5 mr-1" />
            <DifficultyDisplay difficulty={recipe.difficulty} iconSize={20} />
          </div>

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

      {/* Ingredients and Nutritional Info Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-[65%_35%] gap-8">
        {/* Instructions Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
            Instructions
          </h2>

          {/* Method Section */}
          {recipe.instructions && recipe.instructions.length > 0 && (
            <div className="space-y-8">
              {recipe.instructions.map((instruction, index) => (
                <div
                  key={instruction.step || index}
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start"
                >
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <span className="text-4xl sm:text-5xl font-bold text-gray-300 dark:text-gray-600">
                      {instruction.step}
                    </span>
                  </div>

                  {/* Instruction Content */}
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 items-start w-full">
                    {/* Instruction Text (always takes the first column on md+) */}
                    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none md:col-span-1">
                      <p>{instruction.content}</p>
                    </div>

                    {/* Image or Placeholder (always takes the second column on md+) */}
                    <div className="md:col-span-1 flex items-center justify-center">
                      {instruction.image_url ? (
                        <Image
                          src={instruction.image_url} // Assuming this is a full URL or can be resolved
                          alt={`Step ${instruction.step} image`}
                          width={300} // Adjust as needed, perhaps make it responsive
                          height={200} // Adjust as needed
                          className="rounded-lg object-cover shadow-md w-full h-auto max-h-64"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 shadow-md"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4 md:gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Ingredients
            </h2>
            <RecipeIngredients recipe={recipe} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Nutritional Content{' '}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({nutritionSourceMessage})
              </span>
            </h2>
            {displayNutritionInfo ? (
              <div className="space-y-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow">
                {displayNutritionInfo.servingSize && (
                  <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                    <span className="font-medium">Serving Information:</span>
                    <span>{displayNutritionInfo.servingSize}</span>
                  </div>
                )}
                {/* Filter out servingSize (already displayed) and undefined/null nutrients */}
                {(Object.keys(displayNutritionInfo!) as Array<keyof NutritionalInfo>)
                  .filter(key => key !== 'servingSize' && displayNutritionInfo![key] !== undefined)
                  .map(key => {
                    const nutrient = displayNutritionInfo![key] as {
                      value?: number;
                      unit?: string;
                    };
                    if (typeof nutrient?.value === 'number' && nutrient?.unit) {
                      return (
                        <div
                          key={key}
                          className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                        >
                          <span className="font-medium">{generateNutrientLabel(key)}:</span>
                          <span>
                            {nutrient.value} {nutrient.unit}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow text-center">
                Nutritional details are not available for this recipe.
              </p>
            )}
          </div>
        </div>
      </div>

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
