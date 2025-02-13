import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { fetchUserProfileWithRecipes } from '@/api/profile';
import { ProfileWithRecipes } from '@/types/profile';
import { Recipe } from '@/types/recipe';
import { BUCKET_URL } from '@/constants';
import { createClient } from '@/utils/supabase/server';
import RecipeListItemInProfile from './_components/RecipeListItemInProfile';

export const metadata: Metadata = {
  title: 'recipe-app | Profile',
};

export default async function ProfilePage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  const profile = (await fetchUserProfileWithRecipes({
    username: params.slug,
  })) as ProfileWithRecipes;

  const recipes = profile?.recipes_created as Recipe[];
  let gridCols = 0,
    isHost = false,
    isParticipant = false;
  if (profile?.user_roles?.includes('host')) {
    gridCols += 2;
    isHost = true;
  }
  if (profile?.user_roles?.includes('participant')) {
    gridCols += 1;
    isParticipant = true;
  }

  return (
    <div className="flex w-full flex-col md:col-span-4">
      <Image
        src={
          profile.avatar_url !== ''
            ? `${BUCKET_URL}/avatars/${profile?.avatar_url}`
            : '/users/placeholder-avatar.svg'
        }
        alt=""
        width={140}
        height={140}
        className="rounded-full mx-auto mb-6"
      />
      <div className="text-center mb-8">
        <div className="italic text-gray-500">Hey there, I'm</div>
        <div className="font-bold text-2xl">{profile?.name}</div>
        <div>
          {profile?.user_roles?.map((role, i) => {
            return (
              <div
                key={i}
                className="inline-block bg-green-100 text-green-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 capitalize"
              >
                {role}
              </div>
            );
          })}
        </div>
      </div>

      <dl className={`grid max-w-screen-xl grid-cols-${gridCols} gap-8 py-2 px-4 mx-auto mb-8`}>
        {isHost && (
          <>
            <div className="flex flex-col items-center justify-center">
              <dt className="mb-2 text-xl font-extrabold">{recipes?.length || 0}</dt>
              <dd className="text-gray-500 dark:text-gray-400 text-sm">Recipes created</dd>
            </div>
            <div className="flex flex-col items-center justify-center">
              <dt className="mb-2 text-xl font-extrabold">{profile?.recipes_count || 0}</dt>
              <dd className="text-gray-500 dark:text-gray-400 text-sm">Total recipes</dd>
            </div>
          </>
        )}
      </dl>

      {isHost && (
        <>
          <div className={`mb-4 flex justify-between items-center`}>
            <h2 className="font-bold text-md md:text-lg">Created Recipes</h2>
            {user?.user?.id === profile?.id && (
              <Link
                href="/recipes/manage"
                className="flex items-center gap-1 text-white bg-base-700 hover:bg-base-600 font-medium rounded-full px-4 md:px-7 py-2 md:py-2.5 text-sm md:text-md"
              >
                Manage recipes{' '}
                <svg
                  className="inline-block"
                  width="16px"
                  height="16px"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  color="#FFFFFF"
                >
                  <path
                    d="M6.00005 19L19 5.99996M19 5.99996V18.48M19 5.99996H6.52005"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            {recipes?.length > 0 ? (
              recipes.map((recipe, i) => (
                <RecipeListItemInProfile recipe={recipe} key={recipe.id || i} />
              ))
            ) : (
              <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center text-gray-500">
                No recipes created yet.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
