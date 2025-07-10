'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Recipe, NutritionalInfo } from '@/types/recipe';
import RecipeIngredients from '../_components/RecipeIngredients';
import { NutritionFacts } from '@/_components/ui/NutritionFacts';

interface DynamicRecipeContentProps {
  recipe: Recipe;
  nutritionInfo?: NutritionalInfo | null;
}

export default function DynamicRecipeContent({ recipe, nutritionInfo }: DynamicRecipeContentProps) {
  const [currentServings, setCurrentServings] = useState(recipe.servings);

  // Create a modified recipe object with current servings for RecipeIngredients
  const recipeWithCurrentServings = {
    ...recipe,
    servings: currentServings,
  };

  return (
    <>
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
                          src={instruction.image_url}
                          alt={`Step ${instruction.step} image`}
                          width={300}
                          height={200}
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
            <RecipeIngredients
              recipe={recipeWithCurrentServings}
              onServingsChange={setCurrentServings}
            />
          </div>

          {/* Nutrition Information */}
          {nutritionInfo && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Nutrition Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <NutritionFacts
                  nutrition={nutritionInfo}
                  servings={recipe.servings}
                  className="max-w-md"
                />
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    About These Nutrition Facts
                  </h4>
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
                    * Actual nutritional content may vary based on specific brands, preparation
                    methods, and portion sizes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
