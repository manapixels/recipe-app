'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/_components/ui/Button';
import { Modal } from '@/_components/ui/Modal';
import { RecipeVersion, SUCCESS_RATINGS } from '@/types/recipe-versioning';
import { getRecipeVersionHistory } from '@/api/recipe-versioning';
import { formatDistanceToNow } from 'date-fns';
import { History, GitBranch, User, Calendar, Star, Eye, GitFork } from 'lucide-react';
import Link from 'next/link';

interface VersionHistoryProps {
  originalRecipeId: string;
  currentVersionId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VersionHistory({
  originalRecipeId,
  currentVersionId,
  isOpen,
  onClose,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<RecipeVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVersionHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getRecipeVersionHistory(originalRecipeId);

      if (result.success && result.data) {
        setVersions(result.data);
      } else {
        setError(result.error || 'Failed to load version history');
      }
    } catch (err) {
      setError('An error occurred while loading version history');
    } finally {
      setIsLoading(false);
    }
  }, [originalRecipeId]);

  useEffect(() => {
    if (isOpen && originalRecipeId) {
      loadVersionHistory();
    }
  }, [isOpen, originalRecipeId, loadVersionHistory]);

  const getSuccessRatingDisplay = (rating?: number) => {
    if (!rating) return null;

    const ratingInfo = SUCCESS_RATINGS.find(r => r.value === rating);
    if (!ratingInfo) return null;

    return (
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3 text-yellow-500 fill-current" />
        <span className="text-xs text-gray-600">
          {ratingInfo.emoji} {ratingInfo.label}
        </span>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} handleClose={onClose} ariaLabel="Version History">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Version History</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <History className="h-4 w-4" />
          <span>All versions of this recipe</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <Button onClick={loadVersionHistory} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8">
            <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No versions found</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className={`p-4 rounded-lg border transition-colors ${
                  version.id === currentVersionId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">v{version.version_number}</span>
                      {version.id === currentVersionId && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          Current
                        </span>
                      )}
                      {index === 0 && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Latest
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 mb-2">{version.change_summary}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{version.creator?.name || version.creator?.username}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      {version.fork_count > 0 && (
                        <div className="flex items-center gap-1">
                          <GitFork className="h-3 w-3" />
                          <span>{version.fork_count}</span>
                        </div>
                      )}
                    </div>

                    {version.success_rating && (
                      <div className="mt-2">{getSuccessRatingDisplay(version.success_rating)}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {version.recipe?.slug && (
                      <Link href={`/recipes/${version.recipe.slug}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
