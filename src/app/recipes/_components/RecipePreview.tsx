'use client';

import Image from 'next/image';
import { Recipe, Ingredient, Instruction, DIFFICULTY_LEVELS } from '@/types/recipe';
import {
  Clock,
  Users,
  BarChart3,
  Tag,
  Bookmark,
  Edit3,
  Trash2,
  Share2,
  Printer,
  ChefHat,
  Soup,
  Sandwich,
  Cake,
  Utensils,
} from 'lucide-react';

interface RecipePreviewProps {
  recipeData: Partial<Recipe>; // Use Partial as some fields might be missing during form input
  onClose: () => void;
  isVisible: boolean;
}

const CategoryIcon = ({ category }: { category?: string }) => {
  switch (category) {
    case 'sweets':
      return <Cake className="w-5 h-5 mr-2 text-gray-600" />;
    case 'breads':
      return <Sandwich className="w-5 h-5 mr-2 text-gray-600" />;
    // Add more cases for other categories
    default:
      return <Soup className="w-5 h-5 mr-2 text-gray-600" />;
  }
};

export const RecipePreview: React.FC<RecipePreviewProps> = ({ recipeData, onClose, isVisible }) => {
  if (!isVisible) return null;

  const difficultyEmoji = recipeData.difficulty ? DIFFICULTY_LEVELS[recipeData.difficulty] : '-';

  // Ensure ingredients and instructions are arrays, even if undefined in partial data
  const ingredients = Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [];
  const instructions = Array.isArray(recipeData.instructions) ? recipeData.instructions : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recipe Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-1.5"
            aria-label="Close preview"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {recipeData.image_banner_url && (
            <div className="w-full h-48 sm:h-64 md:h-80 rounded-lg overflow-hidden relative bg-gray-200 dark:bg-gray-700">
              <Image
                src={recipeData.image_banner_url}
                alt={recipeData.name || 'Recipe banner'}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 ease-in-out hover:scale-105"
              />
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {recipeData.name || 'Untitled Recipe'}
          </h1>

          {recipeData.description && (
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              {recipeData.description}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <Clock className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
              <span>
                Total Time: <strong>{recipeData.total_time || 'N/A'} min</strong>
              </span>
            </div>
            <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <Users className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
              <span>
                Servings: <strong>{recipeData.servings || 'N/A'}</strong>
              </span>
            </div>
            <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <BarChart3 className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
              <span>
                Difficulty: <strong className="text-lg">{difficultyEmoji}</strong>
              </span>
            </div>
            {recipeData.category && (
              <div className="flex items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg col-span-2 sm:col-span-1">
                <CategoryIcon category={recipeData.category} />
                <span>
                  Category: <strong>{recipeData.category}</strong>
                  {recipeData.subcategory && ` (${recipeData.subcategory})`}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recipeData.image_thumbnail_url && (
              <div className="md:col-span-1">
                <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden relative bg-gray-200 dark:bg-gray-700">
                  <Image
                    src={recipeData.image_thumbnail_url}
                    alt={recipeData.name || 'Recipe thumbnail'}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              </div>
            )}

            <div className={recipeData.image_thumbnail_url ? 'md:col-span-2' : 'md:col-span-3'}>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 border-b pb-2">
                Ingredients
              </h3>
              {ingredients.length > 0 ? (
                <ul className="list-disc list-inside space-y-1.5 text-gray-700 dark:text-gray-300 pl-2">
                  {ingredients.map((ing, index) => (
                    <li key={index}>
                      {ing.amount && `${ing.amount}${ing.unit || ''} `}
                      {ing.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No ingredients listed.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 border-b pb-2">
              Instructions
            </h3>
            {instructions.length > 0 ? (
              <ol className="space-y-4 text-gray-700 dark:text-gray-300">
                {instructions.map((instr, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 mr-3 h-7 w-7 bg-base-500 text-white dark:bg-base-600 dark:text-gray-100 rounded-full flex items-center justify-center font-semibold">
                      {instr.step || index + 1}
                    </span>
                    <p className="leading-relaxed">{instr.content}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No instructions provided.</p>
            )}
          </div>
        </div>
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-base-600 hover:bg-base-700 text-white rounded-lg font-medium"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
