'use client';

import { useState } from 'react';
import { Button } from '@/_components/ui/Button';
import { DiaryForm } from './DiaryForm';
import { DiaryEntry, DIARY_ENTRY_TYPES } from '@/types/recipe-versioning';
import { formatDistanceToNow } from 'date-fns';
import {
  BookOpen,
  ChefHat,
  Clock,
  CheckCircle,
  Lightbulb,
  Edit2,
  Trash2,
  Calendar,
  Plus,
} from 'lucide-react';
import { deleteDiaryEntry } from '@/api/recipe-versioning';
import { useToast } from '@/_components/ui/Toasts/useToast';

interface DiaryTimelineProps {
  versionId: string;
  entries: DiaryEntry[];
  onEntryUpdate: (entries: DiaryEntry[]) => void;
  canEdit?: boolean;
}

const ENTRY_ICONS = {
  pre_cooking: ChefHat,
  during_cooking: Clock,
  post_cooking: CheckCircle,
  next_time: Lightbulb,
};

export function DiaryTimeline({
  versionId,
  entries,
  onEntryUpdate,
  canEdit = true,
}: DiaryTimelineProps) {
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const { toast } = useToast();

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleAddEntry = () => {
    setSelectedEntry(null);
    setIsFormOpen(true);
  };

  const handleEditEntry = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setIsFormOpen(true);
  };

  const handleDeleteEntry = async (entryId: string) => {
    setIsDeleting(entryId);

    try {
      const result = await deleteDiaryEntry(entryId);

      if (result.success) {
        const updatedEntries = entries.filter(entry => entry.id !== entryId);
        onEntryUpdate(updatedEntries);
        toast({
          title: 'Diary entry deleted',
          variant: 'default',
        });
      } else {
        toast({
          title: result.error || 'Failed to delete entry',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'An error occurred while deleting the entry',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleFormSuccess = (entry: DiaryEntry) => {
    if (selectedEntry) {
      // Update existing entry
      const updatedEntries = entries.map(e => (e.id === entry.id ? entry : e));
      onEntryUpdate(updatedEntries);
    } else {
      // Add new entry
      onEntryUpdate([entry, ...entries]);
    }
  };

  if (sortedEntries.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No diary entries yet</h3>
        <p className="text-gray-600 mb-4">
          Start documenting your cooking journey with this recipe
        </p>
        {canEdit && (
          <Button onClick={handleAddEntry} className="gap-2">
            <Plus className="h-4 w-4" />
            Add First Entry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cooking Diary</h3>
        {canEdit && (
          <Button onClick={handleAddEntry} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Entry
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {sortedEntries.map(entry => {
          const IconComponent = ENTRY_ICONS[entry.entry_type];
          const config = DIARY_ENTRY_TYPES[entry.entry_type];

          return (
            <div
              key={entry.id}
              className="relative pl-6 pb-4 border-l-2 border-gray-200 last:border-l-0"
            >
              {/* Timeline dot */}
              <div
                className={`absolute -left-2 top-0 w-4 h-4 rounded-full bg-${config.color}-500 border-2 border-white`}
              />

              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-4 w-4 text-${config.color}-600`} />
                    <span className={`text-sm font-medium text-${config.color}-700`}>
                      {config.label}
                    </span>
                    {entry.cooking_date && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(entry.cooking_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEntry(entry)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                        disabled={isDeleting === entry.id}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        {isDeleting === entry.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                  {entry.creator && (
                    <span className="ml-2">by {entry.creator.name || entry.creator.username}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <DiaryForm
        versionId={versionId}
        entry={selectedEntry || undefined}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedEntry(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
