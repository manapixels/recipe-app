'use client';

import React, { useState, useEffect } from 'react';

export type SortByOptions = 'created_at' | 'name' | 'total_time';
export type SortDirectionOptions = 'asc' | 'desc';

interface RecipeSortProps {
  initialSortBy?: SortByOptions;
  initialSortDirection?: SortDirectionOptions;
  onSortChange: (sort: { sortBy: SortByOptions; sortDirection: SortDirectionOptions }) => void;
}

const SORT_BY_CHOICES: { value: SortByOptions; label: string }[] = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'name', label: 'Name' },
  { value: 'total_time', label: 'Total Time' },
  // Future options: 'rating', 'popularity'
];

const SORT_DIRECTION_CHOICES: { value: SortDirectionOptions; label: string }[] = [
  { value: 'desc', label: 'Descending' },
  { value: 'asc', label: 'Ascending' },
];

const RecipeSort: React.FC<RecipeSortProps> = ({
  initialSortBy = 'created_at',
  initialSortDirection = 'desc',
  onSortChange,
}) => {
  const [sortBy, setSortBy] = useState<SortByOptions>(initialSortBy);
  const [sortDirection, setSortDirection] = useState<SortDirectionOptions>(initialSortDirection);

  useEffect(() => {
    onSortChange({ sortBy, sortDirection });
  }, [sortBy, sortDirection, onSortChange]);

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortByOptions);
  };

  const handleSortDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortDirection(e.target.value as SortDirectionOptions);
  };

  return (
    <div className="p-4 mb-6 bg-gray-50 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">Sort Recipes</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sort By Filter */}
        <div>
          <label htmlFor="sort-by-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sort-by-filter"
            value={sortBy}
            onChange={handleSortByChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
          >
            {SORT_BY_CHOICES.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Direction Filter */}
        <div>
          <label
            htmlFor="sort-direction-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Direction
          </label>
          <select
            id="sort-direction-filter"
            value={sortDirection}
            onChange={handleSortDirectionChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
          >
            {SORT_DIRECTION_CHOICES.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default RecipeSort;
