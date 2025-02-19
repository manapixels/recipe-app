'use client';

import { useEffect, useState } from 'react';

import { Modal } from '@/_components/ui/Modal';
import { useUser } from '@/_contexts/UserContext';
import { fetchUserRecipes } from '@/api/recipe';
import { Recipe } from '@/types/recipe';
import { RecipeListItemInManageRecipes } from './RecipeListItemInManageRecipes';
import RecipeListItemSkeleton from '@/_components/ui/Skeletons/RecipeListItemSkeleton';

export default function RecipeListInManageRecipes() {
  const { user } = useUser();
  const [draftRecipes, setDraftRecipes] = useState<Recipe[]>([]);
  const [publishedRecipes, setPublishedRecipes] = useState<Recipe[]>([]);
  const [archivedRecipes, setArchivedRecipes] = useState<Recipe[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      if (user?.id) {
        const result = await fetchUserRecipes(user.id);
        if (result) {
          const recipes = result as Recipe[];

          setDraftRecipes(recipes.filter(recipe => recipe.status === 'draft'));
          setPublishedRecipes(recipes.filter(recipe => recipe.status === 'published'));
          setArchivedRecipes(recipes.filter(recipe => recipe.status === 'archived'));
        }
      }
      setIsLoading(false);
    };
    fetchRecipes();
  }, [user]);

  const updateRecipeInList = (updatedRecipe: Recipe) => {
    const updateList = (recipes: Recipe[]) =>
      recipes.map(recipe => (recipe.id === updatedRecipe.id ? updatedRecipe : recipe));
    setDraftRecipes(currentRecipes => updateList(currentRecipes));
    setPublishedRecipes(currentRecipes => updateList(currentRecipes));
    setArchivedRecipes(currentRecipes => updateList(currentRecipes));
  };

  const openModal = (content: React.ReactNode) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  return (
    <div className={`grid grid-cols-1 gap-6 md:bg-gray-50 rounded-2xl md:p-8`}>
      <div>
        <h2 className="font-medium text-md md:text-xl text-gray-600 md:text-black mb-4">
          Draft Recipes
        </h2>
        {isLoading && draftRecipes.length === 0 && <RecipeListItemSkeleton />}
        <div className="grid grid-cols-1 gap-7 md:gap-4 bg-gray-50 rounded-2xl py-2">
          {draftRecipes.map((recipe, i) => (
            <RecipeListItemInManageRecipes
              recipe={recipe}
              key={i}
              updateRecipeInList={updateRecipeInList}
              openModal={openModal}
              closeModal={closeModal}
            />
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-medium text-md md:text-xl text-gray-600 md:text-black mb-4">
          Published Recipes
        </h2>
        {isLoading && publishedRecipes.length === 0 && <RecipeListItemSkeleton />}
        <div className="grid grid-cols-1 gap-7 md:gap-4 bg-gray-50 rounded-2xl py-2">
          {publishedRecipes.map((recipe, i) => (
            <RecipeListItemInManageRecipes
              recipe={recipe}
              key={i}
              updateRecipeInList={updateRecipeInList}
              openModal={openModal}
              closeModal={closeModal}
            />
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-medium text-md md:text-xl text-gray-600 md:text-black mb-4">
          Archived Recipes
        </h2>
        {isLoading && archivedRecipes.length === 0 && <RecipeListItemSkeleton />}
        <div className="grid grid-cols-1 gap-7 md:gap-4 bg-gray-50 rounded-2xl py-2">
          {archivedRecipes.map((recipe, i) => (
            <RecipeListItemInManageRecipes
              recipe={recipe}
              key={i}
              updateRecipeInList={updateRecipeInList}
              openModal={openModal}
              closeModal={closeModal}
            />
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} handleClose={closeModal}>
        {modalContent}
      </Modal>
    </div>
  );
}
