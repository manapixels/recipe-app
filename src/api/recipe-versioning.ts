'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  RecipeVersion,
  RecipeVersionWithDetails,
  CreateRecipeVersionData,
  DiaryEntry,
  CreateDiaryEntryData,
  UpdateDiaryEntryData,
  VersionTreeNode,
  VersionComparison,
} from '@/types/recipe-versioning';
import { Recipe } from '@/types/recipe';
import { addRecipe } from './recipe';

/**
 * Fork a recipe - creates a new version based on an existing recipe
 */
export async function forkRecipe(
  data: CreateRecipeVersionData
): Promise<{ success: boolean; data?: RecipeVersion; error?: string }> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // First, create the new recipe with the modified data
    const recipeResult = await addRecipe({
      ...data.recipe_data,
      status: 'published', // Forks are published by default
      created_by: user.id,
    } as any);

    if (!recipeResult || Array.isArray(recipeResult) === false) {
      return { success: false, error: 'Failed to create recipe copy' };
    }

    // Generate version number
    const { data: versionNumber } = await supabase.rpc('generate_version_number', {
      original_recipe_id: data.original_recipe_id,
      parent_version_id: data.parent_version_id || null,
    });

    // Create version entry
    const { data: version, error } = await supabase
      .from('recipe_versions')
      .insert({
        original_recipe_id: data.original_recipe_id,
        parent_version_id: data.parent_version_id || null,
        recipe_id: (recipeResult as any)[0].id,
        version_number: versionNumber,
        created_by: user.id,
        change_summary: data.change_summary,
        is_public: data.is_public ?? true,
        success_rating: data.success_rating,
      })
      .select(
        `
        *,
        recipe:recipes(*),
        creator:profiles(*)
      `
      )
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Update the recipe to reference its version
    await supabase
      .from('recipes')
      .update({ version_id: version.id })
      .eq('id', (recipeResult as any)[0].id);

    // Create change records if provided
    if (data.changes_made && data.changes_made.length > 0) {
      await supabase.from('recipe_changes').insert(
        data.changes_made.map(change => ({
          recipe_version_id: version.id,
          ...change,
        }))
      );
    }

    // Increment fork count on parent version
    if (data.parent_version_id) {
      await supabase.rpc('increment_fork_count', {
        original_version_id: data.parent_version_id,
      });
    }

    revalidatePath('/recipes');
    return { success: true, data: version };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get a specific recipe version with full details
 */
export async function getRecipeVersion(
  versionId: string
): Promise<{ success: boolean; data?: RecipeVersionWithDetails; error?: string }> {
  try {
    const supabase = createClient();

    const { data: version, error } = await supabase
      .from('recipe_versions')
      .select(
        `
        *,
        recipe:recipes(*),
        creator:profiles(*),
        parent_version:recipe_versions!parent_version_id(*),
        children:recipe_versions!parent_version_id(*),
        changes_made:recipe_changes(*),
        diary_entries:recipe_diary_entries(*, creator:profiles(*))
      `
      )
      .eq('id', versionId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Get recent diary entries (last 5)
    const recent_diary_entries =
      version.diary_entries
        ?.sort(
          (a: DiaryEntry, b: DiaryEntry) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5) || [];

    const versionWithDetails: RecipeVersionWithDetails = {
      ...version,
      total_diary_entries: version.diary_entries?.length || 0,
      recent_diary_entries,
    };

    return { success: true, data: versionWithDetails };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get all versions of a recipe (version tree)
 */
export async function getRecipeVersionTree(
  originalRecipeId: string
): Promise<{ success: boolean; data?: VersionTreeNode[]; error?: string }> {
  try {
    const supabase = createClient();

    const { data: versions, error } = await supabase
      .from('recipe_versions')
      .select(
        `
        *,
        recipe:recipes(*),
        creator:profiles(*)
      `
      )
      .eq('original_recipe_id', originalRecipeId)
      .order('created_at', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    // Build tree structure
    const tree = buildVersionTree(versions);
    return { success: true, data: tree };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get version history for a recipe
 */
export async function getRecipeVersionHistory(
  originalRecipeId: string
): Promise<{ success: boolean; data?: RecipeVersion[]; error?: string }> {
  try {
    const supabase = createClient();

    const { data: versions, error } = await supabase
      .from('recipe_versions')
      .select(
        `
        *,
        recipe:recipes(*),
        creator:profiles(*)
      `
      )
      .eq('original_recipe_id', originalRecipeId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: versions };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Compare two recipe versions
 */
export async function compareRecipeVersions(
  version1Id: string,
  version2Id: string
): Promise<{ success: boolean; data?: VersionComparison; error?: string }> {
  try {
    const supabase = createClient();

    const { data: versions, error } = await supabase
      .from('recipe_versions')
      .select(
        `
        *,
        recipe:recipes(*)
      `
      )
      .in('id', [version1Id, version2Id]);

    if (error || !versions || versions.length !== 2) {
      return { success: false, error: 'Failed to fetch versions for comparison' };
    }

    const [original, modified] = versions;
    const comparison = generateVersionComparison(original, modified);

    return { success: true, data: comparison };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Create a diary entry for a recipe version
 */
export async function createDiaryEntry(
  data: CreateDiaryEntryData
): Promise<{ success: boolean; data?: DiaryEntry; error?: string }> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: entry, error } = await supabase
      .from('recipe_diary_entries')
      .insert({
        recipe_version_id: data.recipe_version_id,
        created_by: user.id,
        entry_type: data.entry_type,
        content: data.content,
        cooking_date: data.cooking_date,
        images: data.images || [],
      })
      .select(
        `
        *,
        creator:profiles(*)
      `
      )
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/recipes`);
    return { success: true, data: entry };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Update a diary entry
 */
export async function updateDiaryEntry(
  entryId: string,
  data: UpdateDiaryEntryData
): Promise<{ success: boolean; data?: DiaryEntry; error?: string }> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: entry, error } = await supabase
      .from('recipe_diary_entries')
      .update(data)
      .eq('id', entryId)
      .eq('created_by', user.id) // Ensure user owns the entry
      .select(
        `
        *,
        creator:profiles(*)
      `
      )
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/recipes`);
    return { success: true, data: entry };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Delete a diary entry
 */
export async function deleteDiaryEntry(
  entryId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('recipe_diary_entries')
      .delete()
      .eq('id', entryId)
      .eq('created_by', user.id); // Ensure user owns the entry

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/recipes`);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get diary entries for a recipe version
 */
export async function getDiaryEntries(
  versionId: string
): Promise<{ success: boolean; data?: DiaryEntry[]; error?: string }> {
  try {
    const supabase = createClient();

    const { data: entries, error } = await supabase
      .from('recipe_diary_entries')
      .select(
        `
        *,
        creator:profiles(*)
      `
      )
      .eq('recipe_version_id', versionId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: entries };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Update recipe version success rating
 */
export async function updateVersionRating(
  versionId: string,
  rating: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('recipe_versions')
      .update({ success_rating: rating })
      .eq('id', versionId)
      .eq('created_by', user.id); // Ensure user owns the version

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/recipes`);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Helper function to build version tree
function buildVersionTree(versions: RecipeVersion[]): VersionTreeNode[] {
  const versionMap = new Map<string, RecipeVersion>();
  const rootNodes: VersionTreeNode[] = [];

  // Create version map
  versions.forEach(version => {
    versionMap.set(version.id, version);
  });

  // Build tree structure
  versions.forEach(version => {
    const node: VersionTreeNode = {
      version,
      children: [],
      depth: 0,
    };

    if (!version.parent_version_id) {
      // Root node
      rootNodes.push(node);
    } else {
      // Find parent and add as child
      const parent = versionMap.get(version.parent_version_id);
      if (parent) {
        // This would need to be implemented with a proper tree structure
        // For now, we'll keep it simple
      }
    }
  });

  return rootNodes;
}

// Helper function to generate version comparison
function generateVersionComparison(
  original: RecipeVersion,
  modified: RecipeVersion
): VersionComparison {
  const originalRecipe = original.recipe;
  const modifiedRecipe = modified.recipe;

  if (!originalRecipe || !modifiedRecipe) {
    throw new Error('Recipe data missing for comparison');
  }

  return {
    original,
    modified,
    changes: {
      ingredients: compareArrays(originalRecipe.components, modifiedRecipe.components),
      instructions: compareArrays(originalRecipe.instructions, modifiedRecipe.instructions),
      general: compareGeneralInfo(originalRecipe, modifiedRecipe),
    },
  };
}

// Helper function to compare arrays
function compareArrays(original: any[], modified: any[]) {
  const added = modified.filter(
    item => !original.some(orig => JSON.stringify(orig) === JSON.stringify(item))
  );
  const removed = original.filter(
    item => !modified.some(mod => JSON.stringify(mod) === JSON.stringify(item))
  );
  const modifiedItems = modified.filter(item =>
    original.some(orig => orig.id === item.id && JSON.stringify(orig) !== JSON.stringify(item))
  );

  return { added, removed, modified: modifiedItems };
}

// Helper function to compare general recipe info
function compareGeneralInfo(original: Recipe, modified: Recipe) {
  const changes: { [key: string]: { old: any; new: any } } = {};

  const fieldsToCompare = [
    'name',
    'description',
    'category',
    'subcategory',
    'difficulty',
    'servings',
    'total_time',
  ];

  fieldsToCompare.forEach(field => {
    if (original[field as keyof Recipe] !== modified[field as keyof Recipe]) {
      changes[field] = {
        old: original[field as keyof Recipe],
        new: modified[field as keyof Recipe],
      };
    }
  });

  return changes;
}
