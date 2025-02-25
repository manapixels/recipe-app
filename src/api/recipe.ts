'use server';

import { createClient } from '@/utils/supabase/server';
import { Recipe } from '@/types/recipe';
import { Profile } from '@/types/profile';

const validStatuses = ['draft', 'published', 'archived'];

/**
 * Fetches all recipes and their authors.
 * @returns The recipes data or error.
 */
export const fetchRecipes = async () => {
  const supabase = createClient();
  try {
    let { data } = await supabase
      .from('recipes_with_author_data')
      .select('*')
      .order('created_at', { ascending: false });

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
    let { data } = await supabase
      .from('recipes_with_author_data')
      .select('*')
      .eq('slug', slug)
      .single();

    return data;
  } catch (error) {
    console.log('error', error);
    return error;
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
        author:profiles!user_id(id, username, avatar_url, name)
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
  name: Recipe['name'];
  description: Recipe['description'];
  category: Recipe['category'];
  subcategory: Recipe['subcategory'];
  ingredients: Recipe['ingredients'];
  instructions: Recipe['instructions'];
  total_time: Recipe['total_time'];
  servings: Recipe['servings'];
  difficulty: Recipe['difficulty'];
  created_by: Recipe['created_by'];
  image_thumbnail_url?: Recipe['image_thumbnail_url'];
  image_banner_url?: Recipe['image_banner_url'];
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
  name?: Recipe['name'];
  description?: Recipe['description'];
  category?: Recipe['category'];
  subcategory?: Recipe['subcategory'];
  ingredients?: Recipe['ingredients'];
  instructions?: Recipe['instructions'];
  total_time?: Recipe['total_time'];
  servings?: Recipe['servings'];
  difficulty?: Recipe['difficulty'];
  created_by?: Recipe['created_by'];
  image_thumbnail_url?: Recipe['image_thumbnail_url'];
  image_banner_url?: Recipe['image_banner_url'];
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
