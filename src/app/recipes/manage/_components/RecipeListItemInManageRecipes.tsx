import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { BUCKET_URL } from '@/constants';
import { Recipe } from '@/types/recipe';
// import { EditRecipeForm } from './EditRecipeForm'; // Old form
import { RecipeForm } from '../../_components/RecipeForm'; // Unified form
import { updateRecipeStatus } from '@/api/recipe';
import { useToast } from '@/_components/ui/Toasts/useToast';
import { CustomSelect } from '@/_components/ui/Select';
import DifficultyDisplay from '@/_components/ui/DifficultyDisplay'; // Updated path
import { formatTime } from '@/utils/formatters'; // Import centralized function

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

  // Helper function to format time
  // const formatTime = (minutes: number) => { ... }; // Removed local definition

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
      // Also update the recipe in the parent list to reflect status change immediately if needed
      // This might require refetching or smarter state update in parent
      updateRecipeInList({ ...recipe, status: status as Recipe['status'] });
    };

    if (status !== recipe.status) {
      updateStatus();
    }
  }, [status, recipe, toast, updateRecipeInList]); // Added recipe and updateRecipeInList to dependency array

  const handleEditClick = () => {
    const modalContent = (
      <div className="p-4 sm:p-6">
        <RecipeForm
          mode="edit"
          initialData={recipe}
          onSuccess={updatedRecipe => {
            updateRecipeInList(updatedRecipe);
            closeModal();
          }}
          onCancel={closeModal}
        />
      </div>
    );
    openModal(modalContent);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
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
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg w-full h-full flex justify-center items-center">
            <Image
              src="/recipe-placeholder.svg"
              alt="Recipe"
              width="100"
              height="100"
              className="grayscale opacity-20 dark:opacity-50"
            />
          </div>
        )}
      </div>

      <div className="min-w-0 py-2 flex-grow flex flex-col md:gap-4 justify-between">
        <div>
          {/* Recipe name & tags */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <Link
              href={`/recipes/${recipe?.slug}`}
              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-base-600 dark:hover:text-base-400 truncate mb-1 sm:mb-0"
            >
              {recipe?.name}
            </Link>
            <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-0">
              <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-200 dark:ring-gray-600/20 capitalize">
                {recipe.category}
              </span>
              <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-200 dark:ring-gray-600/20 capitalize">
                {recipe.subcategory.replace('.', ' / ')}
              </span>
            </div>
          </div>

          {/* Recipe details */}
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mt-2">
            <p>Time: {formatTime(recipe.total_time)}</p>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold">Difficulty:</span>
              <DifficultyDisplay difficulty={recipe.difficulty} iconSize={14} />
            </div>
            <p>Servings: {recipe.servings}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <button
            onClick={handleEditClick}
            className="text-white bg-base-600 hover:bg-base-700 focus-visible:outline-base-600 dark:bg-base-500 dark:hover:bg-base-600 dark:focus-visible:outline-base-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
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
