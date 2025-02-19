'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/_components/ui/Toasts/useToast';

const URLToaster: React.FC = () => {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = new URL(window.location.href);

    const success = searchParams.get('success');
    const successMessage = searchParams.get('success_description');

    if (success !== null) {
      toast({
        title: success,
        description: successMessage || 'Operation completed successfully.',
        className: 'bg-green-700 text-white border-transparent',
      });

      // Remove the success query params after displaying the toast
      url.searchParams.delete('success');
      url.searchParams.delete('success_description');
    }

    const error = searchParams.get('error');
    const errorMessage = searchParams.get('error_description');

    if (error !== null) {
      toast({
        title: error,
        description: errorMessage || 'An error occurred during the operation.',
        className: 'bg-red-700 text-white border-transparent',
      });

      // Remove the error query params after displaying the toast
      url.searchParams.delete('error');
      url.searchParams.delete('error_description');
    }

    // Ensure the URL is updated without reloading the page
    window.history.replaceState(null, '', url.toString());
  }, [searchParams, toast]);

  return null;
};

const URLToasterWithSuspense = () => {
  return (
    <Suspense>
      <URLToaster />
    </Suspense>
  );
};

export default URLToasterWithSuspense;
