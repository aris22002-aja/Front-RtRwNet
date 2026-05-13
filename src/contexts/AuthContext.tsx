// ============================================================
// AuthContext — Global Authentication State Provider
// Multi-level auth: Google SSO, Email/Password, Forgot Password
// ============================================================

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { 
  signInWithGoogle, 
  getGoogleRedirectUser,
  signInWithEmail, 
  registerWithEmail, 
  logout, 
  observeAuthState, 
  saveUserProfile, 
  sendPasswordReset 
} from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle redirect result when user returns from Google OAuth redirect
    getGoogleRedirectUser().catch((err) => {
      if (import.meta.env.DEV) console.error('[AuthContext] getRedirectResult error:', err);
    });

    const unsubscribe = observeAuthState((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        saveUserProfile(firebaseUser.uid, {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          provider: firebaseUser.providerData[0]?.providerId,
          lastLogin: new Date().toISOString(),
        }).catch((err) => {
          if (import.meta.env.DEV) console.error('[AuthContext] Save profile error:', err);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const loginWithGoogle = async (): Promise<void> => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login Google gagal';
      setError(message);
      if (import.meta.env.DEV) console.error('[AuthContext] Google login error:', err);
      throw err;
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      await signInWithEmail(email, password);
    } catch (err: unknown) {
      const message = getFirebaseErrorMessage(err);
      setError(message);
      if (import.meta.env.DEV) console.error('[AuthContext] Email login error:', err);
      throw err;
    }
  };

  const registerEmail = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      await registerWithEmail(email, password);
    } catch (err: unknown) {
      const message = getFirebaseErrorMessage(err);
      setError(message);
      if (import.meta.env.DEV) console.error('[AuthContext] Register error:', err);
      throw err;
    }
  };

  const forgotPwd = async (email: string): Promise<void> => {
    try {
      setError(null);
      await sendPasswordReset(email);
    } catch (err: unknown) {
      const message = getFirebaseErrorMessage(err);
      setError(message);
      if (import.meta.env.DEV) console.error('[AuthContext] Forgot password error:', err);
      throw err;
    }
  };

  const signOutUser = async (): Promise<void> => {
    try {
      await logout();
    } catch (err) {
      if (import.meta.env.DEV) console.error('[AuthContext] Sign out error:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        clearError,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail: registerEmail,
        forgotPassword: forgotPwd,
        signOut: signOutUser,
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

// Helper: Parse Firebase auth errors to Indonesian messages
function getFirebaseErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Terjadi kesalahan';
  
  const err = error as { code?: string; message?: string };
  const code = err.code || '';
  
  const errorMessages: Record<string, string> = {
    'auth/user-not-found': 'Email tidak terdaftar',
    'auth/wrong-password': 'Password salah',
    'auth/email-already-in-use': 'Email sudah terdaftar',
    'auth/weak-password': 'Password minimal 6 karakter',
    'auth/invalid-email': 'Format email tidak valid',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti',
    'auth/network-request-failed': 'Koneksi internet terputus',
    'auth/invalid-credential': 'Email atau password salah',
    'auth/popup-closed-by-user': 'Login dibatalkan',
    'auth/cancelled-popup-request': 'Hanya satu jendela login yang diizinkan',
  };
  
  return errorMessages[code] || err.message || 'Terjadi kesalahan authentication';
}
