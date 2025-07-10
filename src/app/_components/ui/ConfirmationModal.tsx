'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';
import Spinner from './Spinner';

interface ConfirmationFormInput {
  confirmText: string;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  confirmationText?: string; // What user needs to type, defaults to "DELETE"
  actionButtonText?: string; // Text for the confirm button
  isDestructive?: boolean; // Whether this is a destructive action (red styling)
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmationText = 'DELETE',
  actionButtonText = 'Delete',
  isDestructive = true,
}: ConfirmationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ConfirmationFormInput>({
    defaultValues: { confirmText: '' },
  });

  const confirmText = watch('confirmText');
  const isValid = confirmText === confirmationText;

  const onSubmit: SubmitHandler<ConfirmationFormInput> = async () => {
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onConfirm();
      handleClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} backdropDismiss={!isSubmitting}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
          <div
            className={`p-2 rounded-full ${isDestructive ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}
          >
            <AlertTriangle
              className={`h-6 w-6 ${isDestructive ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-6">{description}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type{' '}
                <span className="font-bold text-red-600 dark:text-red-400">{confirmationText}</span>{' '}
                to confirm:
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder={`Type "${confirmationText}" here`}
                disabled={isSubmitting}
                {...register('confirmText', {
                  required: true,
                  validate: value =>
                    value === confirmationText || `Please type "${confirmationText}" exactly`,
                })}
              />
              {errors.confirmText && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmText.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className={`flex-1 px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  isDestructive
                    ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300'
                    : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-300'
                }`}
              >
                {isSubmitting && <Spinner className="h-4 w-4" />}
                {actionButtonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
