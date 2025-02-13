import { User } from '@supabase/supabase-js';
import { Tables } from '@/types/definitions';
import { Recipe } from '@/types/recipe';

// Role types from SQL enum
export type AppRole = 'admin' | 'host' | 'participant';

// Permission types from SQL enum
export type AppPermission = 'recipes.create' | 'recipes.delete';

// Base profile type from database schema
export type Profile = Tables<'profiles'> & { email?: string };

// Extended profile types
export type UserWithProfile = User & Tables<'profiles'>;
export type ProfileWithRoles = Tables<'profiles_with_roles'>;
export type ProfileWithRecipes = Profile & {
  recipes_created?: Recipe[];
  recipes_count?: number;
  user_roles?: AppRole[];
};

// User role interface matching the database schema
export interface UserRole {
  id: number;
  user_id: string;
  role: AppRole;
}

// Role permission interface matching the database schema
export interface RolePermission {
  id: number;
  role: AppRole;
  permission: AppPermission;
}
