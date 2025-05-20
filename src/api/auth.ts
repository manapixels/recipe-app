'use server';

import { createClient } from '../utils/supabase/server';

/**
 * Signs up a new user with email and password.
 * @param {string} email - The email of the new user.
 * @param {string} password - The password for the new user.
 * @returns The data or error from the signUp operation.
 */
export const signUpNewUser = async (email, password) => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: '/recipes',
    },
  });
  if (error)
    return {
      message: error.message,
      status: error.status || 500,
    };
  return data;
};

/**
 * Signs in a user with email and password.
 * @param {string} email - The email of the user.
 * @param {string} password - The password for the user.
 * @returns A boolean indicating success.
 */
export const signInWithEmail = async (email, password) => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      message: error.message,
      status: error.status || 500,
    };
  }
  return data;
};

/**
 * Signs out the current user.
 * @returns A boolean indicating success or the error if failed.
 */
export const signOut = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return error;
  }
  return true;
};

/**
 * Updates the email of the current user.
 * @param {string} email - The new email to update to.
 * @returns The updated user data or error.
 */
export const updateEmail = async (email: string) => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.updateUser({
    email,
  });
  if (error)
    return {
      message: error.message,
      status: error.status || 500,
    };
  return data;
};

/**
 * Updates the password of the current user.
 * @param {string} password - The new password to update to.
 * @returns The updated user data or error.
 */
export const updatePassword = async (password: string) => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.updateUser({
    password,
  });
  if (error)
    return {
      message: error.message,
      status: error.status || 500,
    };
  return data;
};
