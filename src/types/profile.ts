import { User } from '@supabase/supabase-js';
import { Tables } from '@/types/definitions';
import { Recipe } from '@/types/recipe';

// Permission types from SQL enum
export type AppPermission = 'recipes.create' | 'recipes.delete';

// Base profile type from database schema
export type Profile = Tables<'profiles'> & { email?: string };

// Extended profile types
export type UserWithProfile = User & Tables<'profiles'>;
export type ProfileWithRecipes = Profile & {
  recipes_created?: Recipe[];
  recipes_count?: number;
};
