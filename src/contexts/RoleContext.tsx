// ============================================================
// RoleContext — Role-Based Access Control (RBAC) Provider
// ============================================================

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onIdTokenChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

// Role definitions matching backend roles.ts
export enum Role {
  SUPER_ADMIN = 'super_admin',
  KETUA_RW = 'ketua_rw',
  KETUA_RT = 'ketua_rt',
  SEKRETARIS = 'sekretaris',
  BENDAHARA = 'bendahara',
  WARGANEGARA = 'warga',
  KARANG_TARUNA = 'karang_taruna',
}

// Role display names
export const RoleDisplayName: Record<Role, string> = {
  [Role.SUPER_ADMIN]: 'Super Admin',
  [Role.KETUA_RW]: 'Ketua RW',
  [Role.KETUA_RT]: 'Ketua RT',
  [Role.SEKRETARIS]: 'Sekretaris',
  [Role.BENDAHARA]: 'Bendahara',
  [Role.WARGANEGARA]: 'Warga',
  [Role.KARANG_TARUNA]: 'Karang Taruna',
};

// Permission helpers
export const PERMISSIONS = {
  MANAGE_RESIDENTS: [Role.SUPER_ADMIN, Role.KETUA_RW, Role.KETUA_RT, Role.SEKRETARIS],
  MANAGE_PAYMENTS: [Role.SUPER_ADMIN, Role.KETUA_RW, Role.KETUA_RT, Role.BENDAHARA],
  MANAGE_HOUSES: [Role.SUPER_ADMIN, Role.KETUA_RW, Role.KETUA_RT, Role.SEKRETARIS],
  MANAGE_USERS: [Role.SUPER_ADMIN, Role.KETUA_RW, Role.KETUA_RT],
  READ_ONLY: [Role.WARGANEGARA, Role.KARANG_TARUNA],
  VIEW_ALL: [Role.SUPER_ADMIN, Role.KETUA_RW, Role.KETUA_RT, Role.SEKRETARIS, Role.BENDAHARA],
};

// Check if role has CRUD access
export const canCRUD = (role: Role): boolean => {
  return !PERMISSIONS.READ_ONLY.includes(role);
};

// Check if role can manage specific feature
export const canManageFeature = (role: Role, feature: 'residents' | 'payments' | 'houses' | 'users'): boolean => {
  const featureKey = `MANAGE_${feature.toUpperCase()}s` as keyof typeof PERMISSIONS;
  return PERMISSIONS[featureKey]?.includes(role) ?? false;
};

interface UserProfile {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  role: Role;
  rt?: string;
  rw?: string;
}

interface RoleContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  isPengurus: boolean;
  isWarga: boolean;
  hasPermission: (feature: 'residents' | 'payments' | 'houses' | 'users') => boolean;
  logout: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        // Get custom claims from ID token
        const idTokenResult = await user.getIdTokenResult();
        const role = (idTokenResult.claims.role as Role) || Role.WARGANEGARA;
        const rt = idTokenResult.claims.rt as string | undefined;
        const rw = idTokenResult.claims.rw as string | undefined;

        setUserProfile({
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          role: role || Role.WARGANEGARA,
          rt,
          rw,
        });
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async (): Promise<void> => {
    const { logout: firebaseLogout } = await import('../firebase/config');
    await firebaseLogout();
  };

  const isPengurus = userProfile ? !PERMISSIONS.READ_ONLY.includes(userProfile.role) : false;
  const isWarga = userProfile ? PERMISSIONS.READ_ONLY.includes(userProfile.role) : false;

  const hasPermission = (feature: 'residents' | 'payments' | 'houses' | 'users'): boolean => {
    if (!userProfile) return false;
    return canManageFeature(userProfile.role, feature);
  };

  return (
    <RoleContext.Provider
      value={{
        user: userProfile,
        firebaseUser,
        loading,
        isPengurus,
        isWarga,
        hasPermission,
        logout,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

// Hook for accessing role context
export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
