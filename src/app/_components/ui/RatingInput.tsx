'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';
import { submitRating, getUserRating } from '@/api/rating';
import { useUser } from '@/_contexts/UserContext';
import { RecipeRating } from '@/types/rating';

interface RatingInputProps {
  recipeId: string;
  onRatingSubmitted?: (rating: RecipeRating) => void;
  className?: string;
}

export default function RatingInput({ recipeId, onRatingSubmitted, className }: RatingInputProps) {
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  // Load user's existing rating
  useEffect(() => {
    const loadUserRating = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const rating = await getUserRating(recipeId);
        if (rating && !(rating instanceof Error)) {
          setCurrentRating(rating.rating);
        }
      } catch (error) {
        console.error('Error loading user rating:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserRating();
  }, [recipeId, user]);

  const handleStarClick = async (rating: number) => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await submitRating(recipeId, rating);
      if (result instanceof Error) {
        console.error('Error submitting rating:', result);
        // TODO: Show error toast
      } else {
        setCurrentRating(rating);
        onRatingSubmitted?.(result);
        // TODO: Show success toast
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarHover = (rating: number) => {
    if (!isSubmitting) {
      setHoveredRating(rating);
    }
  };

  const handleMouseLeave = () => {
    setHoveredRating(0);
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <div className="animate-pulse flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-5 w-5 text-gray-300 dark:text-gray-600" />
          ))}
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
          Sign in to rate this recipe
        </span>
      </div>
    );
  }

  const displayRating = hoveredRating || currentRating;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-1" onMouseLeave={handleMouseLeave}>
        {Array.from({ length: 5 }).map((_, i) => {
          const starRating = i + 1;
          const isFilled = starRating <= displayRating;
          const isHovering = hoveredRating > 0;

          return (
            <button
              key={i}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleStarClick(starRating)}
              onMouseEnter={() => handleStarHover(starRating)}
              className={cn(
                'transition-all duration-150 disabled:cursor-not-allowed',
                isSubmitting ? 'opacity-50' : 'hover:scale-110 cursor-pointer'
              )}
            >
              <Star
                className={cn(
                  'h-5 w-5 transition-colors duration-150',
                  isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600',
                  isHovering && !isSubmitting && 'hover:text-yellow-300'
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="ml-2 text-sm">
        {isSubmitting ? (
          <span className="text-gray-500 dark:text-gray-400">Saving...</span>
        ) : currentRating > 0 ? (
          <span className="text-gray-600 dark:text-gray-400">
            Your rating: {currentRating} star{currentRating !== 1 ? 's' : ''}
            {hoveredRating > 0 && hoveredRating !== currentRating && (
              <span className="text-gray-500">
                {' '}
                → {hoveredRating} star{hoveredRating !== 1 ? 's' : ''}
              </span>
            )}
          </span>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">
            {hoveredRating > 0 ? (
              <>
                Rate this recipe: {hoveredRating} star{hoveredRating !== 1 ? 's' : ''}
              </>
            ) : (
              'Click to rate this recipe'
            )}
          </span>
        )}
      </div>
    </div>
  );
}

// Compact version for recipe cards
interface CompactRatingInputProps {
  recipeId: string;
  onRatingSubmitted?: (rating: RecipeRating) => void;
  className?: string;
}

export function CompactRatingInput({
  recipeId,
  onRatingSubmitted,
  className,
}: CompactRatingInputProps) {
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();

  // Load user's existing rating
  useEffect(() => {
    const loadUserRating = async () => {
      if (!user) return;

      try {
        const rating = await getUserRating(recipeId);
        if (rating && !(rating instanceof Error)) {
          setCurrentRating(rating.rating);
        }
      } catch (error) {
        console.error('Error loading user rating:', error);
      }
    };

    loadUserRating();
  }, [recipeId, user]);

  const handleStarClick = async (rating: number) => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await submitRating(recipeId, rating);
      if (result instanceof Error) {
        console.error('Error submitting rating:', result);
      } else {
        setCurrentRating(rating);
        onRatingSubmitted?.(result);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const displayRating = hoveredRating || currentRating;

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      onMouseLeave={() => setHoveredRating(0)}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const starRating = i + 1;
        const isFilled = starRating <= displayRating;

        return (
          <button
            key={i}
            type="button"
            disabled={isSubmitting}
            onClick={() => handleStarClick(starRating)}
            onMouseEnter={() => setHoveredRating(starRating)}
            className={cn(
              'transition-all duration-150 disabled:cursor-not-allowed',
              isSubmitting ? 'opacity-50' : 'hover:scale-110 cursor-pointer'
            )}
          >
            <Star
              className={cn(
                'h-3 w-3 transition-colors duration-150',
                isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
