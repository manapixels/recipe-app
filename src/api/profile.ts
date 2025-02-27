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
    let { data } = await supabase.from('profiles').select(`*`).eq('id', userId).single();

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
        recipes_created:recipes(*)
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

    return data as ProfileWithRecipes;
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
