'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { fetchRecipes, FetchRecipesParams } from '@/api/recipe';
import RecipeListItem from './RecipeListItem';
import RecipeFilters from './RecipeFilters';
import RecipeSort, { SortByOptions, SortDirectionOptions } from './RecipeSort';
import { Recipe, RecipeCategory, RecipeSubcategory, DifficultyLevel } from '@/types/recipe';

interface FiltersState {
  category?: RecipeCategory;
  subcategory?: RecipeSubcategory;
  difficulty?: DifficultyLevel;
}

interface SortState {
  sortBy: SortByOptions;
  sortDirection: SortDirectionOptions;
}

export default function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FiltersState>({});
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
      };
      const fetchedRecipes = (await fetchRecipes(params)) as Recipe[] | Error;
      if (fetchedRecipes instanceof Error) {
        setError(fetchedRecipes.message);
        setRecipes([]);
      } else {
        setRecipes(fetchedRecipes || []);
      }
    } catch (e: any) {
      console.error('Failed to fetch recipes:', e);
      setError(e.message || 'An unexpected error occurred');
      setRecipes([]);
    }
    setIsLoading(false);
  }, [filters, sortParams]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const handleFilterChange = useCallback((newFilters: FiltersState) => {
    setFilters(newFilters);
  }, []);

  const handleSortChange = useCallback((newSortParams: SortState) => {
    setSortParams(newSortParams);
  }, []);

  return (
    <div className="flex w-full flex-col">
      <div className="mb-8">
        <RecipeFilters
          initialCategory={filters.category}
          initialSubcategory={filters.subcategory}
          initialDifficulty={filters.difficulty}
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
        <p>No recipes found matching your criteria.</p>
      )}

      {!isLoading && !error && recipes.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {recipes.map(recipe => (
            <RecipeListItem recipe={recipe} key={recipe.id} />
          ))}
        </div>
      )}
    </div>
  );
}
