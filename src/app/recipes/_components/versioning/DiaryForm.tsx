'use client';

import { useState } from 'react';
import { Button } from '@/_components/ui/Button';
import { Modal } from '@/_components/ui/Modal';
import { useToast } from '@/_components/ui/Toasts/useToast';
import { createDiaryEntry, updateDiaryEntry } from '@/api/recipe-versioning';
import { DiaryEntry, DiaryEntryFormData, DIARY_ENTRY_TYPES } from '@/types/recipe-versioning';
import { Calendar, Save } from 'lucide-react';

interface DiaryFormProps {
  versionId: string;
  entry?: DiaryEntry;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (entry: DiaryEntry) => void;
}

export function DiaryForm({ versionId, entry, isOpen, onClose, onSuccess }: DiaryFormProps) {
  const [formData, setFormData] = useState<DiaryEntryFormData>({
    entry_type: entry?.entry_type || 'pre_cooking',
    content: entry?.content || '',
    cooking_date: entry?.cooking_date || new Date().toISOString().split('T')[0],
    images: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const isEditing = !!entry;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      toast({ title: 'Please enter some content for your diary entry', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      let result;

      if (isEditing) {
        result = await updateDiaryEntry(entry.id, {
          content: formData.content,
          cooking_date: formData.cooking_date,
        });
      } else {
        result = await createDiaryEntry({
          recipe_version_id: versionId,
          entry_type: formData.entry_type,
          content: formData.content,
          cooking_date: formData.cooking_date,
        });
      }

      if (result.success && result.data) {
        toast({
          title: isEditing ? 'Diary entry updated!' : 'Diary entry added!',
          variant: 'default',
        });
        onSuccess(result.data);
        onClose();
        resetForm();
      } else {
        toast({
          title: result.error || 'Failed to save diary entry',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'An error occurred while saving the diary entry',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      entry_type: 'pre_cooking',
      content: '',
      cooking_date: new Date().toISOString().split('T')[0],
      images: undefined,
    });
  };

  const handleClose = () => {
    onClose();
    if (!isEditing) {
      resetForm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      handleClose={handleClose}
      ariaLabel={isEditing ? 'Edit Diary Entry' : 'Add Diary Entry'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {isEditing ? 'Edit Diary Entry' : 'Add Diary Entry'}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {isEditing
              ? 'Update your cooking notes and observations'
              : 'Document your cooking experience, observations, and thoughts about this recipe'}
          </p>
        </div>

        {!isEditing && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Entry Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(DIARY_ENTRY_TYPES).map(([type, config]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, entry_type: type as any })}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    formData.entry_type === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-${config.color}-600`}>{/* Icon would go here */}</span>
                    <span className="font-medium text-sm">{config.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write about your cooking experience, what worked well, what you'd change next time..."
            className="w-full p-3 border rounded-lg resize-none"
            rows={6}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Cooking Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={formData.cooking_date}
              onChange={e => setFormData({ ...formData, cooking_date: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !formData.content.trim()} className="gap-2">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditing ? 'Update' : 'Add'} Entry
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
