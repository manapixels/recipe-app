import { User } from '@supabase/supabase-js';
import { Tables } from '@/types/definitions';
import { Recipe } from '@/types/recipe';
import { Database } from './definitions';

// Permission types from SQL enum
export type AppPermission = 'recipes.create' | 'recipes.delete';

// Base profile type from database schema, extended with optional bio
export type Profile = Database['public']['Tables']['profiles']['Row'] & {
  email?: string;
  bio?: string;
  preferred_unit_system?: 'metric' | 'imperial' | null;
};

// Extended profile types
export type UserWithProfile = User & Tables<'profiles'>;
export type ProfileWithRecipes = Profile & {
  recipes_created?: Recipe[];
  favorite_recipes?: Recipe[];
  recipes_count?: number;
  bio?: string;
};

// If ProfileWithSocialsAndRecipes exists and also needs bio, it would inherit from Profile.
// Example (adjust if actual type is different):
export type ProfileWithSocials = Profile & {
  social_links?: Array<{ platform: string; url: string }>;
};

export type ProfileWithSocialsAndRecipes = ProfileWithSocials &
  ProfileWithRecipes & {
    recipes_count?: number;
    // bio is inherited from Profile, so no need to redeclare here
  };
