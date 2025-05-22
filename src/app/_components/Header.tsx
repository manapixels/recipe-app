'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import AuthForm from '@/_components/auth/AuthForm';
import LoggedInUser from '@/_components/auth/LoggedInUser';
import { useUser } from '@/_contexts/UserContext';

export default function Header() {
  const pathname = usePathname();
  const { profile, user } = useUser();

  return (
    <header className="max-w-7xl w-full mx-auto bg-white dark:bg-gray-800">
      <nav
        className="relative grid grid-cols-2 items-center px-4 md:px-6 py-3 md:py-6"
        aria-label="Global"
      >
        <div className="justify-self-start pr-4">
          <Link
            href="/"
            className="-m-1.5 p-1.5 block text-2xl font-semibold tracking-tight text-black dark:text-white hover:text-black dark:hover:text-white"
          >
            <span className="text-base-700 dark:text-base-500">recipe</span>cloud
          </Link>
        </div>
        <div className="justify-self-end flex gap-5 items-center pl-4">
          <div className="rounded-lg text-sm">
            <Link
              href="/recipes"
              className={`block relative overflow-hidden px-4 py-2 text-center rounded-lg font-medium ${pathname === '/recipes' ? 'font-semibold text-gray-800 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
            >
              Recipes
              <div
                className={`w-1 h-1 rounded-lg ${pathname === '/recipes' ? 'bg-base-600 dark:bg-base-400' : 'bg-transparent'} absolute bottom-0 left-1/2 transform`}
              />
            </Link>
          </div>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>

          <Link
            href="/recipes/create"
            className="inline-block whitespace-nowrap self-center px-4 py-2 text-sm font-bold md:font-medium text-center text-base-600 dark:text-base-400 border border-base-600 dark:border-base-500 rounded-lg focus:ring-4 focus:outline-none focus:ring-base-300 dark:focus:ring-base-700 hover:shadow-[0_0_0px_3px_rgba(146,120,0,0.4)]"
          >
            + Create
            {/* <span className="hidden md:inline-block">recipe</span> */}
          </Link>
          {profile?.id ? <LoggedInUser profile={profile} user={user} /> : <AuthForm />}
        </div>
        <div className="absolute top-1/2 flex justify-center w-full pointer-events-none">
          <div className="w-1/2 flex justify-between -z-10">
            <div className="rounded-lg w-2 h-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"></div>
            <div className="rounded-lg w-2 h-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"></div>
          </div>
          <div className="h-1 border-b border-gray-200 dark:border-gray-700 w-full absolute left-0 -z-20"></div>
        </div>
      </nav>
    </header>
  );
}
