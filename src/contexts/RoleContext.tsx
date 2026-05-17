// ============================================================
// RoleContext.tsx - Role-Based Access Control (RBAC)
// Master Admin: aris.22002.priyanto@gmail.com
// ============================================================

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { syncCurrentUser, usersApi } from '../api';
import { auth } from '../firebase/config';

export type Role = 'admin' | 'kepala_lingkungan' | 'ketua_rw' | 'ketua_rt' | 'rt' | 'rw' | 'warga';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: Role;
  block?: string;
  rt?: string;
  createdAt?: string;
}

// Master Admin Email
const ADMIN_EMAIL = 'aris.22002.priyanto@gmail.com';

interface RoleContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  role: Role | null;
  isAdmin: boolean;
  isRW: boolean;
  isRT: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  checkRole: (roles: Role[]) => boolean;
  refreshProfile: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile from backend user store
  const loadProfile = async (firebaseUser: User) => {
    try {
      let data = await usersApi.getById(firebaseUser.uid);
      if (!data) {
        await syncCurrentUser();
        data = await usersApi.getById(firebaseUser.uid);
      }

      const isMasterAdmin = firebaseUser.email === ADMIN_EMAIL;
      const role = (isMasterAdmin ? 'admin' : (data?.role as Role)) || 'warga';

      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role,
        block: data?.block as string,
        rt: data?.rt as string,
        createdAt: data?.createdAt as string,
      };
      setProfile(userProfile);
    } catch (error) {
      console.error('[RoleContext] Load profile error:', error);
      const isMasterAdmin = firebaseUser.email === ADMIN_EMAIL;
      setProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: isMasterAdmin ? 'admin' : 'warga',
      });
      setLoading(false);
    }
  };

  // Watch auth state with timeout fallback
  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Set timeout as safety net (5 seconds)
        timeoutId = setTimeout(() => {
          if (isMounted && !profile) {
            console.warn('[RoleContext] RTDB timeout, using fallback profile');
            const isMasterAdmin = firebaseUser.email === ADMIN_EMAIL;
            setProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: isMasterAdmin ? 'admin' : 'warga',
            });
            setLoading(false);
          }
        }, 5000);

        try {
          await loadProfile(firebaseUser);
        } catch (error) {
          console.error('[RoleContext] Load profile error:', error);
          const isMasterAdmin = firebaseUser.email === ADMIN_EMAIL;
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: isMasterAdmin ? 'admin' : 'warga',
          });
        }
      } else {
        setProfile(null);
      }
      // Only set loading=false after profile is ready
      if (isMounted) {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  // Role check helpers
  const checkIsAdmin = () => profile?.role === 'admin' || profile?.role === 'kepala_lingkungan';
  const checkIsRW = () => ['ketua_rw', 'rw'].includes(profile?.role || '');
  const checkIsRT = () => ['ketua_rt', 'rt'].includes(profile?.role || '');

  // CRUD permission checks
  const canCreate = ['admin', 'kepala_lingkungan', 'ketua_rw', 'ketua_rt', 'rt', 'rw'].includes(profile?.role || '');
  const canUpdate = ['admin', 'kepala_lingkungan', 'ketua_rw', 'ketua_rt'].includes(profile?.role || '');
  const canDelete = ['admin', 'kepala_lingkungan'].includes(profile?.role || '');

  // Check if user has one of specified roles
  const checkRole = (roles: Role[]) => roles.includes(profile?.role as Role);

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user);
    }
  };

  return (
    <RoleContext.Provider
      value={{
        user,
        profile,
        loading,
        role: profile?.role || null,
        isAdmin: checkIsAdmin(),
        isRW: checkIsRW(),
        isRT: checkIsRT(),
        canCreate,
        canUpdate,
        canDelete,
        checkRole,
        refreshProfile,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

// Export helper for checking admin email
export const isAdminEmail = (email: string | null): boolean => {
  return email === ADMIN_EMAIL;
};

// Export role display names
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  admin: 'Admin',
  kepala_lingkungan: 'Kepala Lingkungan',
  ketua_rw: 'Ketua RW',
  ketua_rt: 'Ketua RT',
  rt: 'RT',
  rw: 'RW',
  warga: 'Warga'
};

// Export permission matrix
export const PERMISSIONS = {
  houses: {
    create: ['admin', 'kepala_lingkungan', 'ketua_rw'],
    update: ['admin', 'kepala_lingkungan', 'ketua_rw', 'ketua_rt'],
    delete: ['admin', 'kepala_lingkungan']
  },
  activities: {
    create: ['admin', 'kepala_lingkungan', 'ketua_rw', 'ketua_rt', 'rt', 'rw'],
    update: ['admin', 'kepala_lingkungan', 'ketua_rw', 'ketua_rt'],
    delete: ['admin', 'kepala_lingkungan']
  },
  payments: {
    create: ['admin', 'kepala_lingkungan', 'ketua_rw', 'ketua_rt', 'rt'],
    update: ['admin', 'kepala_lingkungan', 'ketua_rw'],
    delete: ['admin', 'kepala_lingkungan']
  }
};
