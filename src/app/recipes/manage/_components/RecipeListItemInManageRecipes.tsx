import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { BUCKET_URL } from '@/constants';
import { Recipe, DIFFICULTY_LEVELS } from '@/types/recipe';
import { EditRecipeForm } from './EditRecipeForm';
import { updateRecipeStatus } from '@/api/recipe';
import { useToast } from '@/_components/ui/Toasts/useToast';
import { CustomSelect } from '@/_components/ui/Select';

export const RecipeListItemInManageRecipes = ({
  recipe,
  updateRecipeInList,
  openModal,
  closeModal,
}: {
  recipe: Recipe;
  updateRecipeInList: (recipe: Recipe) => void;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
}) => {
  const [status, setStatus] = useState<string>(recipe.status);
  const { toast } = useToast();

  // Helper function to format difficulty level
  const formatDifficulty = (level: number) => {
    return DIFFICULTY_LEVELS[level] || 'Unknown';
  };

  // Helper function to format time
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  useEffect(() => {
    setStatus(recipe.status);
  }, [recipe.status]);

  useEffect(() => {
    const updateStatus = async () => {
      await updateRecipeStatus(recipe.id, status);
      toast({
        title: 'Success!',
        description: `Recipe status updated`,
        className: 'bg-green-700 text-white border-transparent',
      });
    };

    if (status !== recipe.status) {
      updateStatus();
    }
  }, [status, recipe.status, toast, recipe.id]);

  const handleEditClick = () => {
    const modalContent = (
      <EditRecipeForm recipe={recipe} onSuccess={updateRecipeInList} closeModal={closeModal} />
    );
    openModal(modalContent);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg">
      <div className="w-full md:w-48 relative aspect-square flex-shrink-0">
        {recipe?.image_thumbnail_url ? (
          <Image
            src={`${BUCKET_URL}/recipe_thumbnails/${recipe?.image_thumbnail_url}`}
            alt={`${recipe?.name}`}
            className="rounded-lg object-cover w-full h-full"
            width="300"
            height="300"
          />
        ) : (
          <div className="bg-gray-200 rounded-lg w-full h-full flex justify-center items-center">
            <Image
              src="/recipe-placeholder.svg"
              alt="Recipe"
              width="100"
              height="100"
              className="grayscale opacity-20"
            />
          </div>
        )}
      </div>

      <div className="min-w-0 py-2 flex-grow flex flex-col md:gap-4 justify-between">
        <div>
          {/* Recipe name & tags */}
          <div className="flex gap-4">
            <Link
              href={`/recipes/${recipe?.slug}`}
              className="truncate text-md md:text-sm font-semibold mb-1"
            >
              {recipe?.name}
            </Link>
            <div className="items-center gap-2 mb-2 hidden md:flex">
              <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                {recipe.category}
              </span>
              <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                {recipe.subcategory.replace('.', ' / ')}
              </span>
            </div>
          </div>

          {/* Recipe details */}
          <div className="text-sm text-gray-500 space-y-1">
            <p>Time: {formatTime(recipe.total_time)}</p>
            <p>Difficulty: {formatDifficulty(recipe.difficulty)}</p>
            <p>Servings: {recipe.servings}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={handleEditClick}
            className="text-white bg-base-700 hover:bg-base-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2"
          >
            Edit
          </button>
          <CustomSelect
            value={status}
            onChange={value => setStatus(value)}
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>
      </div>
    </div>
  );
};
