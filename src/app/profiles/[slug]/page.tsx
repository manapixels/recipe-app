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
        <div className="italic text-gray-500">Hey there, I&apos;m</div>
        <div className="font-bold text-2xl">{profile?.name}</div>
      </div>

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
    </div>
  );
}
