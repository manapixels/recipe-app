'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Recipe, NutritionalInfo, getAllIngredientsFromComponents } from '@/types/recipe';
import RecipeIngredients from '../_components/RecipeIngredients';
import { estimateRecipeNutrition } from '@/utils/nutritionEstimator';

interface DynamicRecipeContentProps {
  recipe: Recipe;
}

export default function DynamicRecipeContent({ recipe }: DynamicRecipeContentProps) {
  const [currentServings, setCurrentServings] = useState(recipe.servings);

  // Calculate nutrition based on current servings
  const calculateNutritionForServings = (servings: number) => {
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

    if (hasCreatorNutritionInfo && creatorNutritionInfo) {
      // Creator-provided nutrition is per serving, scale it to total for current servings
      const totalNutrition: NutritionalInfo = {};

      Object.entries(creatorNutritionInfo).forEach(([key, value]) => {
        if (key === 'servingSize' && typeof value === 'string') {
          // Keep serving size description unchanged
          totalNutrition.servingSize = value;
        } else if (
          value &&
          typeof value === 'object' &&
          'value' in value &&
          typeof value.value === 'number'
        ) {
          // Scale nutrient values by current servings
          const totalValue = {
            value: Math.round(value.value * servings * 10) / 10, // Round to 1 decimal place
            unit: value.unit,
          };
          (totalNutrition as any)[key] = totalValue;
        }
      });

      return {
        nutrition: totalNutrition,
        source: 'Provided by creator',
      };
    } else {
      // Use estimation based on ingredients
      // First get per-serving nutrition based on original recipe servings
      const allIngredients = getAllIngredientsFromComponents(recipe.components);
      const perServingEstimation = estimateRecipeNutrition(allIngredients, recipe.servings);

      if (perServingEstimation && Object.keys(perServingEstimation).length > 0) {
        // Scale the per-serving nutrition to total nutrition for current servings
        const totalNutrition: NutritionalInfo = {};

        Object.entries(perServingEstimation).forEach(([key, value]) => {
          if (key === 'servingSize' && typeof value === 'string') {
            // Keep serving size description unchanged
            totalNutrition.servingSize = value;
          } else if (
            value &&
            typeof value === 'object' &&
            'value' in value &&
            typeof value.value === 'number'
          ) {
            // Scale nutrient values by current servings
            const totalValue = {
              value: Math.round(value.value * servings * 10) / 10, // Round to 1 decimal place
              unit: value.unit,
            };
            (totalNutrition as any)[key] = totalValue;
          }
        });

        return {
          nutrition: totalNutrition,
          source: 'Estimated based on ingredients',
        };
      } else {
        return {
          nutrition: null,
          source: 'Not available',
        };
      }
    }
  };

  const { nutrition: displayNutritionInfo, source: nutritionSourceMessage } =
    calculateNutritionForServings(currentServings);

  // Helper function to generate display labels for nutrient keys
  const generateNutrientLabel = (key: string): string => {
    if (key === 'calories') return 'Calories';
    if (key === 'recipeServingSize') return 'Recipe Yield / Serving Size';
    if (key === 'servingSize') return 'Per Serving';

    // Improved camelCase to Title Case
    let result = key.replace(/([A-Z])/g, ' $1');
    result = result.charAt(0).toUpperCase() + result.slice(1);
    return result.includes('Content') ? result.replace('Content', '').trim() : result;
  };

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
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Nutritional Content{' '}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                (total for {currentServings} serving{currentServings !== 1 ? 's' : ''} •{' '}
                {nutritionSourceMessage})
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
                {currentServings !== recipe.servings && (
                  <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                    <span className="font-medium">Total Servings:</span>
                    <span>
                      {currentServings} (adjusted from {recipe.servings})
                    </span>
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
                            {nutrient.value.toLocaleString()} {nutrient.unit}
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
    </>
  );
}
