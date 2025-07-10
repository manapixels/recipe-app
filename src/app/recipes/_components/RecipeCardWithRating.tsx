'use client';

import { useState, useEffect } from 'react';
import { getRecipeRatingStats } from '@/api/rating';
import RecipeListItem from './RecipeListItem';
import { Recipe } from '@/types/recipe';
import { RecipeRatingStats } from '@/types/rating';

interface RecipeCardWithRatingProps {
  recipe: Recipe;
  initialIsFavorited: boolean;
}

export default function RecipeCardWithRating({
  recipe,
  initialIsFavorited,
}: RecipeCardWithRatingProps) {
  const [ratingStats, setRatingStats] = useState<RecipeRatingStats | null>(null);

  useEffect(() => {
    const loadRatingStats = async () => {
      try {
        const stats = await getRecipeRatingStats(recipe.id);
        if (stats && !(stats instanceof Error)) {
          setRatingStats(stats);
        }
      } catch (error) {
        console.error('Error loading rating stats for recipe:', recipe.id, error);
      }
    };

    loadRatingStats();
  }, [recipe.id]);

  return (
    <RecipeListItem
      recipe={recipe}
      initialIsFavorited={initialIsFavorited}
      avgRating={ratingStats?.avg_rating}
      totalRatings={ratingStats?.total_ratings}
    />
  );
}
