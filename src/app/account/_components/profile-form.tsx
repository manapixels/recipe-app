'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

import Spinner from '@/_components/ui/Spinner';
import { fetchUserProfile, updateUserProfile } from '@/api/profile';
import { calculateAge } from '@/helpers/date';
import { Profile } from '@/types/profile';
import { useToast } from '@/_components/ui/Toasts/useToast';

interface AuthFormInput {
  email: string;
  birthyear: number;
  birthmonth: number;
  name: string;
}

export default function ProfileForm({ userId }: { userId: string | undefined }) {
  const [loading, setLoading] = useState(true);
  const [currProfile, setCurrProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profile = await fetchUserProfile(userId);
        console.log(profile);
        setCurrProfile(profile as Profile);
        reset(profile as AuthFormInput);
      } catch (error) {
        toast({
          title: 'Error!',
          description: 'Error loading user data!',
          className: 'bg-red-700 text-white border-transparent',
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  async function updateProfile(user: Profile) {
    try {
      setLoading(true);
      await updateUserProfile(user);
      toast({
        title: 'Success!',
        description: 'Your profile has been updated',
        className: 'bg-green-700 text-white border-transparent',
      });
    } catch (error) {
      toast({
        title: 'Error!',
        description: 'Error updating the data!',
        className: 'bg-red-700 text-white border-transparent',
      });
    } finally {
      setLoading(false);
    }
  }

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormInput>();
  const onSubmit: SubmitHandler<AuthFormInput> = async (data: AuthFormInput) => {
    console.log(data);
    await updateProfile({ ...currProfile, ...data } as Profile);
  };

  return (
    <form
      className="p-5 md:p-10 border border-gray-300 rounded-lg bg-gray-50"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="mb-2">
        <label htmlFor="name" className="text-gray-500 text-sm md:text-xs">
          Your name
        </label>
        <input
          type="text"
          id="name"
          className={`bg-white border border-gray-300 text-gray-900text-md md:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${loading ? 'animate-pulse bg-gray-200' : ''}`}
          required
          placeholder="Name"
          {...register('name', {
            required: true,
          })}
          aria-invalid={errors.name ? 'true' : 'false'}
          disabled={loading}
        />
        {errors.name?.type === 'required' && <p role="alert">Please enter your name</p>}
        {errors.name?.type === 'pattern' && <p role="alert">Please enter a valid name</p>}
      </div>

      <div className="mb-2">
        <label className="text-gray-500 text-sm md:text-xs">Age</label>
        <input
          type="text"
          id="name"
          value={calculateAge(currProfile?.birthyear, currProfile?.birthmonth)}
          className={`bg-gray-100 border border-gray-300 text-gray-900text-md md:text-sm rounded-lg block w-full p-2.5 focus:outline-none ${loading ? 'animate-pulse bg-gray-200' : ''}`}
          readOnly
        />
      </div>

      <div className="w-full flex">
        <div className="flex items-center">
          <label className="text-gray-500 text-sm md:text-xs mr-2">Date of Birth</label>
          <select
            {...register('birthyear', {
              required: true,
            })}
            className={`text-gray-900text-md md:text-sm p-1 rounded-md mr-2 border border-gray-300 ${loading ? 'animate-pulse bg-gray-200' : ''}`}
            required
          >
            {Array.from(
              { length: new Date().getFullYear() - 1970 - 20 + 1 },
              (_, i) => 1970 + i
            ).map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.birthyear?.type === 'required' && <p role="alert">Please enter your birthyear</p>}

          <select
            {...register('birthmonth', {
              required: true,
            })}
            className={`text-gray-900text-md md:text-sm p-1 rounded-md border border-gray-300 ${loading ? 'animate-pulse bg-gray-200' : ''}`}
            required
          >
            <option value="1">Jan</option>
            <option value="2">Feb</option>
            <option value="3">Mar</option>
            <option value="4">Apr</option>
            <option value="5">May</option>
            <option value="6">Jun</option>
            <option value="7">Jul</option>
            <option value="8">Aug</option>
            <option value="9">Sep</option>
            <option value="10">Oct</option>
            <option value="11">Nov</option>
            <option value="12">Dec</option>
          </select>
          {errors.birthmonth?.type === 'required' && (
            <p role="alert">Please enter your birthmonth</p>
          )}
        </div>
      </div>

      <div className="mb-4"></div>
      <div className="text-right">
        <button
          type="submit"
          className="text-base-700 bg-white border border-base-700 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded-full px-4 py-2 text-sm md:text-xs font-bold md:font-medium"
          disabled={isSubmitting || loading}
        >
          {isSubmitting && <Spinner className="mr-1.5" />}
          Update profile
        </button>
      </div>
    </form>
  );
}
