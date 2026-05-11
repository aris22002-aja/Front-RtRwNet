// ============================================================
// ProtectedRoute.tsx - Role-Based Route Protection
// ============================================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRole, Role } from '../contexts/RoleContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
}) => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useRole();
  const location = useLocation();

  // Show loading while checking auth/role
  if (authLoading || roleLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if specified
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = getDashboardPath(role);
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

// Get dashboard path based on role
function getDashboardPath(role: Role): string {
  switch (role) {
    case 'admin':
    case 'kepala_lingkungan':
      return '/admin';
    case 'ketua_rw':
    case 'rw':
      return '/dashboard-pengurus';
    case 'ketua_rt':
    case 'rt':
      return '/dashboard-rt';
    case 'warga':
    default:
      return '/dashboard-warga';
  }
}

export default ProtectedRoute;
