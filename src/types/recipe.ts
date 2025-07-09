import { Tables } from './definitions';

// Recipe status type from SQL enum
export type RecipeStatus = 'draft' | 'published' | 'archived';

// Recipe categories from SQL enum
export type RecipeCategory = 'sweets' | 'breads';

// Recipe subcategories from SQL enum
export type RecipeSubcategory =
  // Sweets subcategories
  | 'cookies'
  | 'muffins.cupcakes'
  | 'roll.cakes'
  | 'tarts'
  | 'pies'
  | 'brownies'
  | 'donuts'
  | 'ice.cream'
  | 'puddings'
  | 'chocolates'
  | 'candies'
  | 'cheesecakes'
  | 'macarons'
  | 'traditional.sweets'
  // Bread subcategories
  | 'sourdough'
  | 'flatbreads'
  | 'sweet.breads'
  | 'buns.rolls'
  | 'bagels'
  | 'croissants'
  | 'baguettes'
  | 'natural-yeast';

// Difficulty levels type (numeric)
export type DifficultyLevel = 1 | 2 | 3;

// Category options for UI
export const CATEGORY_OPTIONS = [
  { value: 'sweets' as const, label: '🍰 Sweets' },
  { value: 'breads' as const, label: '🍞 Breads' },
] as const;

// Subcategory options for UI
export const SUBCATEGORY_OPTIONS = {
  sweets: [
    { value: 'cookies' as const, label: '🍪 Cookies' },
    { value: 'muffins.cupcakes' as const, label: '🧁 Muffins & Cupcakes' },
    { value: 'roll.cakes' as const, label: '🌯 Roll Cakes' },
    { value: 'tarts' as const, label: '🥧 Tarts' },
    { value: 'pies' as const, label: '🥧 Pies' },
    { value: 'brownies' as const, label: '🍫 Brownies' },
    { value: 'donuts' as const, label: '🍩 Donuts' },
    { value: 'ice.cream' as const, label: '🍨 Ice Cream' },
    { value: 'puddings' as const, label: '🍮 Puddings' },
    { value: 'chocolates' as const, label: '🍫 Chocolates' },
    { value: 'candies' as const, label: '🍬 Candies' },
    { value: 'cheesecakes' as const, label: '🍰 Cheesecakes' },
    { value: 'macarons' as const, label: '🍪 Macarons' },
    { value: 'traditional.sweets' as const, label: '🍯 Traditional Sweets' },
  ],
  breads: [
    { value: 'sourdough' as const, label: '🍞 Sourdough' },
    { value: 'flatbreads' as const, label: '🥙 Flatbreads' },
    { value: 'sweet.breads' as const, label: '🥖 Sweet Breads' },
    { value: 'buns.rolls' as const, label: '🥐 Buns & Rolls' },
    { value: 'bagels' as const, label: '🥯 Bagels' },
    { value: 'croissants' as const, label: '🥐 Croissants' },
    { value: 'baguettes' as const, label: '🥖 Baguettes' },
    { value: 'natural-yeast' as const, label: '🌾 Natural Yeast' },
  ],
} as const;

// Helper type to ensure subcategories match their categories
export type CategorySubcategoryMap = {
  sweets: (typeof SUBCATEGORY_OPTIONS.sweets)[number]['value'];
  breads: (typeof SUBCATEGORY_OPTIONS.breads)[number]['value'];
};

// Measurement units
export const MEASUREMENT_UNITS = {
  // Weight
  g: 'g',
  mg: 'mg',
  kg: 'kg',
  // Volume
  ml: 'ml',
  l: 'l',
} as const;

export type MeasurementUnit = keyof typeof MEASUREMENT_UNITS;

// Common ingredients grouped by type
export const COMMON_INGREDIENTS = {
  Flours: [
    'All-Purpose Flour',
    'Bread Flour',
    'Cake Flour',
    'Whole Wheat Flour',
    'Pastry Flour',
    'Rye Flour',
  ],
  Sweeteners: [
    'Granulated Sugar',
    'Brown Sugar',
    'Powdered Sugar',
    'Honey',
    'Maple Syrup',
    'Molasses',
  ],
  Fats: ['Butter', 'Vegetable Oil', 'Olive Oil', 'Coconut Oil', 'Shortening', 'Heavy Cream'],
  Leaveners: ['Active Dry Yeast', 'Instant Yeast', 'Baking Powder', 'Baking Soda'],
  Dairy: ['Whole Milk', 'Buttermilk', 'Heavy Cream', 'Sour Cream', 'Cream Cheese', 'Yogurt'],
  Eggs: ['Whole Eggs', 'Egg Yolks', 'Egg Whites'],
  Flavorings: [
    'Vanilla Extract',
    'Almond Extract',
    'Lemon Zest',
    'Orange Zest',
    'Cinnamon',
    'Nutmeg',
    'Salt',
  ],
  Additions: ['Chocolate Chips', 'Nuts', 'Dried Fruits', 'Fresh Fruits', 'Cocoa Powder'],
} as const;

// Flatten ingredients for easy search
export const ALL_INGREDIENTS = Object.values(COMMON_INGREDIENTS).flat();

// Instruction type
export type Instruction = {
  step: number;
  content: string;
  image_url?: string;
};

// Ingredient type
export type Ingredient = {
  name: string;
  amount: string;
  unit: MeasurementUnit;
  image_url?: string;
  is_flour?: boolean; // For baker's percentage calculations in bread recipes
  from_component?: string; // References another component (e.g., "use all poolish")
};

// Recipe Component type for structured recipes
export type RecipeComponent = {
  id: string; // Unique identifier for the component
  name: string; // Display name (e.g., "Poolish", "Final Dough", "Sauce")
  description?: string; // Optional description of the component
  order: number; // Display order (1, 2, 3...)
  ingredients: Ingredient[];
};

// Value-unit pair for individual nutrient entries
export type NutrientValue = {
  value?: number;
  unit?: string; // e.g., "kcal", "g", "mg"
};

// Nutritional Information type using NutrientValue objects
// Aligned with schema.org concepts but stores numeric values and units separately
export type NutritionalInfo = {
  calories?: NutrientValue;
  carbohydrateContent?: NutrientValue;
  cholesterolContent?: NutrientValue; // Typically mg
  fatContent?: NutrientValue;
  fiberContent?: NutrientValue;
  proteinContent?: NutrientValue;
  saturatedFatContent?: NutrientValue;
  servingSize?: string; // Serving size of the recipe itself, e.g., "1 slice", "2 cookies", "per 100g if recipe is a sauce"
  sodiumContent?: NutrientValue; // Typically mg
  sugarContent?: NutrientValue;
  transFatContent?: NutrientValue;
  unsaturatedFatContent?: NutrientValue;
};

// Recipe interface matching the database schema
export type Recipe = Tables<'recipes'> & {
  components: RecipeComponent[];
  instructions: Instruction[];
  is_favorited?: boolean;
  nutrition_info?: NutritionalInfo; // Added nutritional information
};

// Represents an entry in the user_favorite_recipes table
export interface UserFavoriteRecipe {
  user_id: string; // UUID of the user
  recipe_id: string; // UUID of the recipe
  created_at: string; // ISO 8601 date string
  // Optionally, you might want to include the full recipe details here if you often fetch them together
  // recipe?: Recipe;
}

// Default component templates by category
export const DEFAULT_COMPONENTS: Record<RecipeCategory, RecipeComponent[]> = {
  breads: [
    {
      id: 'main',
      name: 'Main',
      description: 'Primary bread ingredients',
      order: 1,
      ingredients: [
        { name: 'Bread Flour', amount: '500', unit: 'g', is_flour: true },
        { name: 'Active Dry Yeast', amount: '7', unit: 'g', is_flour: false },
        { name: 'Salt', amount: '10', unit: 'g', is_flour: false },
        { name: 'Granulated Sugar', amount: '15', unit: 'g', is_flour: false },
        { name: 'Water', amount: '350', unit: 'ml', is_flour: false },
      ],
    },
  ],
  sweets: [
    {
      id: 'main',
      name: 'Main',
      description: 'Primary dessert ingredients',
      order: 1,
      ingredients: [
        { name: 'All-Purpose Flour', amount: '250', unit: 'g', is_flour: false },
        { name: 'Granulated Sugar', amount: '200', unit: 'g', is_flour: false },
        { name: 'Butter', amount: '115', unit: 'g', is_flour: false },
        { name: 'Whole Eggs', amount: '50', unit: 'g', is_flour: false },
        { name: 'Vanilla Extract', amount: '1', unit: 'g', is_flour: false },
      ],
    },
  ],
} as const;

// Helper function to get all ingredients from all components
export const getAllIngredientsFromComponents = (components: RecipeComponent[]): Ingredient[] => {
  return components.flatMap(component => component.ingredients);
};

// Helper function to get all flour ingredients from all components
export const getFlourIngredientsFromComponents = (components: RecipeComponent[]): Ingredient[] => {
  return getAllIngredientsFromComponents(components).filter(ing => ing.is_flour === true);
};
