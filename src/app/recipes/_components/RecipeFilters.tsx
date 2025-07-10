'use client';

import React, { useState, useEffect } from 'react';
import {
  RecipeCategory,
  RecipeSubcategory,
  DifficultyLevel,
  CATEGORY_OPTIONS,
  SUBCATEGORY_OPTIONS,
} from '@/types/recipe';
import { CustomSelect } from '@/_components/ui/Select';

interface RecipeFiltersProps {
  initialCategory?: RecipeCategory;
  initialSubcategory?: RecipeSubcategory;
  initialDifficulty?: DifficultyLevel;
  initialMinRating?: number;
  onFilterChange: (filters: {
    category?: RecipeCategory;
    subcategory?: RecipeSubcategory;
    difficulty?: DifficultyLevel;
    minRating?: number;
  }) => void;
}

const RecipeFilters: React.FC<RecipeFiltersProps> = ({
  initialCategory,
  initialSubcategory,
  initialDifficulty,
  initialMinRating,
  onFilterChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | undefined>(
    initialCategory
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<RecipeSubcategory | undefined>(
    initialSubcategory
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | undefined>(
    initialDifficulty ? String(initialDifficulty) : undefined
  );
  const [selectedMinRating, setSelectedMinRating] = useState<string | undefined>(
    initialMinRating ? String(initialMinRating) : undefined
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
      difficulty:
        selectedDifficulty && selectedDifficulty !== ALL_FILTER_VALUE
          ? (parseInt(selectedDifficulty, 10) as DifficultyLevel)
          : undefined,
      minRating:
        selectedMinRating && selectedMinRating !== ALL_FILTER_VALUE
          ? parseInt(selectedMinRating, 10)
          : undefined,
    });
  }, [
    selectedCategory,
    selectedSubcategory,
    selectedDifficulty,
    selectedMinRating,
    onFilterChange,
  ]);

  const ALL_FILTER_VALUE = '--all--';

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === ALL_FILTER_VALUE ? undefined : (value as RecipeCategory));
    setSelectedSubcategory(undefined);
  };

  const handleSubcategoryChange = (value: string) => {
    setSelectedSubcategory(value === ALL_FILTER_VALUE ? undefined : (value as RecipeSubcategory));
  };

  const handleDifficultyChange = (value: string) => {
    setSelectedDifficulty(value === ALL_FILTER_VALUE ? undefined : value);
  };

  const handleMinRatingChange = (value: string) => {
    setSelectedMinRating(value === ALL_FILTER_VALUE ? undefined : value);
  };

  const categoryOptions = [
    { label: 'All Categories', value: ALL_FILTER_VALUE },
    ...CATEGORY_OPTIONS.map(option => ({ label: option.label, value: option.value as string })),
  ];

  const subcategoryOptions = selectedCategory
    ? [
        { label: 'All Subcategories', value: ALL_FILTER_VALUE },
        ...(SUBCATEGORY_OPTIONS[selectedCategory] ?? []).map(option => ({
          label: option.label,
          value: option.value as string,
        })),
      ]
    : [{ label: 'All Subcategories', value: ALL_FILTER_VALUE }];

  const difficultyOptions = [
    { label: 'All Difficulties', value: ALL_FILTER_VALUE },
    { label: 'Level 1', value: '1' },
    { label: 'Level 2', value: '2' },
    { label: 'Level 3', value: '3' },
  ];

  const ratingOptions = [
    { label: 'Any Rating', value: ALL_FILTER_VALUE },
    { label: '4+ Stars', value: '4' },
    { label: '3+ Stars', value: '3' },
    { label: '2+ Stars', value: '2' },
    { label: '1+ Stars', value: '1' },
  ];

  return (
    <div className="p-4 mb-6 bg-gray-50 rounded-lg shadow dark:bg-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category Filter */}
        <div>
          <label
            htmlFor="category-filter"
            className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
          >
            Category
          </label>
          <CustomSelect
            name="category-filter"
            value={selectedCategory || ALL_FILTER_VALUE}
            onChange={handleCategoryChange}
            options={categoryOptions}
            placeholder="All Categories"
          />
        </div>

        {/* Subcategory Filter */}
        <div>
          <label
            htmlFor="subcategory-filter"
            className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
          >
            Subcategory
          </label>
          <CustomSelect
            name="subcategory-filter"
            value={selectedSubcategory || ALL_FILTER_VALUE}
            onChange={handleSubcategoryChange}
            options={subcategoryOptions}
            placeholder="All Subcategories"
            disabled={!selectedCategory || !SUBCATEGORY_OPTIONS[selectedCategory]?.length}
          />
        </div>

        {/* Difficulty Filter */}
        <div>
          <label
            htmlFor="difficulty-filter"
            className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
          >
            Difficulty
          </label>
          <CustomSelect
            name="difficulty-filter"
            value={selectedDifficulty || ALL_FILTER_VALUE}
            onChange={handleDifficultyChange}
            options={difficultyOptions}
            placeholder="All Difficulties"
          />
        </div>

        {/* Rating Filter */}
        <div>
          <label
            htmlFor="rating-filter"
            className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
          >
            Minimum Rating
          </label>
          <CustomSelect
            name="rating-filter"
            value={selectedMinRating || ALL_FILTER_VALUE}
            onChange={handleMinRatingChange}
            options={ratingOptions}
            placeholder="Any Rating"
          />
        </div>
      </div>
    </div>
  );
};

export default RecipeFilters;
