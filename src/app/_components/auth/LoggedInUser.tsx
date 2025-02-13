'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useOnClickOutside } from 'usehooks-ts';

import { useToast } from '@/_components/ui/Toasts/useToast';
import { useUser } from '@/_contexts/UserContext';
import { signOut } from '@/api/auth';
import { BUCKET_URL } from '@/constants';
import { useRouter } from 'next/navigation';
import { ProfileWithRoles } from '@/types/profile';
import { User } from '@supabase/supabase-js';

export default function LoggedInUser({
  profile,
  user,
}: {
  profile: ProfileWithRoles;
  user: User | undefined;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { isHost, setUser } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const ref = useRef(null);
  useOnClickOutside(ref, () => setIsOpen(false));

  return (
    <AnimatePresence initial={false} mode="wait">
      <div>
        <div className="relative inline-block text-left align-middle">
          <motion.button
            className="rounded-full bg-gray-100 flex items-center justify-center"
            style={{ width: '2.6rem', height: '2.6rem' }}
            whileHover={{ scale: 1.08, backgroundColor: 'rgb(232 235 239)' }}
            onClick={() => setIsOpen(true)}
          >
            <Image
              className="h-full w-full rounded-full"
              src={
                profile?.avatar_url !== ''
                  ? `${BUCKET_URL}/avatars/${profile?.avatar_url}`
                  : '/users/placeholder-avatar.svg'
              }
              alt=""
              width={34}
              height={34}
            />
          </motion.button>
          <motion.div
            ref={ref}
            className={`origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
            initial={{ opacity: 0 }}
            animate={isOpen ? 'open' : 'closed'}
            variants={{
              open: { opacity: 1 },
              closed: { opacity: 0 },
            }}
            tabIndex={-1}
          >
            {(profile?.name || user?.email) && (
              <>
                <div className="px-4 pt-3 pb-2 text-sm text-gray-900 dark:text-white">
                  <div>{profile.name}</div>
                  {user?.email && <div className="font-medium truncate">{user.email}</div>}
                </div>
                <hr className="my-1" />
              </>
            )}
            <div className="py-1" role="none">
              <Link
                href="/account"
                className="text-gray-700 px-4 py-2 text-sm flex gap-1 hover:bg-gray-50"
                tabIndex={-1}
                onClick={() => setIsOpen(false)}
              >
                <svg
                  className="mr-2"
                  width="1.1rem"
                  height="1.1rem"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  color="#000000"
                >
                  <path
                    d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M4.271 18.3457C4.271 18.3457 6.50002 15.5 12 15.5C17.5 15.5 19.7291 18.3457 19.7291 18.3457"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
                My Account
              </Link>
              {isHost && (
                <Link
                  href="/recipes/manage"
                  className="text-gray-700 px-4 py-2 text-sm flex gap-1 hover:bg-gray-50"
                  tabIndex={-1}
                  onClick={() => setIsOpen(false)}
                >
                  <svg
                    className="mr-2"
                    width="1.1rem"
                    height="1.1rem"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    color="#000000"
                  >
                    <path
                      d="M15 4V2M15 4V6M15 4H10.5M3 10V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V10H3Z"
                      stroke="#000000"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M3 10V6C3 4.89543 3.89543 4 5 4H7"
                      stroke="#000000"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M7 2V6"
                      stroke="#000000"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M21 10V6C21 4.89543 20.1046 4 19 4H18.5"
                      stroke="#000000"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                  Manage my recipes
                </Link>
              )}

              <Link
                href="/recipes/my"
                className="text-gray-700 px-4 py-2 text-sm flex gap-1 hover:bg-gray-50"
                tabIndex={-1}
                onClick={() => setIsOpen(false)}
              >
                <svg
                  className="mr-2"
                  width="1.1rem"
                  height="1.1rem"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  color="#000000"
                >
                  <path
                    d="M13 21H4C2.89543 21 2 20.1046 2 19V5C2 3.89543 2.89543 3 4 3H20C21.1046 3 22 3.89543 22 5V13"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  ></path>
                  <path
                    d="M22 17.2798C22 17.8812 21.7625 18.4588 21.3383 18.8861C20.3619 19.8701 19.415 20.8961 18.4021 21.8443C18.17 22.0585 17.8017 22.0507 17.5795 21.8268L14.6615 18.8861C13.7795 17.9972 13.7795 16.5623 14.6615 15.6734C15.5522 14.7758 17.0032 14.7758 17.8938 15.6734L17.9999 15.7803L18.1059 15.6734C18.533 15.2429 19.1146 15 19.7221 15C20.3297 15 20.9113 15.2428 21.3383 15.6734C21.7625 16.1007 22 16.6784 22 17.2798Z"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M2 7L22 7"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M5 5.01L5.01 4.99889"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M8 5.01L8.01 4.99889"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M11 5.01L11.01 4.99889"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
                My Recipes
              </Link>

              <hr className="my-2" />
              <button
                type="button"
                className="text-gray-700 px-4 py-2 text-sm flex gap-1 w-full hover:bg-gray-50"
                role="menuitem"
                tabIndex={-1}
                id="menu-item-3"
                onClick={async () => {
                  await signOut();
                  setUser(undefined);
                  toast({
                    title: 'Successfuly logged out',
                    description: 'Hope to see you again soon!',
                    className: 'bg-green-700 text-white border-transparent',
                  });
                  router.push('/recipes');
                }}
              >
                <svg
                  className="mr-2"
                  width="1.1rem"
                  height="1.1rem"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  color="#000000"
                >
                  <path
                    d="M12 12H19M19 12L16 15M19 12L16 9"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M19 6V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V18"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
                Log out
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
