'use server';

import { createClient } from '@/utils/supabase/server';
import { Profile, ProfileWithRecipes } from '@/types/profile';

/**
 * Fetches a single user profile by user ID.
 * @param {number} userId - The ID of the user.
 * @returns The user profile data or error.
 */
export const fetchUserProfile = async userId => {
  const supabase = createClient();
  try {
    let { data } = await supabase
      .from('profiles')
      .select(`*, preferred_unit_system`)
      .eq('id', userId)
      .single();

    return data as Profile;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

/**
 * Fetches a profile with their recipes by username or userId.
 * @param {string} username - The username of the profile.
 * @param {string} userId - The user ID of the profile.
 * @returns The profile data with recipes or null if an error occurs.
 */
export const fetchUserProfileWithRecipes = async ({
  username,
  userId,
}: {
  username?: string;
  userId?: string;
}) => {
  const supabase = createClient();
  try {
    let query = supabase.from('profiles').select(`
        *,
        recipes_created:recipes!recipes_created_by_fkey(*, author:profiles!recipes_created_by_fkey(id, username, avatar_url, name), is_favorited),
        user_favorite_recipes ( 
          created_at, 
          recipe_id, 
          recipes ( 
            *,
            author:profiles!recipes_created_by_fkey(id, username, avatar_url, name),
            is_favorited 
          )
        )
      `);

    if (username) {
      query = query.eq('username', username);
    } else if (userId) {
      query = query.eq('id', userId);
    } else {
      throw new Error('Both username and userId are undefined');
    }

    const { data: authUser } = await supabase.auth.getUser(); // Get current user for is_favorited logic

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching profile with recipes:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    // Function to check if a recipe is favorited by the current authUser
    // This might be redundant if we can rely on the join, but good for explicit marking
    const checkIsFavorited = async (recipeId: string) => {
      if (!authUser?.user) return false;
      const { data: fav, error: favError } = await supabase
        .from('user_favorite_recipes')
        .select('recipe_id')
        .match({ user_id: authUser.user.id, recipe_id: recipeId })
        .maybeSingle();
      if (favError) {
        console.error('Error checking if recipe is favorited:', favError);
        return false;
      }
      return !!fav;
    };

    const createdRecipes = data.recipes_created
      ? await Promise.all(
          data.recipes_created.map(async (recipe: any) => ({
            ...recipe,
            is_favorited:
              recipe.is_favorited !== undefined
                ? recipe.is_favorited
                : await checkIsFavorited(recipe.id),
          }))
        )
      : [];

    const favoriteRecipesFromDb = data.user_favorite_recipes
      ? data.user_favorite_recipes
          .map((fav: any) => fav.recipes) // Extract the recipe object
          .filter(Boolean) // Filter out any null/undefined recipes
          .map((recipe: any) => ({ ...recipe, is_favorited: true })) // Mark all as favorited
      : [];

    const transformedData: ProfileWithRecipes = {
      ...(data as any), // Cast to any to avoid type issues with intermediate structure
      recipes_created: createdRecipes,
      favorite_recipes: favoriteRecipesFromDb,
    };

    return transformedData;
  } catch (error) {
    console.error('fetchUserProfileWithRecipes error:', error);
    return null;
  }
};

/**
 * Updates a user profile.
 * @param {Profile} profileData - The user profile data to update.
 * @returns The updated user profile data or an error object.
 */
export const updateUserProfile = async (profileData: Profile) => {
  const supabase = createClient();
  try {
    if (!profileData.id) {
      // Return a plain error object for client components
      return {
        error: true,
        message: 'Profile ID is required for an update.',
        name: 'ValidationError',
      };
    }

    // Separate preferred_unit_system for clarity, though it's part of profileData
    const { id, preferred_unit_system, ...otherProfileData } = profileData;

    const updatePayload: Partial<Profile> & { updated_at: string; id: string } = {
      id,
      ...otherProfileData,
      updated_at: new Date().toISOString(),
    };

    // Only include preferred_unit_system in the payload if it's explicitly passed
    // This allows clearing it by passing null, or leaving it unchanged by not passing it in profileData
    // However, our current UserContext always sends it.
    if (profileData.hasOwnProperty('preferred_unit_system')) {
      updatePayload.preferred_unit_system = preferred_unit_system;
    }

    const { data: updatedProfile, error: dbError } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (dbError) {
      console.error('Error updating profile in DB:', dbError);
      // Return a plain error object using PostgrestError properties
      return {
        error: true,
        message: dbError.message,
        name: 'DatabaseError',
        code: dbError.code,
        details: dbError.details,
        hint: dbError.hint,
      };
    }

    // If you also store preferred_unit_system in auth.users.user_metadata, update it here.
    // Otherwise, this part might be unnecessary for just this preference.
    if (profileData.hasOwnProperty('preferred_unit_system')) {
      const { error: authUserError } = await supabase.auth.updateUser({
        data: { preferred_unit_system: profileData.preferred_unit_system },
      });
      if (authUserError) {
        console.warn('Error updating user metadata in auth:', authUserError);
        // This is a warning, so we don't return an error object here,
        // the main operation (profile update) succeeded.
      }
    }

    return updatedProfile as Profile; // Success case
  } catch (error: any) {
    console.error('updateUserProfile service error:', error);
    // Return a plain error object for client components
    return {
      error: true,
      message: error.message || 'An unknown error occurred',
      name: error.name || 'ServiceError',
    };
  }
};
