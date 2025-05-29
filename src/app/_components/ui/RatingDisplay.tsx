import { Star, StarHalf } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  reviewCount?: number;
  iconSize?: number;
  className?: string;
  textClassName?: string;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  maxRating = 5,
  reviewCount,
  iconSize = 20, // Corresponds to w-5 h-5 in Tailwind
  className = 'flex items-center gap-1',
  textClassName = 'text-sm text-gray-600 dark:text-gray-400 ml-1',
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        {Array.from({ length: fullStars }).map((_, index) => (
          <Star key={`full-${index}`} size={iconSize} className="text-gray-600 fill-gray-600" />
        ))}
        {hasHalfStar && (
          <StarHalf key="half" size={iconSize} className="text-gray-600 fill-gray-600" />
        )}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <Star
            key={`empty-${index}`}
            size={iconSize}
            className="text-gray-300 dark:text-gray-500"
          />
        ))}
      </div>
      {typeof rating === 'number' && (
        <span className={textClassName}>
          {rating.toFixed(1)}
          {reviewCount !== undefined &&
            ` (${reviewCount} ${reviewCount === 1 ? 'rating' : 'ratings'})`}
        </span>
      )}
    </div>
  );
};

export default RatingDisplay;
