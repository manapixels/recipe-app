'use client';

import React, { useState, useEffect } from 'react';
import {
  RecipeCategory,
  RecipeSubcategory,
  DifficultyLevel,
  CATEGORY_OPTIONS,
  SUBCATEGORY_OPTIONS,
  DIFFICULTY_LEVELS,
} from '@/types/recipe';

interface RecipeFiltersProps {
  initialCategory?: RecipeCategory;
  initialSubcategory?: RecipeSubcategory;
  initialDifficulty?: DifficultyLevel;
  onFilterChange: (filters: {
    category?: RecipeCategory;
    subcategory?: RecipeSubcategory;
    difficulty?: DifficultyLevel;
  }) => void;
}

const RecipeFilters: React.FC<RecipeFiltersProps> = ({
  initialCategory,
  initialSubcategory,
  initialDifficulty,
  onFilterChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | undefined>(
    initialCategory
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<RecipeSubcategory | undefined>(
    initialSubcategory
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | undefined>(
    initialDifficulty
  );

  useEffect(() => {
    if (selectedCategory && selectedSubcategory) {
      const validSubcategories = SUBCATEGORY_OPTIONS[selectedCategory] ?? [];
      if (!validSubcategories.find(sub => sub.value === selectedSubcategory)) {
        setSelectedSubcategory(undefined);
      }
    }
  }, [selectedCategory, selectedSubcategory]);

  useEffect(() => {
    onFilterChange({
      category: selectedCategory,
      subcategory: selectedSubcategory,
      difficulty: selectedDifficulty,
    });
  }, [selectedCategory, selectedSubcategory, selectedDifficulty, onFilterChange]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as RecipeCategory | '';
    setSelectedCategory(value === '' ? undefined : value);
    setSelectedSubcategory(undefined);
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as RecipeSubcategory | '';
    setSelectedSubcategory(value === '' ? undefined : value);
  };

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as DifficultyLevel | '';
    setSelectedDifficulty(value === '' ? undefined : value);
  };

  return (
    <div className="p-4 mb-6 bg-gray-50 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">Filter Recipes</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div>
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category-filter"
            value={selectedCategory || ''}
            onChange={handleCategoryChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
          >
            <option value="">All Categories</option>
            {CATEGORY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory Filter */}
        <div>
          <label
            htmlFor="subcategory-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Subcategory
          </label>
          <select
            id="subcategory-filter"
            value={selectedSubcategory || ''}
            onChange={handleSubcategoryChange}
            disabled={!selectedCategory || !SUBCATEGORY_OPTIONS[selectedCategory]?.length}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm disabled:bg-gray-100"
          >
            <option value="">All Subcategories</option>
            {selectedCategory &&
              (SUBCATEGORY_OPTIONS[selectedCategory] ?? []).map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label
            htmlFor="difficulty-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Difficulty
          </label>
          <select
            id="difficulty-filter"
            value={selectedDifficulty || ''}
            onChange={handleDifficultyChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
          >
            <option value="">All Difficulties</option>
            {Object.entries(DIFFICULTY_LEVELS).map(([value, label]) => (
              <option key={value} value={value as DifficultyLevel}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default RecipeFilters;
