'use client';

import { useEffect } from 'react';
import { useUser } from '@/_contexts/UserContext';
import { useAuthModal } from '@/_contexts/AuthContext';

const ProtectedWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useUser();
  const { setShowModal } = useAuthModal();

  useEffect(() => {
    if (!user && !loading) {
      setShowModal(true);
    }
  }, [user, loading, setShowModal]);

  return <div>{children}</div>;
};

export default ProtectedWrapper;
