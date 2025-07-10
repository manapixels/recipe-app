'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { updatePassword } from '@/api/auth';
import Spinner from '@/_components/ui/Spinner';

interface PasswordFormInput {
  password: string;
  currentPassword: string;
}

export default function PasswordForm() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormInput>();
  const onSubmit: SubmitHandler<PasswordFormInput> = async data => {
    setLoading(true);
    await updatePassword(data.password, data.currentPassword);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="password"
        id="currentPassword"
        className={`bg-white border border-gray-300 text-gray-900 text-md md:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${loading ? 'animate-pulse bg-gray-200' : ''}`}
        required
        disabled={loading}
        placeholder="Current password (required for security)"
        {...register('currentPassword', {
          required: true,
        })}
        aria-invalid={errors.currentPassword ? 'true' : 'false'}
      />
      {errors.currentPassword?.type === 'required' && (
        <p role="alert">Please enter your current password</p>
      )}
      <div className="mb-4"></div>
      <input
        type="password"
        id="password"
        className={`bg-white border border-gray-300 text-gray-900 text-md md:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${loading ? 'animate-pulse bg-gray-200' : ''}`}
        required
        disabled={loading}
        placeholder="New password"
        {...register('password', {
          required: true,
        })}
        aria-invalid={errors.password ? 'true' : 'false'}
      />
      {errors.password?.type === 'required' && <p role="alert">Please enter your password</p>}
      <div className="mb-2"></div>
      <div className="text-right">
        <button
          type="submit"
          className="text-base-700 bg-white border border-base-700 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded-full px-4 py-2 text-sm md:text-xs font-bold md:font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting && <Spinner className="mr-1.5" />}
          Change password
        </button>
      </div>
    </form>
  );
}
