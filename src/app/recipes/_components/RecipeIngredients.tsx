'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { BUCKET_URL } from '@/constants';
import { Recipe, Ingredient, MeasurementUnit } from '@/types/recipe';
import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';
import {
  gramsToOunces,
  ouncesToGrams,
  mlToFluidOunces,
  fluidOuncesToMl,
  mlToUsCups,
  usCupsToMl,
} from '@/utils/conversions'; // Assuming temperature is not per-ingredient
import { useUser } from '@/_contexts/UserContext';

interface RecipeIngredientsProps {
  recipe: Recipe;
}

type UnitSystem = 'metric' | 'imperial';

// Define which of your existing MeasurementUnits are considered metric
const METRIC_UNITS: MeasurementUnit[] = ['g', 'mg', 'ml', 'l', 'kg'];

// Define target imperial units for display
const IMPERIAL_DISPLAY_UNITS = {
  WEIGHT: 'oz',
  VOLUME_SMALL: 'fl oz',
  VOLUME_LARGE: 'cup',
};

export default function RecipeIngredients({ recipe }: RecipeIngredientsProps) {
  const { profile, loading: userLoading } = useUser();
  const [currentServings, setCurrentServings] = useState(recipe.servings);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric'); // Default to metric
  const servingsRatio = currentServings / recipe.servings;

  useEffect(() => {
    if (!userLoading && profile && profile.preferred_unit_system) {
      if (
        profile.preferred_unit_system === 'metric' ||
        profile.preferred_unit_system === 'imperial'
      ) {
        setUnitSystem(profile.preferred_unit_system);
      }
    } else if (!userLoading && profile && !profile.preferred_unit_system) {
      setUnitSystem('metric'); // Default to metric if no preference
    }
  }, [profile, userLoading]);

  const getDisplayAmountAndUnit = (ingredient: Ingredient) => {
    const originalAmountStr = ingredient.amount;
    const originalUnit = ingredient.unit;
    let amount = parseFloat(originalAmountStr);

    if (isNaN(amount)) {
      return { displayAmount: originalAmountStr, displayUnit: originalUnit || '' }; // Non-numeric amount
    }

    amount = amount * servingsRatio;

    // Metric System Target
    if (unitSystem === 'metric') {
      if (originalUnit === IMPERIAL_DISPLAY_UNITS.WEIGHT) {
        // e.g. oz
        return { displayAmount: ouncesToGrams(amount).toFixed(0), displayUnit: 'g' };
      }
      if (originalUnit === IMPERIAL_DISPLAY_UNITS.VOLUME_SMALL) {
        // e.g. fl oz
        return { displayAmount: fluidOuncesToMl(amount).toFixed(0), displayUnit: 'ml' };
      }
      if (originalUnit === IMPERIAL_DISPLAY_UNITS.VOLUME_LARGE) {
        // e.g. cup
        return { displayAmount: usCupsToMl(amount).toFixed(0), displayUnit: 'ml' };
      }
      // If already metric or no direct imperial to metric conversion, show scaled amount in its original metric unit or just base unit
      const displayUnit = originalUnit && METRIC_UNITS.includes(originalUnit) ? originalUnit : 'g';
      return {
        displayAmount: amount.toFixed(METRIC_UNITS.includes(originalUnit) ? 1 : 0),
        displayUnit: displayUnit,
      };
    }

    // Imperial System Target
    if (unitSystem === 'imperial') {
      if (originalUnit === 'g') {
        return {
          displayAmount: gramsToOunces(amount).toFixed(1),
          displayUnit: IMPERIAL_DISPLAY_UNITS.WEIGHT,
        };
      }
      if (originalUnit === 'ml') {
        // Prefer fl oz for smaller ml, cups for larger, simplistic threshold here
        if (amount < 200 && amount > 5) {
          // Heuristic for fl oz vs cups
          return {
            displayAmount: mlToFluidOunces(amount).toFixed(1),
            displayUnit: IMPERIAL_DISPLAY_UNITS.VOLUME_SMALL,
          };
        } else if (amount >= 200) {
          return {
            displayAmount: mlToUsCups(amount).toFixed(1),
            displayUnit: IMPERIAL_DISPLAY_UNITS.VOLUME_LARGE,
          };
        }
        // For very small ml values or those not fitting heuristics, keep as ml or scaled original
        return { displayAmount: amount.toFixed(1), displayUnit: 'ml' };
      }
      if (originalUnit === 'l') {
        // Convert liters to cups (1 liter ~ 4.22 cups)
        return {
          displayAmount: mlToUsCups(amount * 1000).toFixed(1),
          displayUnit: IMPERIAL_DISPLAY_UNITS.VOLUME_LARGE,
        };
      }
      // If already imperial or no direct metric to imperial conversion, show scaled original or just scaled amount
      return { displayAmount: amount.toFixed(1), displayUnit: originalUnit || '' };
    }

    // Fallback logic: if unitSystem is somehow not metric or imperial (should not happen with new type)
    // Default to metric display as a safe fallback.
    if (originalUnit === IMPERIAL_DISPLAY_UNITS.WEIGHT) {
      return { displayAmount: ouncesToGrams(amount).toFixed(0), displayUnit: 'g' };
    }
    if (originalUnit === IMPERIAL_DISPLAY_UNITS.VOLUME_SMALL) {
      return { displayAmount: fluidOuncesToMl(amount).toFixed(0), displayUnit: 'ml' };
    }
    if (originalUnit === IMPERIAL_DISPLAY_UNITS.VOLUME_LARGE) {
      return { displayAmount: usCupsToMl(amount).toFixed(0), displayUnit: 'ml' };
    }
    const fallbackDisplayUnit =
      originalUnit && METRIC_UNITS.includes(originalUnit) ? originalUnit : 'g';
    return {
      displayAmount: amount.toFixed(METRIC_UNITS.includes(originalUnit) ? 1 : 0),
      displayUnit: fallbackDisplayUnit,
    };
  };

  return (
    <div className="bg-[#f3e9cf] dark:bg-gray-800/30 rounded-lg shadow">
      <div className="mb-6 px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="servings"
              className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
            >
              Servings:
            </label>
            <input
              type="number"
              id="servings"
              min="1"
              value={currentServings}
              onChange={e => setCurrentServings(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-gray-800 focus:border-gray-800"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Units:
            </span>
            <div className="flex rounded-md shadow-sm bg-white dark:bg-gray-700 ring-1 ring-gray-300 dark:ring-gray-600">
              {(['metric', 'imperial'] as UnitSystem[]).map(system => (
                <button
                  key={system}
                  onClick={() => setUnitSystem(system)}
                  className={`px-3 py-1.5 text-sm font-medium capitalize focus:z-10 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 first:rounded-l-md last:rounded-r-md border-gray-300 dark:border-gray-600 -ml-px first:ml-0
                    ${
                      unitSystem === system
                        ? 'bg-gray-800 text-white dark:bg-base-600'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                >
                  {system}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ul className="border-t border-gray-200 dark:border-gray-700">
        {recipe.ingredients.map((ingredient, index) => {
          const { displayAmount, displayUnit } = getDisplayAmountAndUnit(ingredient);
          return (
            <li
              key={index}
              className="flex items-center border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <div className="px-4 py-3">
                <Checkbox.Root
                  id={`ingredient-${index}`}
                  className="flex items-center justify-center w-5 h-5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded data-[state=checked]:bg-base-600 data-[state=checked]:border-base-600 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  <Checkbox.Indicator className="text-white dark:text-gray-900">
                    <CheckIcon className="w-4 h-4" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
              </div>
              <div className="flex flex-grow items-center gap-3 px-4 py-3">
                <label
                  htmlFor={`ingredient-${index}`}
                  className="flex-grow text-gray-800 dark:text-gray-200"
                >
                  {ingredient.name}
                  {displayAmount && displayUnit && (
                    <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">
                      ({displayAmount} {displayUnit})
                    </span>
                  )}
                  {!displayAmount && ingredient.amount && (
                    <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">
                      ({ingredient.amount} {ingredient.unit || ''})
                    </span>
                  )}
                </label>
                <div className="w-12 h-12 flex-shrink-0">
                  {ingredient.image_url ? (
                    <Image
                      src={`${BUCKET_URL}/ingredients/${ingredient.image_url}`}
                      alt={ingredient.name}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
