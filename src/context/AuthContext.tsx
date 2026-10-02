'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously as firebaseSignInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirebaseReady: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signInEmail: (email: string, pass: string) => Promise<void>;
  signUpEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isFirebaseReady = isFirebaseConfigured() && Boolean(auth);

  useEffect(() => {
    if (!isFirebaseReady || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isFirebaseReady]);

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase não configurado');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInAsGuest = async () => {
    if (!auth) throw new Error('Firebase não configurado');
    await firebaseSignInAnonymously(auth);
  };

  const signInEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error('Firebase não configurado');
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error('Firebase não configurado');
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseReady,
        signInWithGoogle,
        signInAsGuest,
        signInEmail,
        signUpEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
