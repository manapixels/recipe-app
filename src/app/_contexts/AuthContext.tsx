'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <AuthContext.Provider value={{ showModal, setShowModal }}>{children}</AuthContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthProvider');
  }
  return context;
};
