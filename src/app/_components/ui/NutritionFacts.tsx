'use client';

import { NutritionalInfo } from '@/types/recipe';
import { cn } from '@/utils/cn';

interface NutritionFactsProps {
  nutrition: NutritionalInfo;
  servings: number;
  className?: string;
  compact?: boolean;
}

export function NutritionFacts({
  nutrition,
  servings,
  className,
  compact = false,
}: NutritionFactsProps) {
  // Helper to format nutrient values
  const formatNutrient = (value?: number, unit?: string) => {
    if (value === undefined || value === null) return null;

    // Round based on unit type
    const roundedValue =
      unit === 'kcal' || unit === 'mg' ? Math.round(value) : Math.round(value * 10) / 10;

    return `${roundedValue}${unit || 'g'}`;
  };

  // Get main macros for compact view
  const mainNutrients = [
    { label: 'Calories', value: nutrition.calories?.value, unit: nutrition.calories?.unit },
    {
      label: 'Carbs',
      value: nutrition.carbohydrateContent?.value,
      unit: nutrition.carbohydrateContent?.unit,
    },
    { label: 'Fat', value: nutrition.fatContent?.value, unit: nutrition.fatContent?.unit },
    {
      label: 'Protein',
      value: nutrition.proteinContent?.value,
      unit: nutrition.proteinContent?.unit,
    },
  ];

  // All nutrients for full view
  const allNutrients = [
    {
      label: 'Calories',
      value: nutrition.calories?.value,
      unit: nutrition.calories?.unit,
      highlight: true,
    },
    {
      label: 'Total Carbohydrates',
      value: nutrition.carbohydrateContent?.value,
      unit: nutrition.carbohydrateContent?.unit,
    },
    {
      label: 'Dietary Fiber',
      value: nutrition.fiberContent?.value,
      unit: nutrition.fiberContent?.unit,
      indent: true,
    },
    {
      label: 'Total Sugars',
      value: nutrition.sugarContent?.value,
      unit: nutrition.sugarContent?.unit,
      indent: true,
    },
    { label: 'Total Fat', value: nutrition.fatContent?.value, unit: nutrition.fatContent?.unit },
    {
      label: 'Saturated Fat',
      value: nutrition.saturatedFatContent?.value,
      unit: nutrition.saturatedFatContent?.unit,
      indent: true,
    },
    {
      label: 'Trans Fat',
      value: nutrition.transFatContent?.value,
      unit: nutrition.transFatContent?.unit,
      indent: true,
    },
    {
      label: 'Protein',
      value: nutrition.proteinContent?.value,
      unit: nutrition.proteinContent?.unit,
    },
    {
      label: 'Cholesterol',
      value: nutrition.cholesterolContent?.value,
      unit: nutrition.cholesterolContent?.unit,
    },
    { label: 'Sodium', value: nutrition.sodiumContent?.value, unit: nutrition.sodiumContent?.unit },
  ];

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400',
          className
        )}
      >
        {mainNutrients.map((nutrient, index) => {
          const formatted = formatNutrient(nutrient.value, nutrient.unit);
          if (!formatted) return null;

          return (
            <div key={index} className="flex items-center gap-1">
              <span className="font-medium">{nutrient.label}:</span>
              <span>{formatted}</span>
            </div>
          );
        })}
        <span className="text-xs text-gray-500">per serving</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4',
        className
      )}
    >
      <div className="border-b-8 border-black dark:border-white pb-2 mb-3">
        <h3 className="text-xl font-bold text-black dark:text-white">Nutrition Facts</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Per serving • Makes {servings} serving{servings !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-2">
        {allNutrients.map((nutrient, index) => {
          const formatted = formatNutrient(nutrient.value, nutrient.unit);
          if (!formatted) return null;

          return (
            <div
              key={index}
              className={cn(
                'flex justify-between items-center py-1',
                nutrient.highlight &&
                  'text-lg font-bold border-b border-gray-300 dark:border-gray-600',
                nutrient.indent && 'pl-4 text-sm',
                !nutrient.highlight &&
                  !nutrient.indent &&
                  'border-b border-gray-200 dark:border-gray-700'
              )}
            >
              <span
                className={cn(
                  nutrient.highlight ? 'font-bold' : 'font-medium',
                  'text-gray-900 dark:text-gray-100'
                )}
              >
                {nutrient.label}
              </span>
              <span
                className={cn(
                  nutrient.highlight ? 'font-bold' : 'font-medium',
                  'text-gray-900 dark:text-gray-100'
                )}
              >
                {formatted}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <p>* Nutritional values are estimated based on ingredient data and may vary.</p>
      </div>
    </div>
  );
}
