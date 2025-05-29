'use client'; // For hooks in RecipeForm and potential client-side logic here

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // For accessing slug and navigation

import { RecipeForm } from '../../_components/RecipeForm'; // Adjusted path
import { fetchRecipe } from '@/api/recipe';
import { Recipe as FullRecipeType } from '@/types/recipe';
import Spinner from '@/_components/ui/Spinner';
import { useToast } from '@/_components/ui/Toasts/useToast';

export default function EditRecipePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const slug = typeof params.slug === 'string' ? params.slug : null;

  const [recipe, setRecipe] = useState<FullRecipeType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      const loadRecipe = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedRecipe = await fetchRecipe(slug);
          if (fetchedRecipe && !(fetchedRecipe instanceof Error)) {
            setRecipe(fetchedRecipe as FullRecipeType);
          } else {
            setError('Recipe not found or failed to load.');
            toast({
              title: 'Error',
              description: 'Recipe not found or failed to load.',
              variant: 'destructive',
            });
          }
        } catch (e: any) {
          console.error('Error fetching recipe for edit:', e);
          setError('An unexpected error occurred while loading the recipe.');
          toast({
            title: 'Error',
            description: e.message || 'Failed to load recipe data.',
            variant: 'destructive',
          });
        }
        setIsLoading(false);
      };
      loadRecipe();
    } else {
      // Handle case where slug is not available or invalid - though Next.js routing should prevent this
      setIsLoading(false);
      setError('Invalid recipe identifier.');
      toast({
        title: 'Error',
        description: 'Invalid recipe identifier provided.',
        variant: 'destructive',
      });
      // Optionally redirect
      // router.push('/404');
    }
  }, [slug, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Spinner className="h-12 w-12 text-base-600" />
        <p className="ml-3 text-gray-600 dark:text-gray-400 text-lg">Loading recipe details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-red-600">Error Loading Recipe</h2>
        <p className="text-gray-700 mt-2">{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-4 py-2 bg-base-600 text-white rounded-lg hover:bg-base-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!recipe) {
    // This case should ideally be covered by error state, but as a fallback
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-gray-700">Recipe Data Not Available</h2>
        <p className="text-gray-600 mt-2">
          The recipe data could not be loaded. It might have been deleted or an error occurred.
        </p>
        <button
          onClick={() => router.push('/recipes/manage')}
          className="mt-6 px-4 py-2 bg-base-600 text-white rounded-lg hover:bg-base-700"
        >
          Back to My Recipes
        </button>
      </div>
    );
  }

  return (
    <section className="bg-white dark:bg-gray-900 max-w-4xl px-4 mx-auto lg:py-12">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Your Recipe</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Make changes and update your masterpiece.
        </p>
      </div>
      <RecipeForm
        mode="edit"
        initialData={recipe}
        onSuccess={updatedRecipe => {
          // Navigate to the updated recipe's page or manage page
          toast({
            description: 'Recipe updated successfully!',
            className: 'bg-green-700 text-white',
          });
          router.push(`/recipes/${updatedRecipe.slug}`);
        }}
        onCancel={() => {
          router.push(`/recipes/${recipe.slug}`); // Go back to recipe view page
        }}
      />
    </section>
  );
}
