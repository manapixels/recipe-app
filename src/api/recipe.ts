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
        author:profiles!recipes_created_by_fkey(id, username, avatar_url, name)
      `
    );

    // Only fetch recipes that are explicitly 'published' for public viewing
    query = query.eq('status', 'published');

    // Apply additional optional filters
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
 * Fetches a recipe by its slug and checks if it's favorited by the current user.
 * @param {string} slug - The slug of the recipe.
 * @returns The recipe data (with is_favorited flag) or null/error.
 */
export const fetchRecipe = async (slug: string) => {
  const supabase = createClient();
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

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

    // Type assertion for rawData to include potential ingredients/instructions as unknown
    const dbRecord = rawData as Omit<
      FullRecipeType,
      'ingredients' | 'instructions' | 'is_favorited'
    > & {
      ingredients: unknown;
      instructions: unknown;
    };

    let ingredients: Ingredient[] = [];
    let instructions: Instruction[] = [];

    // Parse ingredients
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

    // Parse instructions
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

    let isFavorited = false;
    if (authUser && rawData.id) {
      const { data: favoriteData, error: favoriteError } = await supabase
        .from('user_favorite_recipes')
        .select('recipe_id')
        .match({ user_id: authUser.id, recipe_id: rawData.id })
        .maybeSingle(); // Use maybeSingle to handle no favorite found without error

      if (favoriteError) {
        console.error('Error checking favorite status:', favoriteError);
        // Decide if this error should prevent recipe load or just default is_favorited to false
      }
      if (favoriteData) {
        isFavorited = true;
      }
    }

    const finalRecipe: FullRecipeType = {
      ...(dbRecord as FullRecipeType), // Cast after parsing, ensure all fields match FullRecipeType
      ingredients,
      instructions,
      is_favorited: isFavorited,
    };

    return finalRecipe;
  } catch (error) {
    console.log('error fetching or parsing recipe', error);
    return null; // Or re-throw, depending on desired top-level error handling
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
        author:profiles!recipes_created_by_fkey(id, username, avatar_url, name)
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
  status,
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
  status?: FullRecipeType['status'];
}) => {
  const supabase = createClient();
  try {
    const recipeDataToInsert = {
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
      status: status || 'published',
    };

    let { data, error } = await supabase.from('recipes').insert([recipeDataToInsert]).select();

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
  image_thumbnail_url,
  image_banner_url,
  status,
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
  image_thumbnail_url?: FullRecipeType['image_thumbnail_url'];
  image_banner_url?: FullRecipeType['image_banner_url'];
  status?: FullRecipeType['status'];
}) => {
  const supabase = createClient();
  try {
    const recipeDataToUpdate: any = {};
    if (name !== undefined) recipeDataToUpdate.name = name;
    if (description !== undefined) recipeDataToUpdate.description = description;
    if (category !== undefined) recipeDataToUpdate.category = category;
    if (subcategory !== undefined) recipeDataToUpdate.subcategory = subcategory;
    if (ingredients !== undefined) recipeDataToUpdate.ingredients = ingredients;
    if (instructions !== undefined) recipeDataToUpdate.instructions = instructions;
    if (total_time !== undefined) recipeDataToUpdate.total_time = total_time;
    if (servings !== undefined) recipeDataToUpdate.servings = servings;
    if (difficulty !== undefined) recipeDataToUpdate.difficulty = difficulty;
    if (image_thumbnail_url !== undefined)
      recipeDataToUpdate.image_thumbnail_url = image_thumbnail_url;
    if (image_banner_url !== undefined) recipeDataToUpdate.image_banner_url = image_banner_url;
    if (status !== undefined) recipeDataToUpdate.status = status;

    if (Object.keys(recipeDataToUpdate).length === 0) {
      // Optionally, fetch and return the existing record if nothing changed,
      // or throw an error, or return a specific message.
      // For now, let's just proceed, Supabase might handle it or return the existing.
    }

    const { data, error } = await supabase
      .from('recipes')
      .update(recipeDataToUpdate)
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

/**
 * Adds a recipe to the current user's favorites.
 * @param recipeId The ID of the recipe to favorite.
 * @returns The created favorite record or an error.
 */
export const addFavoriteRecipe = async (recipeId: string) => {
  const supabase = createClient();
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User not authenticated', userError);
      return new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_favorite_recipes')
      .insert({ user_id: user.id, recipe_id: recipeId })
      .select()
      .single(); // Assuming you want the created record back

    if (error) {
      console.error('Error favoriting recipe:', error);
      // Handle potential conflict (already favorited) gracefully if needed
      if (error.code === '23505') {
        // Unique violation
        return new Error('Recipe already favorited');
      }
      return error;
    }
    return data;
  } catch (error) {
    console.error('Unexpected error favoriting recipe:', error);
    return new Error('Unexpected error favoriting recipe');
  }
};

/**
 * Removes a recipe from the current user's favorites.
 * @param recipeId The ID of the recipe to unfavorite.
 * @returns True if successful, or an error.
 */
export const removeFavoriteRecipe = async (recipeId: string) => {
  const supabase = createClient();
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User not authenticated', userError);
      return new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('user_favorite_recipes')
      .delete()
      .match({ user_id: user.id, recipe_id: recipeId });

    if (error) {
      console.error('Error unfavoriting recipe:', error);
      return error;
    }
    return true;
  } catch (error) {
    console.error('Unexpected error unfavoriting recipe:', error);
    return new Error('Unexpected error unfavoriting recipe');
  }
};

/**
 * Fetches all recipes favorited by a specific user.
 * @param userId The ID of the user whose favorite recipes to fetch.
 * @returns An array of favorite recipes or an error.
 */
export const fetchUserFavoriteRecipes = async (userId: string) => {
  const supabase = createClient();
  try {
    const { data: userFavorites, error } = await supabase
      .from('user_favorite_recipes')
      .select(
        `
        created_at,
        recipe_id, 
        user_id,
        recipes ( 
          *,
          author:profiles!recipes_created_by_fkey(id, username, avatar_url, name) 
        )
      `
      )
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user favorite recipes:', error);
      return { data: [], error };
    }

    if (!userFavorites) {
      return { data: [], error: null };
    }

    // Correctly type the transformation
    const favoritesWithRecipeDetails = userFavorites.map(fav => ({
      created_at: fav.created_at as string, // Assuming created_at is always a string
      // The 'recipes' field from the join will be an object if the recipe exists, or null.
      // Cast to unknown first, then to the specific type to satisfy TypeScript when inference is tricky.
      recipes: fav.recipes as unknown as FullRecipeType | null,
      recipe_id: fav.recipe_id as string,
      user_id: fav.user_id as string,
    }));

    // console.log('favoritesWithRecipeDetails', favoritesWithRecipeDetails);

    return { data: favoritesWithRecipeDetails, error: null };
  } catch (err) {
    console.error('Unexpected error in fetchUserFavoriteRecipes:', err);
    return { data: [], error: err instanceof Error ? err : new Error('Unknown error') };
  }
};
