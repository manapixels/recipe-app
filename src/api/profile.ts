'use server';

import { createClient } from '@/utils/supabase/server';
import { Profile, ProfileWithRoles, ProfileWithRecipes } from '@/types/profile';

/**
 * Fetches a single user profile by user ID.
 * @param {number} userId - The ID of the user.
 * @returns The user profile data or error.
 */
export const fetchUserProfile = async userId => {
  const supabase = createClient();
  try {
    let { data } = await supabase.from('profiles_with_roles').select(`*`).eq('id', userId).single();

    return data as ProfileWithRoles;
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
        recipes_created:recipes(*),
        user_roles:user_roles(role)
      `);

    if (username) {
      query = query.eq('username', username);
    } else if (userId) {
      query = query.eq('id', userId);
    } else {
      throw new Error('Both username and userId are undefined');
    }

    const { data, error } = await query.single();

    if (error) throw new Error('Error fetching profile with recipes');

    // Transform user_roles array to match the expected format
    const transformedData = {
      ...data,
      user_roles: data.user_roles?.map((r: { role: string }) => r.role),
    };

    return transformedData as ProfileWithRecipes;
  } catch (error) {
    console.error('error', error);
    return null;
  }
};

/**
 * Updates a user profile.
 * @param {Profile} user - The user profile data to update.
 * @returns The updated user data or error.
 */
export const updateUserProfile = async (user: Profile) => {
  const supabase = createClient();
  try {
    await supabase.from('profiles').upsert({
      ...user,
      updated_at: new Date().toISOString(),
    });
    const { data } = await supabase.auth.updateUser({
      data: user,
    });
    return data;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

/**
 * Fetches all roles for the current user.
 * @param {function} setState - Optionally pass in a hook or callback to set the state.
 * @returns The roles data or error.
 */
export const fetchUserRoles = async setState => {
  const supabase = createClient();
  try {
    let { data } = await supabase.from('user_roles').select(`*`);
    if (setState) setState(data);
    return data;
  } catch (error) {
    console.log('error', error);
    return error;
  }
};
