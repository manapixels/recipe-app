'use client';

import { useState, useEffect, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { useUser } from '@/_contexts/UserContext';
import { useToast } from '@/_components/ui/Toasts/useToast';
import { addFavoriteRecipe, removeFavoriteRecipe } from '@/api/recipe';
import { cn } from '@/utils/cn';

interface FavoriteButtonProps {
  recipeId: string;
  initialIsFavorited: boolean;
  onToggle?: (isFavorited: boolean) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  recipeId,
  initialIsFavorited,
  onToggle,
  className,
  size = 'md',
}) => {
  const { user, loading: isUserLoading } = useUser();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited]);

  const handleFavoriteToggle = async () => {
    if (!user && !isUserLoading) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to favorite recipes.',
        variant: 'destructive',
      });
      return;
    }
    if (!user) return; // Should be covered by above, but as a safeguard

    startTransition(async () => {
      try {
        let result;
        if (isFavorited) {
          result = await removeFavoriteRecipe(recipeId);
        } else {
          result = await addFavoriteRecipe(recipeId);
        }

        if (result === true || (typeof result === 'object' && !(result instanceof Error))) {
          const newFavoriteStatus = !isFavorited;
          setIsFavorited(newFavoriteStatus);
          toast({
            description: newFavoriteStatus
              ? 'Recipe added to favorites!'
              : 'Recipe removed from favorites.',
            className: 'bg-green-600 text-white',
          });
          if (onToggle) {
            onToggle(newFavoriteStatus);
          }
        } else if (result instanceof Error) {
          toast({
            title: 'Error',
            description: result.message || 'Could not update favorite status.',
            variant: 'destructive',
          });
        } else {
          throw new Error('Unknown error toggling favorite');
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    });
  };

  const iconSizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  };

  return (
    <button
      onClick={handleFavoriteToggle}
      disabled={isPending || isUserLoading}
      className={cn(
        'p-2 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isFavorited
          ? 'text-red-500 bg-red-100 hover:bg-red-200 focus-visible:ring-red-500'
          : 'text-gray-400 hover:text-red-500 hover:bg-red-50 focus-visible:ring-red-400',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      aria-pressed={isFavorited}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={cn(iconSizeClasses[size], isFavorited ? 'fill-current' : 'fill-transparent')}
        strokeWidth={isFavorited ? 2 : 1.5}
      />
      <span className="sr-only">Favorite</span>
    </button>
  );
};
