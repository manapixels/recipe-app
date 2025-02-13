'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { fetchUserProfile } from '@/api/profile';
import { ProfileWithRoles } from '@/types/profile';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();
const UserContext = createContext<{
  user: User | undefined;
  isHost: boolean;
  session: Session | null;
  profile: ProfileWithRoles | undefined;
  setUser: (user: User | undefined) => void;
  loading: boolean;
}>({
  user: undefined,
  isHost: false,
  session: null,
  profile: undefined,
  setUser: () => {},
  loading: true,
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>();
  const [isHost, setIsHost] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileWithRoles>();
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

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase auth event', event, session);
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
      setProfile(profile as ProfileWithRoles);
    }
  };

  useEffect(() => {
    if (user?.id) {
      callAndSetProfile(user.id);
    } else if (user === undefined) {
      setProfile(undefined);
    }
  }, [user]);

  useEffect(() => {
    if (profile?.roles?.includes('host')) {
      if (isHost === false) setIsHost(true);
    } else {
      if (isHost === true) setIsHost(false);
    }
  }, [profile]);

  return (
    <UserContext.Provider value={{ user, isHost, session, profile, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
