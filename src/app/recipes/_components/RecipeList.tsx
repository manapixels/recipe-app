'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchRecipes, FetchRecipesParams, fetchUserFavoriteRecipes } from '@/api/recipe';
import RecipeCardWithRating from './RecipeCardWithRating';
import RecipeFilters from './RecipeFilters';
import RecipeSort, { SortByOptions, SortDirectionOptions } from './RecipeSort';
import { Recipe, RecipeCategory, RecipeSubcategory, DifficultyLevel } from '@/types/recipe';
import { useUser } from '@/_contexts/UserContext';

interface FiltersState {
  category?: RecipeCategory;
  subcategory?: RecipeSubcategory;
  difficulty?: DifficultyLevel;
  minRating?: number;
}

interface SortState {
  sortBy: SortByOptions;
  sortDirection: SortDirectionOptions;
}

interface RecipeListProps {
  initialCategory?: RecipeCategory;
  initialSubcategory?: RecipeSubcategory;
  initialSearch?: string;
}

export default function RecipeList({
  initialCategory,
  initialSubcategory,
  initialSearch,
}: RecipeListProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<Set<string>>(new Set());

  const { user, loading: userLoading } = useUser();

  const [filters, setFilters] = useState<FiltersState>(() => ({
    category: initialCategory,
    subcategory: initialSubcategory,
    // difficulty will be initialized by RecipeFilters or default
  }));
  const [sortParams, setSortParams] = useState<SortState>({
    sortBy: 'created_at',
    sortDirection: 'desc',
  });

  const loadRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: FetchRecipesParams = {
        ...filters,
        sortBy: sortParams.sortBy,
        sortDirection: sortParams.sortDirection,
        search: initialSearch || undefined,
      };
      const fetchedRecipesData = await fetchRecipes(params);

      if (fetchedRecipesData instanceof Error) {
        setError(fetchedRecipesData.message);
        setRecipes([]);
      } else {
        console.log('fetchedRecipesData', fetchedRecipesData);
        setRecipes(Array.isArray(fetchedRecipesData) ? fetchedRecipesData : []);
      }
    } catch (e: any) {
      console.error('Failed to fetch recipes:', e);
      setError(e.message || 'An unexpected error occurred');
      setRecipes([]);
    }
    setIsLoading(false);
  }, [filters, sortParams, initialSearch]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  useEffect(() => {
    const loadUserFavorites = async () => {
      if (user && user.id) {
        const { data: favoriteEntries, error: favError } = await fetchUserFavoriteRecipes(user.id);
        if (favError) {
          console.error('Error fetching user favorites:', favError);
          setFavoriteRecipeIds(new Set());
        } else {
          const ids = new Set(
            favoriteEntries.map(fav => fav.recipe_id).filter(id => id !== null) as string[]
          );
          setFavoriteRecipeIds(ids);
        }
      } else {
        setFavoriteRecipeIds(new Set());
      }
    };

    if (!userLoading) {
      loadUserFavorites();
    }
  }, [user, userLoading]);

  const handleFilterChange = useCallback((newFilters: FiltersState) => {
    setFilters(newFilters);
  }, []);

  const handleSortChange = useCallback((newSortParams: SortState) => {
    setSortParams(newSortParams);
  }, []);

  return (
    <div className="flex w-full flex-col">
      {/* Filters and Sort Section */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <RecipeFilters
          initialCategory={filters.category}
          initialSubcategory={filters.subcategory}
          initialDifficulty={filters.difficulty}
          initialMinRating={filters.minRating}
          onFilterChange={handleFilterChange}
        />
        <RecipeSort
          initialSortBy={sortParams.sortBy}
          initialSortDirection={sortParams.sortDirection}
          onSortChange={handleSortChange}
        />
      </div>

      {isLoading && <p>Loading recipes...</p>}
      {error && <p className="text-red-500">Error loading recipes: {error}</p>}
      {!isLoading && !error && recipes.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No recipes found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No recipes found matching your criteria. Try adjusting your filters.
          </p>
        </div>
      )}

      {!isLoading && !error && recipes.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {recipes.map(recipe => (
            <RecipeCardWithRating
              recipe={recipe}
              key={recipe.id}
              initialIsFavorited={favoriteRecipeIds.has(recipe.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
