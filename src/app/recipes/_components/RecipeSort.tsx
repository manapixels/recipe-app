'use client';

import React, { useState, useEffect } from 'react';
import { CustomSelect } from '@/_components/ui/Select';

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

  const handleSortByChange = (value: string) => {
    setSortBy(value as SortByOptions);
  };

  const handleSortDirectionChange = (value: string) => {
    setSortDirection(value as SortDirectionOptions);
  };

  return (
    <div className="p-4 mb-6 bg-gray-50 rounded-lg shadow dark:bg-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sort By Filter */}
        <div>
          <label
            htmlFor="sort-by-filter"
            className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
          >
            Sort By
          </label>
          <CustomSelect
            name="sort-by-filter"
            value={sortBy}
            onChange={handleSortByChange}
            options={SORT_BY_CHOICES}
            placeholder="Select Sort Property"
          />
        </div>

        {/* Sort Direction Filter */}
        <div>
          <label
            htmlFor="sort-direction-filter"
            className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
          >
            Direction
          </label>
          <CustomSelect
            name="sort-direction-filter"
            value={sortDirection}
            onChange={handleSortDirectionChange}
            options={SORT_DIRECTION_CHOICES}
            placeholder="Select Sort Direction"
          />
        </div>
      </div>
    </div>
  );
};

export default RecipeSort;
