import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { fetchUserProfileWithRecipes } from '@/api/profile';
import { ProfileWithRecipes } from '@/types/profile';
import { Recipe } from '@/types/recipe';
import { BUCKET_URL } from '@/constants';
import { createClient } from '@/utils/supabase/server';
import RecipeListItemInProfile from './_components/RecipeListItemInProfile';
import ProfileTabs from './_components/ProfileTabs';

export const metadata: Metadata = {
  title: 'recipe-app | Profile',
};

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient();
  const { data: authUser } = await supabase.auth.getUser();
  const profile = (await fetchUserProfileWithRecipes({
    username: params.username,
  })) as ProfileWithRecipes;

  if (!profile) {
    return <div className="text-center py-10">Profile not found.</div>;
  }

  const createdRecipes = (profile?.recipes_created as Recipe[]) || [];
  const favoritedRecipes = (profile?.favorite_recipes as Recipe[]) || [];
  const isOwnProfile = authUser?.user?.id === profile?.id;
  const bio = profile.bio || "This user hasn't set a bio yet.";

  const createdRecipesContent = (
    <>
      {isOwnProfile && !createdRecipes.length && (
        <div className="text-center text-gray-500 py-6">
          <p>You haven&apos;t created any recipes yet.</p>
          <Link
            href="/recipes/create"
            className="mt-4 inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-150"
          >
            Create Your First Recipe
          </Link>
        </div>
      )}
      {!isOwnProfile && !createdRecipes.length && (
        <div className="text-center text-gray-500 py-10">
          <p>{`${profile.name || 'This user'} hasn't`} created any recipes yet.</p>
        </div>
      )}
      {createdRecipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {createdRecipes.map(recipe => (
            <RecipeListItemInProfile recipe={recipe} key={recipe.id} />
          ))}
        </div>
      )}
    </>
  );

  const favoritedRecipesContent = (
    <>
      {isOwnProfile && !favoritedRecipes.length && (
        <div className="text-center text-gray-500 py-6">
          <p>You haven&apos;t favorited any recipes yet.</p>
          <Link
            href="/recipes"
            className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-150"
          >
            Discover Recipes
          </Link>
        </div>
      )}
      {!isOwnProfile && !favoritedRecipes.length && (
        <div className="text-center text-gray-500 py-10">
          <p>{`${profile.name || 'This user'} hasn't`} favorited any recipes yet.</p>
        </div>
      )}
      {favoritedRecipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritedRecipes.map(recipe => (
            <RecipeListItemInProfile recipe={recipe} key={recipe.id} />
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center md:flex-row md:items-start gap-6 mb-12">
        <Image
          src={
            profile.avatar_url
              ? `${BUCKET_URL}/avatars/${profile.avatar_url}`
              : '/users/placeholder-avatar.svg'
          }
          alt={`${profile.name || profile.username}'s avatar`}
          width={150}
          height={150}
          className="rounded-full object-cover flex-shrink-0 shadow-md"
        />
        <div className="text-center md:text-left flex-grow">
          <div className="flex flex-col md:flex-row justify-between items-center mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {profile.name || profile.username}
              </h1>
              <p className="text-md text-gray-600">@{profile.username}</p>
            </div>
            {isOwnProfile && (
              <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-2 items-center">
                <Link
                  href="/account/settings"
                  className="text-sm text-indigo-600 hover:text-indigo-500 px-3 py-1.5 rounded-md hover:bg-indigo-50 transition-colors duration-150 whitespace-nowrap"
                >
                  Edit Profile
                </Link>
                <Link
                  href="/recipes/manage"
                  className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-md px-3 py-1.5 transition-colors duration-150 whitespace-nowrap"
                >
                  Manage My Recipes
                </Link>
              </div>
            )}
          </div>
          <p className="mt-3 text-gray-700 text-sm md:text-base">{bio}</p>
        </div>
      </div>

      <ProfileTabs
        createdRecipesContent={createdRecipesContent}
        favoritedRecipesContent={favoritedRecipesContent}
      />
    </div>
  );
}
