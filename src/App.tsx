// ============================================================
// App.tsx — Main Router dengan Auth Guard
// ============================================================

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import {
  LayoutDashboard,
  Home,
  Users,
  Wallet,
  Activity,
  MessageSquare,
  Calendar,
  HeartHandshake,
  Building2,
  Bike,
  Package,
  Clock,
  LogOut,
} from 'lucide-react';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Aktivitas = lazy(() => import('./pages/Aktivitas'));
const Houses = lazy(() => import('./pages/Houses'));
const Residents = lazy(() =>
  import('./pages/Residents').then((module) => ({ default: module.default }))
);
const Payments = lazy(() => import('./pages/Payments'));
const Komunitas = lazy(() => import('./pages/Komunitas'));
const Kegiatan = lazy(() => import('./pages/Kegiatan'));
const Login = lazy(() => import('./pages/Login'));

// --- Page Loader ---
const PageLoader: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    color: 'var(--text-muted)',
    gap: '0.5rem',
  }}>
    Memuat...
  </div>
);

// --- Protected Route Guard ---
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        gap: '0.75rem',
        color: 'var(--text-muted)',
      }}>
        Memuat sesi...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// --- Logout Button ---
const LogoutButton: React.FC = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      if (import.meta.env.DEV) console.error('[App] Logout error:', err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        padding: '0.5rem 0.75rem',
        borderRadius: '8px',
        fontSize: '0.8rem',
        transition: 'color 0.2s',
        marginTop: 'auto',
      }}
      title="Keluar"
    >
      <LogOut size={18} />
      Keluar
    </button>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes with Layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// --- Main Layout ---
const AppLayout: React.FC = () => {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <Home size={28} weight="duotone" color="var(--primary)" />
          <h2 style={{ margin: 0 }}>RtRwNet</h2>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 1.5rem 0' }}>
          Graha Harmony 5
        </p>
        <nav>
          <ul className="nav-links">
            {/* Menu Utama */}
            <li>
              <NavLink to="/dashboard" end className={({ isActive }) => (isActive ? 'active' : '')}>
                <LayoutDashboard size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/houses" className={({ isActive }) => (isActive ? 'active' : '')}>
                <Home size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                Data Rumah
              </NavLink>
            </li>
            <li>
              <NavLink to="/residents" className={({ isActive }) => (isActive ? 'active' : '')}>
                <Users size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                Penghuni
              </NavLink>
            </li>
            <li>
              <NavLink to="/payments" className={({ isActive }) => (isActive ? 'active' : '')}>
                <Wallet size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                Iuran IPL
              </NavLink>
            </li>

            {/* Separator */}
            <li style={{ margin: '1rem 0 0.5rem', paddingLeft: '0.75rem' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                Dashboard Warga
              </span>
            </li>

            {/* Kategori Warga */}
            <li>
              <NavLink to="/aktivitas" className={({ isActive }) => (isActive ? 'active' : '')}>
                <Activity size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                Aktivitas
              </NavLink>
            </li>
            <li>
              <NavLink to="/kegiatan" className={({ isActive }) => (isActive ? 'active' : '')}>
                <Bike size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                Kegiatan
              </NavLink>
            </li>
            <li>
              <NavLink to="/komunitas" className={({ isActive }) => (isActive ? 'active' : '')}>
                <HeartHandshake size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                Komunitas
              </NavLink>
            </li>
          </ul>
        </nav>
        <LogoutButton />
      </aside>

      <main className="main-content">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/houses" element={<Houses />} />
              <Route path="/residents" element={<Residents />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/aktivitas" element={<Aktivitas />} />
              <Route path="/kegiatan" element={<Kegiatan />} />
              <Route path="/komunitas" element={<Komunitas />} />
              <Route path="/warga/organisasi" element={<Komunitas />} />
              <Route path="/warga/kegiatan" element={<Kegiatan />} />
              <Route path="/warga/aktivitas" element={<Aktivitas />} />
              <Route path="/warga/iuran" element={<Payments />} />
              <Route path="/warga/penghuni" element={<Residents />} />
              <Route path="/warga/rumah" element={<Houses />} />
              {/* Default */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default App;