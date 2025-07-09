'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import Image from 'next/image';

import { Modal } from './Modal';
import { fetchRecipes, FetchRecipesParams } from '@/api/recipe';
import { Recipe } from '@/types/recipe';
import { Profile } from '@/types/profile';
import { BUCKET_URL } from '@/constants';
import { formatTime } from '@/utils/formatters';
import DifficultyDisplay from './DifficultyDisplay';

interface SearchModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

// Type for recipes with author information (as returned by fetchRecipes)
type RecipeWithAuthor = Recipe & {
  author: Pick<Profile, 'id' | 'username' | 'avatar_url' | 'name'>;
};

export function SearchModal({ isOpen, onOpenChange }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [recipes, setRecipes] = useState<RecipeWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();

  const searchRecipes = useCallback(async (query: string) => {
    if (!query.trim()) {
      setRecipes([]);
      return;
    }

    setIsLoading(true);
    try {
      const params: FetchRecipesParams = {
        search: query.trim(),
        sortBy: 'created_at',
        sortDirection: 'desc',
      };
      const fetchedRecipes = await fetchRecipes(params);

      if (fetchedRecipes instanceof Error) {
        console.error('Failed to fetch recipes:', fetchedRecipes);
        setRecipes([]);
      } else {
        const recipesArray = Array.isArray(fetchedRecipes)
          ? (fetchedRecipes as RecipeWithAuthor[])
          : [];
        setRecipes(recipesArray);
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      setRecipes([]);
    }
    setIsLoading(false);
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (isTyping) {
      const timeoutId = setTimeout(() => {
        searchRecipes(searchTerm);
        setIsTyping(false);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, isTyping, searchRecipes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsTyping(true);
  };

  const handleResultClick = (recipe: RecipeWithAuthor) => {
    router.push(`/recipes/${recipe.slug}`);
    onOpenChange(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    setRecipes([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchRecipes(searchTerm);
      setIsTyping(false);
    }
  };

  // Focus on search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const searchInput = document.querySelector('#search-modal-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setRecipes([]);
      setIsTyping(false);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      handleClose={() => onOpenChange(false)}
      className="max-w-2xl max-h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col"
      ariaLabel="Search recipes"
      hideCloseButton={false}
    >
      {/* Search Input */}
      <div className="relative border-b border-gray-200 dark:border-gray-600">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        <input
          id="search-modal-input"
          type="search"
          placeholder="Search recipes, ingredients, or descriptions..."
          className="w-full bg-transparent px-16 py-6 text-base border-none shadow-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute top-1/2 right-6 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <kbd className="pointer-events-none absolute top-1/2 right-16 -translate-y-1/2 hidden select-none items-center rounded border bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400 sm:flex">
          esc
        </kbd>
      </div>

      {/* Results Section */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading || isTyping ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500 dark:text-gray-400">Searching...</div>
          </div>
        ) : searchTerm.trim() && recipes.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No recipes found for &quot;{searchTerm}&quot;
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                Try adjusting your search terms
              </p>
            </div>
          </div>
        ) : recipes.length > 0 ? (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Results ({recipes.length})
            </h3>
            {recipes.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => handleResultClick(recipe)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 flex-shrink-0 relative">
                    {recipe.image_thumbnail_url ? (
                      <Image
                        src={`${BUCKET_URL}/recipe_thumbnails/${recipe.image_thumbnail_url}`}
                        alt={recipe.name}
                        width={64}
                        height={64}
                        className="rounded-lg object-cover w-full h-full"
                      />
                    ) : (
                      <div className="bg-gray-200 dark:bg-gray-600 rounded-lg w-full h-full flex justify-center items-center">
                        <Search className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {recipe.name}
                    </h4>
                    {recipe.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                        {recipe.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(recipe.total_time)}
                      </span>
                      <div className="flex items-center">
                        <DifficultyDisplay difficulty={recipe.difficulty} iconSize={12} />
                      </div>
                      {recipe.author && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          by {recipe.author.name || recipe.author.username}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : searchTerm.trim() === '' ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Start typing to search for recipes
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
