'use server';

import { createClient } from '@/utils/supabase/server';
import {
  Recipe as FullRecipeType,
  Ingredient,
  Instruction,
  RecipeCategory,
  RecipeSubcategory,
  DifficultyLevel,
} from '@/types/recipe';
import { Profile } from '@/types/profile';

const validStatuses = ['draft', 'published', 'archived'];

export interface FetchRecipesParams {
  category?: RecipeCategory;
  subcategory?: RecipeSubcategory;
  difficulty?: DifficultyLevel;
  sortBy?: 'created_at' | 'name' | 'total_time'; // Add more as needed, e.g., 'rating', 'popularity'
  sortDirection?: 'asc' | 'desc';
}

/**
 * Fetches all recipes and their authors, with optional filtering and sorting.
 * @param params - Optional parameters for filtering and sorting.
 * @returns The recipes data or error.
 */
export const fetchRecipes = async (params?: FetchRecipesParams) => {
  const supabase = createClient();
  try {
    let query = supabase.from('recipes').select(
      `
        *,
        author:profiles(id, username, avatar_url, name)
      `
    );

    // Apply filters
    if (params?.category) {
      query = query.eq('category', params.category);
    }
    if (params?.subcategory) {
      query = query.eq('subcategory', params.subcategory);
    }
    if (params?.difficulty) {
      query = query.eq('difficulty', params.difficulty);
    }

    // Apply sorting
    const sortBy = params?.sortBy || 'created_at';
    const sortDirection = params?.sortDirection || 'desc';
    query = query.order(sortBy, { ascending: sortDirection === 'asc' });

    const { data, error } = await query;

    if (error) {
      console.log('error fetching recipes:', error);
      return error; // Or throw error, depending on desired error handling
    }

    return data;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

/**
 * Fetches a recipe by its slug.
 * @param {string} slug - The slug of the recipe.
 * @returns The recipe data or error.
 */
export const fetchRecipe = async (slug: string) => {
  const supabase = createClient();
  try {
    let { data: rawData, error: fetchError } = await supabase
      .from('recipes')
      .select(
        `
        *,
        author:profiles(id, username, avatar_url, name)
      `
      )
      .eq('slug', slug)
      .single();

    if (fetchError) {
      console.log('Error fetching recipe by slug:', fetchError);
      return null;
    }

    if (!rawData) {
      return null;
    }

    const dbRecord = rawData as Omit<FullRecipeType, 'ingredients' | 'instructions'> & {
      ingredients: unknown;
      instructions: unknown;
    };

    let ingredients: Ingredient[] = [];
    let instructions: Instruction[] = [];

    try {
      if (dbRecord.ingredients) {
        if (typeof dbRecord.ingredients === 'string') {
          ingredients = JSON.parse(dbRecord.ingredients) as Ingredient[];
        } else if (Array.isArray(dbRecord.ingredients)) {
          ingredients = dbRecord.ingredients as Ingredient[];
        } else {
          console.warn('Ingredients field is not a string or array:', dbRecord.ingredients);
        }
      }
    } catch (e) {
      console.error('Error parsing ingredients JSON:', e);
    }

    try {
      if (dbRecord.instructions) {
        if (typeof dbRecord.instructions === 'string') {
          instructions = JSON.parse(dbRecord.instructions) as Instruction[];
        } else if (Array.isArray(dbRecord.instructions)) {
          instructions = dbRecord.instructions as Instruction[];
        } else {
          console.warn('Instructions field is not a string or array:', dbRecord.instructions);
        }
      }
    } catch (e) {
      console.error('Error parsing instructions JSON:', e);
    }

    const finalRecipe: FullRecipeType = {
      ...(dbRecord as FullRecipeType),
      ingredients,
      instructions,
    };

    return finalRecipe;
  } catch (error) {
    console.log('error fetching or parsing recipe', error);
    return null;
  }
};

/**
 * Fetches all recipes created by a profile.
 * @param {string} profile_id - The ID of the profile.
 * @returns The recipes data or error.
 */
export const fetchUserRecipes = async (profile_id: string) => {
  const supabase = createClient();
  try {
    const { data } = await supabase
      .from('recipes')
      .select(
        `
        *,
        author:profiles(id, username, avatar_url, name)
      `
      )
      .eq('created_by', profile_id);

    return data;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

/**
 * Adds a new recipe to the database.
 * @param {Object} recipeDetails - The details of the recipe to add.
 * @returns The inserted recipe data or error.
 */
export const addRecipe = async ({
  name,
  description,
  category,
  subcategory,
  ingredients,
  instructions,
  total_time,
  servings,
  difficulty,
  created_by,
  image_thumbnail_url,
  image_banner_url,
}: {
  name: FullRecipeType['name'];
  description: FullRecipeType['description'];
  category: FullRecipeType['category'];
  subcategory: FullRecipeType['subcategory'];
  ingredients: FullRecipeType['ingredients'];
  instructions: FullRecipeType['instructions'];
  total_time: FullRecipeType['total_time'];
  servings: FullRecipeType['servings'];
  difficulty: FullRecipeType['difficulty'];
  created_by: FullRecipeType['created_by'];
  image_thumbnail_url?: FullRecipeType['image_thumbnail_url'];
  image_banner_url?: FullRecipeType['image_banner_url'];
}) => {
  const supabase = createClient();
  try {
    let { data, error } = await supabase
      .from('recipes')
      .insert([
        {
          name,
          description,
          category,
          subcategory,
          ingredients,
          instructions,
          total_time,
          servings,
          difficulty,
          created_by,
          image_thumbnail_url,
          image_banner_url,
        },
      ])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

/**
 * Updates an existing recipe in the database.
 * @param {object} recipeDetails - The details of the recipe to update.
 * @returns The updated recipe data or error.
 */
export const updateRecipe = async ({
  id,
  name,
  description,
  category,
  subcategory,
  ingredients,
  instructions,
  total_time,
  servings,
  difficulty,
  created_by,
  image_thumbnail_url,
  image_banner_url,
}: {
  id: string;
  name?: FullRecipeType['name'];
  description?: FullRecipeType['description'];
  category?: FullRecipeType['category'];
  subcategory?: FullRecipeType['subcategory'];
  ingredients?: FullRecipeType['ingredients'];
  instructions?: FullRecipeType['instructions'];
  total_time?: FullRecipeType['total_time'];
  servings?: FullRecipeType['servings'];
  difficulty?: FullRecipeType['difficulty'];
  created_by?: FullRecipeType['created_by'];
  image_thumbnail_url?: FullRecipeType['image_thumbnail_url'];
  image_banner_url?: FullRecipeType['image_banner_url'];
}) => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('recipes')
      .update({
        name,
        description,
        category,
        subcategory,
        ingredients,
        instructions,
        total_time,
        servings,
        difficulty,
        created_by,
        image_thumbnail_url,
        image_banner_url,
      })
      .match({ id })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

/**
 * Updates the status of a recipe.
 * @param {string} recipe_id - The ID of the recipe to update.
 * @param {string} new_status - The new status to set for the recipe.
 * @returns The updated recipe data or an error if the update fails.
 */
export const updateRecipeStatus = async (recipe_id: string, new_status: string) => {
  if (!validStatuses.includes(new_status)) {
    throw new Error('Invalid status value');
  }

  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('recipes')
      .update({ status: new_status })
      .match({ id: recipe_id })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating recipe status:', error);
    return error;
  }
};

/**
 * Deletes a recipe from the database.
 * @param {string} recipe_id - The ID of the recipe to delete.
 * @returns The deleted recipe data or error.
 */
export const deleteRecipe = async (recipe_id: string) => {
  const supabase = createClient();
  try {
    let { data } = await supabase.from('recipes').delete().match({ id: recipe_id });
    return data;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

/**
 * Posts a recipe to social media platforms.
 * @param {string} recipe_id - The ID of the recipe to share.
 * @param {Profile} profile - The profile of the user sharing the recipe.
 * @returns Success or error response.
 */
export const postRecipeToSocial = async (recipe_id: string, profile: Profile) => {
  try {
    // TODO: Implement actual social media sharing logic
    // This is a placeholder that simulates a successful share
    console.log('Recipe shared successfully', recipe_id, profile);
    return { success: true };
  } catch (error) {
    console.error('Error sharing recipe:', error);
    throw error;
  }
};
