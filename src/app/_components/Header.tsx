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
    <header className="max-w-6xl w-full mx-auto bg-opacity-50 bg-white">
      <nav
        className="relative grid grid-cols-2 md:grid-cols-3 items-center px-4 md:px-6 py-3 md:py-6"
        aria-label="Global"
      >
        <div className="justify-self-start pr-4 bg-white">
          <Link
            href="/"
            className="-m-1.5 p-1.5 block text-2xl font-bold text-black hover:text-black"
          >
            <span className="italic text-base-700">my</span>recipe
          </Link>
        </div>
        <div className="justify-self-center bg-white px-4 hidden md:block">
          <div className="bg-gray-50 rounded-full text-sm">
            <Link
              href="/recipes"
              className={`block relative overflow-hidden px-5 py-2.5 text-center hover:bg-gray-100 rounded-full font-medium text-gray-600 ${pathname === '/recipes' ? 'bg-gray-200 font-semibold text-gray-800' : ' '}`}
            >
              Recipes
              <div
                className={`w-1 h-1 rounded-full ${pathname === '/recipes' ? 'bg-base-500' : 'bg-transparent'} absolute bottom-0 left-1/2 transform`}
              />
            </Link>
          </div>
        </div>
        <div className="justify-self-end flex gap-4 items-center bg-white pl-4">
          <Link
            href="/recipes/create"
            className="inline-block whitespace-nowrap self-center px-4 py-2 text-sm md:italic font-bold md:font-medium text-center text-base-700 bg-white border border-base-700 rounded-full hover:border-base-600 hover:text-base-800 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-base-300 dark:text-base-600 dark:border-base-600 dark:hover:bg-base-600 dark:hover:text-white dark:focus:ring-base-800"
          >
            + Create <span className="hidden md:inline-block">recipe</span>
          </Link>
          {profile?.id ? <LoggedInUser profile={profile} user={user} /> : <AuthForm />}
        </div>
        <div className="absolute top-1/2 flex justify-center w-full pointer-events-none">
          <div className="w-1/2 flex justify-between -z-10">
            <div className="rounded-full w-2 h-2 border border-gray-300 bg-white"></div>
            <div className="rounded-full w-2 h-2 border border-gray-300 bg-white"></div>
          </div>
          <div className="h-1 border-b border-gray-200 w-full absolute left-0 -z-20"></div>
        </div>
      </nav>
    </header>
  );
}
