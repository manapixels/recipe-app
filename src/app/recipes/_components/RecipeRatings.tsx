'use client';

import { useState, useEffect } from 'react';
import { getRecipeRatingStats } from '@/api/rating';
import RatingDisplay, { RatingStats } from '@/_components/ui/RatingDisplay';
import RatingInput from '@/_components/ui/RatingInput';
import { RecipeRatingStats } from '@/types/rating';

interface RecipeRatingsProps {
  recipeId: string;
  className?: string;
}

export default function RecipeRatings({ recipeId, className }: RecipeRatingsProps) {
  const [stats, setStats] = useState<RecipeRatingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRatingStats = async () => {
    try {
      setIsLoading(true);
      const result = await getRecipeRatingStats(recipeId);

      if (result instanceof Error) {
        setError('Failed to load ratings');
        setStats(null);
      } else {
        setStats(result);
        setError(null);
      }
    } catch (err) {
      console.error('Error loading rating stats:', err);
      setError('Failed to load ratings');
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRatingStats();
  }, [recipeId]);

  if (isLoading) {
    return (
      <div className={className}>
        <div className="animate-pulse flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <span className="text-sm text-gray-500 dark:text-gray-400">Unable to load ratings</span>
      </div>
    );
  }

  // Default stats if no ratings yet
  const defaultStats = {
    avg_rating: 0,
    total_ratings: 0,
    rating_5: 0,
    rating_4: 0,
    rating_3: 0,
    rating_2: 0,
    rating_1: 0,
  };

  const displayStats = stats || defaultStats;

  return (
    <div className={className}>
      {displayStats.total_ratings > 0 ? (
        <RatingDisplay rating={displayStats.avg_rating} reviewCount={displayStats.total_ratings} />
      ) : (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <RatingDisplay rating={0} showCount={false} />
          <span>No ratings yet</span>
        </div>
      )}
    </div>
  );
}

// Component for detailed rating stats and input
interface DetailedRecipeRatingsProps {
  recipeId: string;
  className?: string;
}

export function DetailedRecipeRatings({ recipeId, className }: DetailedRecipeRatingsProps) {
  const [stats, setStats] = useState<RecipeRatingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRatingStats = async () => {
    try {
      setIsLoading(true);
      const result = await getRecipeRatingStats(recipeId);

      if (result instanceof Error) {
        setError('Failed to load ratings');
        setStats(null);
      } else {
        setStats(result);
        setError(null);
      }
    } catch (err) {
      console.error('Error loading rating stats:', err);
      setError('Failed to load ratings');
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRatingStats();
  }, [recipeId]);

  const handleRatingSubmitted = () => {
    // Refresh rating stats after user submits a rating
    loadRatingStats();
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <p className="text-sm text-red-500">Failed to load rating details</p>
      </div>
    );
  }

  // Default stats if no ratings yet
  const defaultStats = {
    avg_rating: 0,
    total_ratings: 0,
    rating_5: 0,
    rating_4: 0,
    rating_3: 0,
    rating_2: 0,
    rating_1: 0,
  };

  const displayStats = stats || defaultStats;

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Rating input */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Rate this recipe
          </h3>
          <RatingInput recipeId={recipeId} onRatingSubmitted={handleRatingSubmitted} />
        </div>

        {/* Rating statistics */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Community ratings
          </h3>
          <RatingStats stats={displayStats} />
        </div>
      </div>
    </div>
  );
}
