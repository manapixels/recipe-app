'use server';

import { createClient } from '@/utils/supabase/server';
import {
  RecipeRating,
  RecipeRatingStats,
  CreateRatingParams,
  UpdateRatingParams,
} from '@/types/rating';

/**
 * Create a new rating for a recipe
 */
export async function createRating(params: CreateRatingParams): Promise<RecipeRating | Error> {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Error('Authentication required');
    }

    const { data, error } = await supabase
      .from('recipe_ratings')
      .insert({
        recipe_id: params.recipe_id,
        user_id: user.id,
        rating: params.rating,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating rating:', error);
      return error;
    }

    return data;
  } catch (error) {
    console.error('Error creating rating:', error);
    return error as Error;
  }
}

/**
 * Update an existing rating
 */
export async function updateRating(
  ratingId: string,
  params: UpdateRatingParams
): Promise<RecipeRating | Error> {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Error('Authentication required');
    }

    const { data, error } = await supabase
      .from('recipe_ratings')
      .update({
        rating: params.rating,
      })
      .eq('id', ratingId)
      .eq('user_id', user.id) // Ensure user can only update their own rating
      .select()
      .single();

    if (error) {
      console.error('Error updating rating:', error);
      return error;
    }

    return data;
  } catch (error) {
    console.error('Error updating rating:', error);
    return error as Error;
  }
}

/**
 * Delete a rating
 */
export async function deleteRating(ratingId: string): Promise<boolean | Error> {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Error('Authentication required');
    }

    const { error } = await supabase
      .from('recipe_ratings')
      .delete()
      .eq('id', ratingId)
      .eq('user_id', user.id); // Ensure user can only delete their own rating

    if (error) {
      console.error('Error deleting rating:', error);
      return error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting rating:', error);
    return error as Error;
  }
}

/**
 * Get user's rating for a specific recipe
 */
export async function getUserRating(recipeId: string): Promise<RecipeRating | null | Error> {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return null; // Not authenticated, no rating
    }

    const { data, error } = await supabase
      .from('recipe_ratings')
      .select('*')
      .eq('recipe_id', recipeId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rating found
      }
      console.error('Error fetching user rating:', error);
      return error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user rating:', error);
    return error as Error;
  }
}

/**
 * Get rating statistics for a recipe
 */
export async function getRecipeRatingStats(
  recipeId: string
): Promise<RecipeRatingStats | null | Error> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('recipe_ratings_stats')
      .select('*')
      .eq('id', recipeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No stats found
      }
      console.error('Error fetching recipe rating stats:', error);
      return error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching recipe rating stats:', error);
    return error as Error;
  }
}

/**
 * Get all ratings for a recipe
 */
export async function getRecipeRatings(recipeId: string): Promise<RecipeRating[] | Error> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('recipe_ratings')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recipe ratings:', error);
      return error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching recipe ratings:', error);
    return error as Error;
  }
}

/**
 * Get rating statistics for multiple recipes
 */
export async function getMultipleRecipeRatingStats(
  recipeIds: string[]
): Promise<RecipeRatingStats[] | Error> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('recipe_ratings_stats')
      .select('*')
      .in('id', recipeIds);

    if (error) {
      console.error('Error fetching multiple recipe rating stats:', error);
      return error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching multiple recipe rating stats:', error);
    return error as Error;
  }
}

/**
 * Submit or update a rating for a recipe
 * This is a convenience function that handles both create and update
 */
export async function submitRating(
  recipeId: string,
  rating: number
): Promise<RecipeRating | Error> {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Error('Authentication required');
    }

    // Check if user already has a rating for this recipe
    const existingRating = await getUserRating(recipeId);

    if (existingRating instanceof Error) {
      return existingRating;
    }

    if (existingRating) {
      // Update existing rating
      return await updateRating(existingRating.id, { rating });
    } else {
      // Create new rating
      return await createRating({ recipe_id: recipeId, rating });
    }
  } catch (error) {
    console.error('Error submitting rating:', error);
    return error as Error;
  }
}
