export interface RecipeRating {
  id: string;
  recipe_id: string;
  user_id: string;
  rating: number; // 1-5 stars
  created_at: string;
  updated_at: string;
}

export interface RecipeRatingStats {
  id: string;
  name: string;
  slug: string;
  avg_rating: number;
  total_ratings: number;
  rating_5: number;
  rating_4: number;
  rating_3: number;
  rating_2: number;
  rating_1: number;
}

export interface CreateRatingParams {
  recipe_id: string;
  rating: number;
}

export interface UpdateRatingParams {
  rating: number;
}
