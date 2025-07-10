import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/utils/cn';

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  reviewCount?: number;
  iconSize?: number;
  className?: string;
  textClassName?: string;
  showCount?: boolean;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  maxRating = 5,
  reviewCount,
  iconSize = 20, // Corresponds to w-5 h-5 in Tailwind
  className = 'flex items-center gap-1',
  textClassName = 'text-sm text-gray-600 dark:text-gray-400 ml-1',
  showCount = true,
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        {Array.from({ length: fullStars }).map((_, index) => (
          <Star key={`full-${index}`} size={iconSize} className="text-yellow-400 fill-yellow-400" />
        ))}
        {hasHalfStar && (
          <StarHalf key="half" size={iconSize} className="text-yellow-400 fill-yellow-400" />
        )}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <Star
            key={`empty-${index}`}
            size={iconSize}
            className="text-gray-300 dark:text-gray-500"
          />
        ))}
      </div>
      {showCount && typeof rating === 'number' && (
        <span className={textClassName}>
          {rating.toFixed(1)}
          {reviewCount !== undefined &&
            ` (${reviewCount} ${reviewCount === 1 ? 'rating' : 'ratings'})`}
        </span>
      )}
    </div>
  );
};

// Rating stats breakdown component
interface RatingStatsProps {
  stats: {
    avg_rating: number;
    total_ratings: number;
    rating_5: number;
    rating_4: number;
    rating_3: number;
    rating_2: number;
    rating_1: number;
  };
  className?: string;
}

export function RatingStats({ stats, className }: RatingStatsProps) {
  const { avg_rating, total_ratings, rating_5, rating_4, rating_3, rating_2, rating_1 } = stats;

  if (total_ratings === 0) {
    return (
      <div className={cn('text-center py-4', className)}>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No ratings yet. Be the first to rate this recipe!
        </p>
      </div>
    );
  }

  const getPercentage = (count: number) => {
    return total_ratings > 0 ? Math.round((count / total_ratings) * 100) : 0;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Overall rating */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {avg_rating.toFixed(1)}
          </div>
          <RatingDisplay rating={avg_rating} showCount={false} iconSize={16} />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Based on {total_ratings} {total_ratings === 1 ? 'rating' : 'ratings'}
        </div>
      </div>

      {/* Rating breakdown */}
      <div className="space-y-2">
        {[
          { stars: 5, count: rating_5 },
          { stars: 4, count: rating_4 },
          { stars: 3, count: rating_3 },
          { stars: 2, count: rating_2 },
          { stars: 1, count: rating_1 },
        ].map(({ stars, count }) => (
          <div key={stars} className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 w-16">
              <span className="text-gray-600 dark:text-gray-400">{stars}</span>
              <Star className="h-3 w-3 text-gray-400" />
            </div>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getPercentage(count)}%` }}
              />
            </div>
            <span className="text-gray-500 dark:text-gray-400 w-8 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RatingDisplay;
