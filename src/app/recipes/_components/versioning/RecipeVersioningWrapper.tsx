'use client';

import { useState, useEffect, useCallback } from 'react';
import { Recipe } from '@/types/recipe';
import { RecipeVersionWithDetails, DiaryEntry } from '@/types/recipe-versioning';
import { RecipeFork } from './RecipeFork';
import { VersionHistory } from './VersionHistory';
import { DiaryTimeline } from './DiaryTimeline';
import { getRecipeVersion } from '@/api/recipe-versioning';
import { useToast } from '@/_components/ui/Toasts/useToast';
import { Button } from '@/_components/ui/Button';
import {
  GitBranch,
  History,
  BookOpen,
  Star,
  Clock,
  User,
  GitFork,
  MessageSquare,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SUCCESS_RATINGS } from '@/types/recipe-versioning';

interface RecipeVersioningWrapperProps {
  recipe: Recipe;
  initialVersionId?: string;
}

export function RecipeVersioningWrapper({
  recipe,
  initialVersionId,
}: RecipeVersioningWrapperProps) {
  const [currentVersion, setCurrentVersion] = useState<RecipeVersionWithDetails | null>(null);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);

  const { toast } = useToast();

  const loadVersionDetails = useCallback(
    async (versionId: string) => {
      setIsLoading(true);

      try {
        const result = await getRecipeVersion(versionId);

        if (result.success && result.data) {
          setCurrentVersion(result.data);
          setDiaryEntries(result.data.diary_entries || []);
        } else {
          toast({
            title: result.error || 'Failed to load version details',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'An error occurred while loading version details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (initialVersionId) {
      loadVersionDetails(initialVersionId);
    } else {
      setIsLoading(false);
    }
  }, [initialVersionId, loadVersionDetails]);

  const handleDiaryEntriesUpdate = (entries: DiaryEntry[]) => {
    setDiaryEntries(entries);
  };

  const getSuccessRatingDisplay = (rating?: number) => {
    if (!rating) return null;

    const ratingInfo = SUCCESS_RATINGS.find(r => r.value === rating);
    if (!ratingInfo) return null;

    return (
      <div className="flex items-center gap-1 text-sm">
        <Star className="h-4 w-4 text-yellow-500 fill-current" />
        <span className="text-gray-600">
          {ratingInfo.emoji} {ratingInfo.label}
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Version Info Header */}
      {currentVersion && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitBranch className="h-5 w-5 text-blue-600" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Version {currentVersion.version_number}</span>
                  {currentVersion.parent_version_id && (
                    <span className="text-sm text-gray-600">
                      (forked from v{currentVersion.parent_version?.version_number || 'original'})
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{currentVersion.change_summary}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getSuccessRatingDisplay(currentVersion.success_rating)}
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <GitFork className="h-4 w-4" />
                <span>{currentVersion.fork_count}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{currentVersion.creator?.name || currentVersion.creator?.username}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(currentVersion.created_at), { addSuffix: true })}
              </span>
            </div>
            {currentVersion.total_diary_entries > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{currentVersion.total_diary_entries} diary entries</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <RecipeFork recipe={recipe} currentVersion={currentVersion || undefined} />

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVersionHistoryOpen(true)}
          className="gap-2"
        >
          <History className="h-4 w-4" />
          Version History
        </Button>
      </div>

      {/* Diary Section */}
      {diaryEntries.length > 0 || currentVersion ? (
        <div className="border rounded-lg p-6">
          <DiaryTimeline
            versionId={currentVersion?.id || recipe.id}
            entries={diaryEntries}
            onEntryUpdate={handleDiaryEntriesUpdate}
          />
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Cooking Journey</h3>
          <p className="text-gray-600 mb-4">
            Fork this recipe to make it your own and start documenting your cooking experiences
          </p>
          <RecipeFork recipe={recipe} />
        </div>
      )}

      {/* Version History Modal */}
      <VersionHistory
        originalRecipeId={currentVersion?.original_recipe_id || recipe.id}
        currentVersionId={currentVersion?.id}
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
      />
    </div>
  );
}
