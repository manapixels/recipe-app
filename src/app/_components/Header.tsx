'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, UserCircle, PlusCircle } from 'lucide-react';

import AuthForm from '@/_components/auth/AuthForm';
import LoggedInUser from '@/_components/auth/LoggedInUser';
import { useUser } from '@/_contexts/UserContext';
import { useAuthModal } from '@/_contexts/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const { profile, user } = useUser();
  const { setShowModal } = useAuthModal();

  const navLinks = [
    { href: '/recipes', label: 'Recipes' },
    { href: '/techniques', label: 'Techniques' },
  ];

  return (
    <header className="w-full bg-white dark:bg-gray-900 sticky top-0 z-50 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative grid grid-cols-3">
          <div></div>
          <div className="flex flex-col items-center justify-center pointer-events-none">
            <Link
              href="/"
              className="p-1.5 block text-2xl md:text-3xl font-semibold tracking-tight text-black dark:text-white hover:text-black dark:hover:text-white pointer-events-auto"
            >
              <span className="text-base-700 dark:text-base-500">recipe</span>cloud
            </Link>
            <nav className="flex pointer-events-auto">
              {navLinks.map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-2 py-1 md:px-3 md:py-2 rounded-md text-xs md:text-sm font-medium ${pathname.includes(link.href) ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center justify-items-end gap-4 sm:ml-6 sm:pr-0">
            <button
              type="button"
              className="p-1.5 rounded-full dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 focus:outline-none flex flex-col items-center"
              aria-label="Search"
              onClick={() => alert('Search clicked')}
            >
              <span className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm p-1.5">
                <Search className="h-5 w-5" />
              </span>
              <span className="hidden md:block ml-1 text-xs">Search</span>
            </button>

            <Link
              href="/recipes/create"
              className="p-1.5 rounded-full dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 focus:outline-none flex flex-col items-center"
              aria-label="Create Recipe"
            >
              <span className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm p-1.5">
                <PlusCircle className="h-5 w-5" />
              </span>
              <span className="hidden md:block ml-1 text-xs">Create</span>
            </Link>

            {profile?.id ? (
              <LoggedInUser profile={profile} user={user} />
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="p-1.5 rounded-full dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 focus:outline-none flex flex-col items-center"
                  aria-label="Account / Register / Login"
                >
                  <span className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm p-1.5">
                    <UserCircle className="h-5 w-5" />
                  </span>
                  <span className="hidden md:block ml-1 text-xs">Account</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {!profile?.id && <AuthForm />}
    </header>
  );
}
