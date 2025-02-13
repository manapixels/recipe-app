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

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  1: 'Easy',
  2: 'Medium',
  3: 'Advanced',
} as const;

export type DifficultyLevel = keyof typeof DIFFICULTY_LEVELS;

// Category options for UI
export const CATEGORY_OPTIONS = [
  { value: 'sweets' as const, label: 'Sweets' },
  { value: 'breads' as const, label: 'Breads' },
] as const;

// Subcategory options for UI
export const SUBCATEGORY_OPTIONS = {
  sweets: [
    { value: 'cookies' as const, label: 'Cookies' },
    { value: 'muffins.cupcakes' as const, label: 'Muffins & Cupcakes' },
    { value: 'roll.cakes' as const, label: 'Roll Cakes' },
    { value: 'tarts' as const, label: 'Tarts' },
    { value: 'pies' as const, label: 'Pies' },
    { value: 'brownies' as const, label: 'Brownies' },
    { value: 'donuts' as const, label: 'Donuts' },
    { value: 'ice.cream' as const, label: 'Ice Cream' },
    { value: 'puddings' as const, label: 'Puddings' },
    { value: 'chocolates' as const, label: 'Chocolates' },
    { value: 'candies' as const, label: 'Candies' },
    { value: 'cheesecakes' as const, label: 'Cheesecakes' },
    { value: 'macarons' as const, label: 'Macarons' },
    { value: 'traditional.sweets' as const, label: 'Traditional Sweets' },
  ],
  breads: [
    { value: 'sourdough' as const, label: 'Sourdough' },
    { value: 'flatbreads' as const, label: 'Flatbreads' },
    { value: 'sweet.breads' as const, label: 'Sweet Breads' },
    { value: 'buns.rolls' as const, label: 'Buns & Rolls' },
    { value: 'bagels' as const, label: 'Bagels' },
    { value: 'croissants' as const, label: 'Croissants' },
    { value: 'baguettes' as const, label: 'Baguettes' },
    { value: 'natural-yeast' as const, label: 'Natural Yeast' },
  ],
} as const;

// Helper type to ensure subcategories match their categories
export type CategorySubcategoryMap = {
  sweets: (typeof SUBCATEGORY_OPTIONS.sweets)[number]['value'];
  breads: (typeof SUBCATEGORY_OPTIONS.breads)[number]['value'];
};

// Recipe interface matching the database schema
export interface Recipe {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  description: string;
  category: RecipeCategory;
  subcategory: RecipeSubcategory;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: DifficultyLevel;
  status: RecipeStatus;
  created_by: string;
  image_thumbnail_url?: string;
  image_banner_url?: string;
  metadata?: Record<string, unknown>;
}
