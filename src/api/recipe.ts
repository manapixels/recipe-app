'use server';

import { createClient } from '@/utils/supabase/server';
import {
  Recipe as FullRecipeType,
  Ingredient,
  Instruction,
  RecipeCategory,
  RecipeSubcategory,
  DifficultyLevel,
  NutritionalInfo,
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

    // Fetch the recipe by slug - no status filter here initially
    let { data: rawData, error: fetchError } = await supabase
      .from('recipes')
      .select(
        `
        *,
        author:profiles!recipes_created_by_fkey(id, username, avatar_url, name) 
      `
      ) // Added join hint for author
      .eq('slug', slug)
      .single();

    if (fetchError) {
      console.log('Error fetching recipe by slug:', fetchError);
      return null;
    }

    if (!rawData) {
      return null; // Recipe not found by slug
    }

    // Check if the recipe is viewable by the current user
    const recipeIsPublished = rawData.status === 'published';
    const isOwner = authUser && rawData.created_by === authUser.id;

    if (!recipeIsPublished && !isOwner) {
      // Non-owner trying to access a non-published recipe
      console.log(
        `Access denied: User ${authUser?.id} trying to access non-published recipe ${rawData.id} by ${rawData.created_by}`
      );
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
  nutrition_info,
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
  nutrition_info?: NutritionalInfo;
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
      difficulty: Number(difficulty) as DifficultyLevel,
      created_by,
      image_thumbnail_url,
      image_banner_url: image_banner_url || null,
      status: status || 'draft',
      nutrition_info: nutrition_info || null,
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
  nutrition_info,
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
  nutrition_info?: NutritionalInfo;
}) => {
  const supabase = createClient();
  try {
    if (status && !validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of ${validStatuses.join(', ')}.`);
    }

    const updateData: Partial<FullRecipeType> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (ingredients !== undefined) updateData.ingredients = ingredients;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (total_time !== undefined) updateData.total_time = Number(total_time);
    if (servings !== undefined) updateData.servings = Number(servings);
    if (difficulty !== undefined) updateData.difficulty = Number(difficulty) as DifficultyLevel;
    if (image_thumbnail_url !== undefined) updateData.image_thumbnail_url = image_thumbnail_url;
    if (image_banner_url !== undefined) updateData.image_banner_url = image_banner_url;
    if (status !== undefined) updateData.status = status;
    if (nutrition_info !== undefined) updateData.nutrition_info = nutrition_info;

    // Prevent updating created_by and created_at
    delete updateData.created_by;

    const { data, error } = await supabase
      .from('recipes')
      .update(updateData)
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
      console.error('Error fetching user or user not logged in:', userError);
      return { error: userError || new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('user_favorite_recipes')
      .insert([{ user_id: user.id, recipe_id: recipeId }])
      .select(); // Optionally select to confirm insertion

    if (error) {
      console.error('Error adding favorite recipe:', error);
      // Check for unique constraint violation (already favorited)
      if (error.code === '23505') {
        // PostgreSQL unique_violation error code
        return { error: new Error('Recipe already favorited.') };
      }
      return { error };
    }

    return { data };
  } catch (error) {
    console.error('Unexpected error in addFavoriteRecipe:', error);
    return { error: error instanceof Error ? error : new Error('Unexpected error occurred') };
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
      console.error('Error fetching user or user not logged in:', userError);
      return { error: userError || new Error('User not authenticated') };
    }

    const { error } = await supabase
      .from('user_favorite_recipes')
      .delete()
      .match({ user_id: user.id, recipe_id: recipeId });

    if (error) {
      console.error('Error removing favorite recipe:', error);
      return { error };
    }

    // Check if any row was actually deleted, data will be null or an empty array if no match was found
    // Supabase delete doesn't typically return the deleted rows unless you .select() before/after or use returning
    // For this use case, success is simply no error and the command executing.
    // If you need to confirm a row was deleted, you might check `status` or `count` from the response if available and non-null.
    return { data: { success: true } }; // Indicate success
  } catch (error) {
    console.error('Unexpected error in removeFavoriteRecipe:', error);
    return { error: error instanceof Error ? error : new Error('Unexpected error occurred') };
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
    if (!userId) {
      console.error('User ID is required to fetch favorite recipes.');
      return { error: new Error('User ID is required.') };
    }

    // Fetch recipe IDs favorited by the user
    const { data: favoriteEntries, error: favoritesError } = await supabase
      .from('user_favorite_recipes')
      .select('recipe_id')
      .eq('user_id', userId);

    if (favoritesError) {
      console.error('Error fetching user favorite entries:', favoritesError);
      return { error: favoritesError };
    }

    if (!favoriteEntries || favoriteEntries.length === 0) {
      return { data: [] }; // No favorites found
    }

    const recipeIds = favoriteEntries.map(fav => fav.recipe_id);

    // Fetch the actual recipe details for the favorited recipe IDs
    // We will also fetch author information similar to how `fetchRecipes` does.
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes') // Consider using 'recipes_with_author_data' if it simplifies and status is handled
      .select(
        `
        *,
        author:profiles!recipes_created_by_fkey(id, username, avatar_url, name)
      `
      )
      .in('id', recipeIds)
      .eq('status', 'published'); // Ensure only published recipes are fetched, or adjust as needed

    if (recipesError) {
      console.error('Error fetching favorite recipes details:', recipesError);
      return { error: recipesError };
    }

    // It might be beneficial to parse ingredients and instructions here as well,
    // similar to how it's done in `fetchRecipe`, if the components consuming this data expect it.
    // For now, returning them as is.
    return { data: recipes || [] };
  } catch (error) {
    console.error('Unexpected error in fetchUserFavoriteRecipes:', error);
    return { error: error instanceof Error ? error : new Error('Unexpected error occurred') };
  }
};
