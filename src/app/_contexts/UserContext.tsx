'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { fetchUserProfile } from '@/api/profile';
import { Profile } from '@/types/profile';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();
const UserContext = createContext<{
  user: User | undefined;
  session: Session | null;
  profile: Profile | undefined;
  setUser: (user: User | undefined) => void;
  loading: boolean;
}>({
  user: undefined,
  session: null,
  profile: undefined,
  setUser: () => {},
  loading: true,
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
    const profile = await fetchUserProfile(userId);
    if (profile) {
      setProfile(profile as Profile);
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
    <UserContext.Provider value={{ user, session, profile, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
