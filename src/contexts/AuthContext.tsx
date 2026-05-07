// ============================================================
// AuthContext — Global Authentication State Provider
// ============================================================

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { signInWithGoogle, signInWithEmail, registerWithEmail, logout, observeAuthState, saveUserProfile } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken?: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = observeAuthState((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // Persist user profile to Realtime DB on login
      if (firebaseUser) {
        saveUserProfile(firebaseUser.uid, {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          provider: firebaseUser.providerData[0]?.providerId,
        }).catch((err) => {
          if (import.meta.env.DEV) console.error('[AuthContext] Save profile error:', err);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<void> => {
    try {
      await signInWithGoogle();
    } catch (error) {
      if (import.meta.env.DEV) console.error('[AuthContext] Google login error:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      if (import.meta.env.DEV) console.error('[AuthContext] Email login error:', error);
      throw error;
    }
  };

  const registerEmail = async (email: string, password: string): Promise<void> => {
    try {
      await registerWithEmail(email, password);
    } catch (error) {
      if (import.meta.env.DEV) console.error('[AuthContext] Register error:', error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await logout();
    } catch (error) {
      if (import.meta.env.DEV) console.error('[AuthContext] Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail: registerEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
