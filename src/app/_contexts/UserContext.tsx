'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { fetchUserProfile, updateUserProfile } from '@/api/profile';
import { Profile } from '@/types/profile';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();
const UserContext = createContext<{
  user: User | undefined;
  session: Session | null;
  profile: Profile | undefined;
  setUser: (user: User | undefined) => void;
  loading: boolean;
  updateUserPreferredUnitSystem: (system: Profile['preferred_unit_system']) => Promise<void>;
}>({
  user: undefined,
  session: null,
  profile: undefined,
  setUser: () => {},
  loading: true,
  updateUserPreferredUnitSystem: async () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      setSession(session);
      if (error) throw error;
      setSession(session);
      setUser(session?.user);
      if (session?.user) await callAndSetProfile(session?.user.id);
      setLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_, session) => {
      // console.log('Supabase auth event', event, session);
      setSession(session);
      setUser(session?.user);
      if (session?.user) await callAndSetProfile(session?.user?.id);
      setLoading(false);
    });

    initializeUser();

    // Cleanup function to unsubscribe from the auth state change listener
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const callAndSetProfile = async (userId: string) => {
    const profileData = await fetchUserProfile(userId);
    if (profileData && !(profileData instanceof Error)) {
      setProfile(profileData as Profile);
    } else if (profileData instanceof Error) {
      console.error('Failed to fetch profile:', profileData);
      setProfile(undefined);
    }
  };

  const updateUserPreferredUnitSystem = async (system: Profile['preferred_unit_system']) => {
    if (!profile || !user) {
      console.warn('User profile or user not available for updating unit system.');
      throw new Error('User profile not available for update.');
    }

    try {
      const updatedProfileData: Profile = {
        ...profile,
        preferred_unit_system: system,
      };

      const result = await updateUserProfile(updatedProfileData);

      if (result && typeof result === 'object' && 'error' in result && result.error === true) {
        console.error('Failed to update preferred unit system in API:', (result as any).message);
        throw new Error((result as any).message || 'Failed to update preference.');
      }

      setProfile(result as Profile);
      // console.log('Preferred unit system updated successfully.');
    } catch (error) {
      console.error('Error in updateUserPreferredUnitSystem:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user?.id) {
      callAndSetProfile(user.id);
    } else if (user === undefined) {
      setProfile(undefined);
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        session,
        profile,
        setUser,
        loading,
        updateUserPreferredUnitSystem,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
