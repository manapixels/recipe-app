'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/_components/ui/Button';
import { Modal } from '@/_components/ui/Modal';
import { useToast } from '@/_components/ui/Toasts/useToast';
import { forkRecipe } from '@/api/recipe-versioning';
import { Recipe } from '@/types/recipe';
import { RecipeVersion } from '@/types/recipe-versioning';
import { GitFork, Lock, Unlock } from 'lucide-react';

interface RecipeForkProps {
  recipe: Recipe;
  currentVersion?: RecipeVersion;
  onSuccess?: (newVersion: RecipeVersion) => void;
}

export function RecipeFork({ recipe, currentVersion, onSuccess }: RecipeForkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [changeSummary, setChangeSummary] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [plannedChanges, setPlannedChanges] = useState('');

  const router = useRouter();
  const { toast } = useToast();

  const handleFork = async () => {
    if (!changeSummary.trim()) {
      toast({
        title: 'Please provide a summary of your changes',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await forkRecipe({
        original_recipe_id: currentVersion?.original_recipe_id || recipe.id,
        parent_version_id: currentVersion?.id,
        recipe_data: {
          ...recipe,
          name: `${recipe.name} (Fork)`,
          // User will edit the forked recipe after creation
        },
        change_summary: changeSummary,
        is_public: isPublic,
      });

      if (result.success && result.data) {
        toast({
          title: 'Recipe forked successfully!',
          variant: 'default',
        });
        setIsOpen(false);

        if (onSuccess) {
          onSuccess(result.data);
        }

        // Navigate to edit the forked recipe
        router.push(`/recipes/${result.data.recipe?.slug}/edit`);
      } else {
        toast({
          title: result.error || 'Failed to fork recipe',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'An error occurred while forking the recipe',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setChangeSummary('');
    setIsPublic(true);
    setPlannedChanges('');
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="gap-2">
        <GitFork className="h-4 w-4" />
        Fork Recipe
      </Button>

      <Modal
        isOpen={isOpen}
        handleClose={() => {
          setIsOpen(false);
          resetForm();
        }}
        ariaLabel="Fork Recipe"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Fork &ldquo;{recipe.name}&rdquo;</h3>
            <p className="text-gray-600 text-sm">
              Create your own version of this recipe. You&apos;ll be able to modify ingredients,
              instructions, and add your own notes.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Change Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                value={changeSummary}
                onChange={e => setChangeSummary(e.target.value)}
                placeholder="Briefly describe what you plan to change or improve..."
                className="w-full p-3 border rounded-lg resize-none"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Planned Changes (Optional)</label>
              <textarea
                value={plannedChanges}
                onChange={e => setPlannedChanges(e.target.value)}
                placeholder="Detail what specific changes you want to make..."
                className="w-full p-3 border rounded-lg resize-none"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50"
              >
                {isPublic ? (
                  <>
                    <Unlock className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Public</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Private</span>
                  </>
                )}
              </button>
              <div className="text-sm text-gray-600">
                {isPublic
                  ? 'Others can view and fork your version'
                  : 'Only you can view this version'}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFork}
              disabled={isLoading || !changeSummary.trim()}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Forking...
                </>
              ) : (
                <>
                  <GitFork className="h-4 w-4" />
                  Fork Recipe
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
