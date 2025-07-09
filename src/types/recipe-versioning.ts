import { Recipe } from './recipe';
import { Profile } from './profile';

export interface RecipeVersion {
  id: string;
  original_recipe_id: string;
  parent_version_id?: string;
  recipe_id: string;
  version_number: string;
  created_by: string;
  created_at: string;
  change_summary: string;
  is_public: boolean;
  fork_count: number;
  success_rating?: number;

  // Joined data
  recipe?: Recipe;
  creator?: Profile;
  parent_version?: RecipeVersion;
  children?: RecipeVersion[];

  // Related data
  changes_made?: RecipeChange[];
  diary_entries?: DiaryEntry[];
}

export interface DiaryEntry {
  id: string;
  recipe_version_id: string;
  created_by: string;
  entry_type: 'pre_cooking' | 'during_cooking' | 'post_cooking' | 'next_time';
  content: string;
  cooking_date?: string;
  created_at: string;
  images?: string[];

  // Joined data
  creator?: Profile;
}

export interface RecipeChange {
  id: string;
  recipe_version_id: string;
  change_type:
    | 'ingredient_added'
    | 'ingredient_removed'
    | 'ingredient_modified'
    | 'instruction_added'
    | 'instruction_removed'
    | 'instruction_modified'
    | 'general_info_modified';
  old_value?: any;
  new_value?: any;
  reason: string;
  created_at: string;
}

export interface CreateRecipeVersionData {
  original_recipe_id: string;
  parent_version_id?: string;
  recipe_data: Partial<Recipe>;
  change_summary: string;
  is_public?: boolean;
  success_rating?: number;
  changes_made?: Omit<RecipeChange, 'id' | 'recipe_version_id' | 'created_at'>[];
}

export interface CreateDiaryEntryData {
  recipe_version_id: string;
  entry_type: DiaryEntry['entry_type'];
  content: string;
  cooking_date?: string;
  images?: string[];
}

export interface UpdateDiaryEntryData {
  content?: string;
  cooking_date?: string;
  images?: string[];
}

export interface RecipeVersionWithDetails extends RecipeVersion {
  recipe: Recipe;
  creator: Profile;
  parent_version?: RecipeVersion;
  children: RecipeVersion[];
  changes_made: RecipeChange[];
  diary_entries: DiaryEntry[];
  total_diary_entries: number;
  recent_diary_entries: DiaryEntry[];
}

export interface VersionTreeNode {
  version: RecipeVersion;
  children: VersionTreeNode[];
  depth: number;
  isExpanded?: boolean;
}

export interface VersionComparison {
  original: RecipeVersion;
  modified: RecipeVersion;
  changes: {
    ingredients: {
      added: any[];
      removed: any[];
      modified: any[];
    };
    instructions: {
      added: any[];
      removed: any[];
      modified: any[];
    };
    general: {
      [key: string]: {
        old: any;
        new: any;
      };
    };
  };
}

export interface ForkRecipeModalData {
  change_summary: string;
  is_public: boolean;
  planned_changes?: string;
}

export interface DiaryEntryFormData {
  entry_type: DiaryEntry['entry_type'];
  content: string;
  cooking_date?: string;
  images?: FileList;
}

// Utility types
export type DiaryEntryType = DiaryEntry['entry_type'];
export type RecipeChangeType = RecipeChange['change_type'];

// Constants
export const DIARY_ENTRY_TYPES: {
  [key in DiaryEntryType]: { label: string; icon: string; color: string };
} = {
  pre_cooking: { label: 'Pre-cooking', icon: 'ChefHat', color: 'blue' },
  during_cooking: { label: 'During cooking', icon: 'Clock', color: 'orange' },
  post_cooking: { label: 'Post-cooking', icon: 'CheckCircle', color: 'green' },
  next_time: { label: 'Next time', icon: 'Lightbulb', color: 'purple' },
};

export const RECIPE_CHANGE_TYPES: { [key in RecipeChangeType]: { label: string; color: string } } =
  {
    ingredient_added: { label: 'Ingredient Added', color: 'green' },
    ingredient_removed: { label: 'Ingredient Removed', color: 'red' },
    ingredient_modified: { label: 'Ingredient Modified', color: 'yellow' },
    instruction_added: { label: 'Instruction Added', color: 'green' },
    instruction_removed: { label: 'Instruction Removed', color: 'red' },
    instruction_modified: { label: 'Instruction Modified', color: 'yellow' },
    general_info_modified: { label: 'General Info Modified', color: 'blue' },
  };

export const SUCCESS_RATINGS = [
  { value: 1, label: 'Poor', emoji: '😞' },
  { value: 2, label: 'Fair', emoji: '😐' },
  { value: 3, label: 'Good', emoji: '🙂' },
  { value: 4, label: 'Great', emoji: '😊' },
  { value: 5, label: 'Excellent', emoji: '🤩' },
];
