import { Ingredient, NutritionalInfo, NutrientValue } from '@/types/recipe';
import ingredientNutritionDataJson from '@/data/ingredientNutritionData.json';

// Type for the items in ingredientNutritionData.json, using the schema.org-aligned NutritionalInfo
interface IngredientDataEntry {
  name: string;
  baseUnit: string; // Base unit for the ingredient entry, e.g., "100g", "100ml"
  nutrition: NutritionalInfo & { '@type'?: string }; // Contains NutrientValue objects
}

// Cast the imported JSON to our new type.
const ingredientNutritionData: IngredientDataEntry[] =
  ingredientNutritionDataJson as IngredientDataEntry[];

// Helper to parse the numeric value from the baseUnit string (e.g., "100g" -> 100)
function parseBaseUnitValue(baseUnitString?: string): number {
  if (!baseUnitString) return 100; // Default to 100 if undefined
  const match = baseUnitString.match(/^(\d*\.?\d+)/);
  return match && match[1] ? parseFloat(match[1]) : 100; // Default if no number found
}

// Internal structure for aggregating numeric values.
// Units are assumed to be consistent as per ingredientNutritionData.json (e.g., g, mg, kcal)
// This will store the sum of values, units will be added at the end.
type AggregatedNumericValues = {
  [K in keyof Omit<NutritionalInfo, 'servingSize' | '@type'>]: number;
};

export function estimateRecipeNutrition(
  recipeIngredients: Ingredient[],
  servings: number
): NutritionalInfo | null {
  if (!recipeIngredients || recipeIngredients.length === 0 || servings <= 0) {
    console.warn('Invalid input for nutrition estimation.');
    return null;
  }

  // Initialize aggregated values with all possible nutrient keys from NutritionalInfo
  const initialAggregatedValues: AggregatedNumericValues = {
    calories: 0,
    carbohydrateContent: 0,
    cholesterolContent: 0,
    fatContent: 0,
    fiberContent: 0,
    proteinContent: 0,
    saturatedFatContent: 0,
    sodiumContent: 0,
    sugarContent: 0,
    transFatContent: 0,
    unsaturatedFatContent: 0,
  };

  let ingredientsMatchedCount = 0;

  for (const recipeIng of recipeIngredients) {
    const matchedData = ingredientNutritionData.find(
      entry => entry.name.toLowerCase() === recipeIng.name.toLowerCase()
    );

    if (matchedData) {
      const recipeAmount = parseFloat(recipeIng.amount);
      if (isNaN(recipeAmount) || recipeAmount <= 0) {
        console.warn(`Invalid amount for ingredient ${recipeIng.name}: ${recipeIng.amount}`);
        continue;
      }

      const baseQuantityFromJSON = parseBaseUnitValue(matchedData.baseUnit);
      if (baseQuantityFromJSON === 0) {
        console.warn(`Base quantity is zero for ${matchedData.name}, skipping.`);
        continue;
      }

      const scalingFactor = recipeAmount / baseQuantityFromJSON;

      if (scalingFactor <= 0) continue;
      ingredientsMatchedCount++;

      const nut = matchedData.nutrition;
      if (nut) {
        for (const key in initialAggregatedValues) {
          if (Object.prototype.hasOwnProperty.call(nut, key)) {
            const nutrientKey = key as keyof AggregatedNumericValues;
            const nutrientEntry = nut[nutrientKey] as NutrientValue | undefined;

            if (nutrientEntry && typeof nutrientEntry.value === 'number') {
              if (Object.prototype.hasOwnProperty.call(initialAggregatedValues, nutrientKey)) {
                const currentValue = initialAggregatedValues[nutrientKey];
                if (typeof currentValue === 'number') {
                  initialAggregatedValues[nutrientKey] =
                    currentValue + nutrientEntry.value * scalingFactor;
                }
              }
            }
          }
        }
      }
    } else {
      console.warn(`No nutritional data found for ingredient: ${recipeIng.name}`);
    }
  }

  if (ingredientsMatchedCount === 0) {
    console.warn('No ingredients were matched for nutrition estimation.');
    return null;
  }

  const perServingNutrition: NutritionalInfo = {};
  let hasMeaningfulData = false;

  // Populate perServingNutrition with NutrientValue objects
  for (const key in initialAggregatedValues) {
    const nutrientKey = key as keyof AggregatedNumericValues;
    const totalValue = initialAggregatedValues[nutrientKey];

    if (typeof totalValue === 'number' && !isNaN(totalValue)) {
      const perServingValue = parseFloat((totalValue / servings).toFixed(1));

      // Determine unit (this is simplified, assumes a common unit or infers from key)
      let unit = 'g'; // Default to grams
      if (nutrientKey === 'calories') unit = 'kcal';
      else if (nutrientKey === 'sodiumContent' || nutrientKey === 'cholesterolContent') unit = 'mg';

      if (perServingValue > 0 || nutrientKey === 'calories') {
        perServingNutrition[nutrientKey] = {
          value:
            nutrientKey === 'calories' ||
            nutrientKey === 'sodiumContent' ||
            nutrientKey === 'cholesterolContent'
              ? Math.round(perServingValue)
              : perServingValue,
          unit: unit,
        };
        hasMeaningfulData = true;
      } else if (perServingValue === 0) {
        perServingNutrition[nutrientKey] = { value: 0, unit: unit };
      }
    }
  }

  return hasMeaningfulData ? perServingNutrition : null;
}
