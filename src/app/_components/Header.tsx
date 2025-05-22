'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

import AuthForm from '@/_components/auth/AuthForm';
import LoggedInUser from '@/_components/auth/LoggedInUser';
import { useUser } from '@/_contexts/UserContext';
import { CustomSelect } from '@/_components/ui/Select';

const unitOptions = [
  { label: 'Metric', value: 'metric' },
  { label: 'Imperial', value: 'imperial' },
];

export default function Header() {
  const pathname = usePathname();
  const { profile, user, updateUserPreferredUnitSystem, loading: userLoading } = useUser();
  const [displayUnitSystem, setDisplayUnitSystem] = useState<'metric' | 'imperial'>('metric');

  useEffect(() => {
    if (!userLoading && profile && profile.preferred_unit_system) {
      if (
        profile.preferred_unit_system === 'metric' ||
        profile.preferred_unit_system === 'imperial'
      ) {
        setDisplayUnitSystem(profile.preferred_unit_system);
      } else {
        setDisplayUnitSystem('metric');
      }
    } else if (!userLoading && !profile) {
      setDisplayUnitSystem('metric');
    }
  }, [profile, userLoading]);

  const handleUnitSystemChange = async (value: string) => {
    const newSystem = value as 'metric' | 'imperial';
    setDisplayUnitSystem(newSystem);

    if (profile && updateUserPreferredUnitSystem) {
      try {
        await updateUserPreferredUnitSystem(newSystem);
      } catch (error) {
        console.error('Failed to update unit system:', error);
      }
    }
  };

  return (
    <header className="max-w-7xl w-full mx-auto bg-white dark:bg-gray-800">
      <nav
        className="relative grid grid-cols-2 md:grid-cols-3 items-center px-4 md:px-6 py-3 md:py-6"
        aria-label="Global"
      >
        <div className="justify-self-start pr-4">
          <Link
            href="/"
            className="-m-1.5 p-1.5 block text-2xl font-bold text-black dark:text-white hover:text-black dark:hover:text-white"
          >
            <span className="italic text-base-700 dark:text-base-500">my</span>recipe
          </Link>
        </div>
        <div className="justify-self-center px-4 hidden md:block">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-full text-sm">
            <Link
              href="/recipes"
              className={`block relative overflow-hidden px-5 py-2.5 text-center rounded-full font-medium ${pathname === '/recipes' ? 'bg-gray-200 dark:bg-gray-600 font-semibold text-gray-800 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
            >
              Recipes
              <div
                className={`w-1 h-1 rounded-full ${pathname === '/recipes' ? 'bg-base-500 dark:bg-base-400' : 'bg-transparent'} absolute bottom-0 left-1/2 transform`}
              />
            </Link>
          </div>
        </div>
        <div className="justify-self-end flex gap-2 items-center pl-4">
          <CustomSelect
            options={unitOptions}
            value={displayUnitSystem}
            onChange={handleUnitSystemChange}
          />
          <Link
            href="/recipes/create"
            className="inline-block whitespace-nowrap self-center px-4 py-2 text-sm md:italic font-bold md:font-medium text-center text-base-600 dark:text-base-400 border border-base-600 dark:border-base-500 rounded-full hover:bg-base-50 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-base-300 dark:focus:ring-base-700"
          >
            + Create <span className="hidden md:inline-block">recipe</span>
          </Link>
          {profile?.id ? <LoggedInUser profile={profile} user={user} /> : <AuthForm />}
        </div>
        <div className="absolute top-1/2 flex justify-center w-full pointer-events-none">
          <div className="w-1/2 flex justify-between -z-10">
            <div className="rounded-full w-2 h-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"></div>
            <div className="rounded-full w-2 h-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"></div>
          </div>
          <div className="h-1 border-b border-gray-200 dark:border-gray-700 w-full absolute left-0 -z-20"></div>
        </div>
      </nav>
    </header>
  );
}
