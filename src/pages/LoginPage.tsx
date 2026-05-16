// ============================================================
// LoginPage.tsx - Multi-level Authentication with RBAC
// Supports: Google SSO, Email/Password, Forgot Password
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../contexts/RoleContext';
import styles from './Login.module.css';

// Role display names
const ROLE_DISPLAY = {
  admin: 'Admin',
  kepala_lingkungan: 'Kepala Lingkungan',
  ketua_rw: 'Ketua RW',
  ketua_rt: 'Ketua RT',
  rt: 'RT',
  rw: 'RW',
  warga: 'Warga'
};

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'google' | 'email'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { user, loginWithGoogle, loginWithEmail, registerWithEmail, forgotPassword, error, clearError } = useAuth();
  const { isAdmin, isRW, isRT } = useRole();
  const navigate = useNavigate();

  // Handle Google Login (uses popup auth to prevent bounce tracking issues)
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      clearError();
      await loginWithGoogle();
      // AuthContext's onAuthStateChanged will handle the user state.
      // Don't navigate here - the popup handles the flow.
    } catch (err) {
      console.error('[Login] Google error:', err);
      setLoading(false);
    }
  };

  // Navigate based on role
  const navigateAfterLogin = () => {
    // Always redirect to /dashboard
    // App.tsx route already handles role-based routing:
    // Admin/RW/RT → DashboardPengurus, Warga → redirect to dashboard-warga
    navigate('/dashboard');
  };

  // Trigger navigation after successful Google popup login
  React.useEffect(() => {
    if (user) {
      navigateAfterLogin();
    }
  }, [user, navigateAfterLogin]);

  // Handle Email Login
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      clearError();
      if (isRegister) {
        await registerWithEmail(email, password);
        alert('Registrasi berhasil! Silakan login.');
        setIsRegister(false);
      } else {
        await loginWithEmail(email, password);
        navigateAfterLogin();
      }
    } catch (err) {
      console.error('[Login] Email error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert('Masukkan email untuk reset password');
      return;
    }
    setLoading(true);
    try {
      clearError();
      await forgotPassword(email);
      setResetSent(true);
    } catch (err) {
      console.error('[Login] Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>RtRw-Net</h1>
        <p className={styles.subtitle}>Sistem Informasi Komunitas</p>

        {/* Tab Switcher */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'google' ? styles.active : ''}`}
            onClick={() => setActiveTab('google')}
          >
            🔵 Google
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'email' ? styles.active : ''}`}
            onClick={() => setActiveTab('email')}
          >
            ✉️ Email
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={clearError} className={styles.closeError}>×</button>
          </div>
        )}

        {/* Google Login Tab */}
        {activeTab === 'google' && (
          <div className={styles.tabContent}>
            <button
              className={styles.googleBtn}
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className={styles.googleIcon} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {loading ? 'Loading...' : 'Masuk dengan Google'}
            </button>
            <p className={styles.hint}>Login cepat dengan akun Google Anda</p>
          </div>
        )}

        {/* Email Login Tab */}
        {activeTab === 'email' && (
          <div className={styles.tabContent}>
            {!showForgot ? (
              <form onSubmit={handleEmailSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email-input">Email</label>
                  <input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="password-input">Password</label>
                  <input
                    id="password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 karakter"
                    required
                    minLength={6}
                    autoComplete={isRegister ? "new-password" : "current-password"}
                  />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Loading...' : isRegister ? 'Daftar' : 'Masuk'}
                </button>
                <div className={styles.formLinks}>
                  <button type="button" onClick={() => setShowForgot(true)} className={styles.link}>
                    Lupa Password?
                  </button>
                  <button type="button" onClick={() => setIsRegister(!isRegister)} className={styles.link}>
                    {isRegister ? 'Sudah punya akun?' : 'Daftar baru'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotPassword} className={styles.form}>
                {resetSent ? (
                  <div className={styles.success}>
                    ✉️ Email reset sudah dikirim! Cek inbox Anda.
                    <button onClick={() => { setShowForgot(false); setResetSent(false); }} className={styles.link}>
                      Kembali ke Login
                    </button>
                  </div>
                ) : (
                  <>
                    <p className={styles.hint}>Masukkan email untuk reset password</p>
                    <div className={styles.inputGroup}>
                      <label htmlFor="reset-email-input">Email</label>
                      <input
                        id="reset-email-input"
                        name="reset-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                      {loading ? 'Sending...' : 'Kirim Link Reset'}
                    </button>
                    <button type="button" onClick={() => setShowForgot(false)} className={styles.link}>
                      Kembali ke Login
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        )}

        {/* Role Info */}
        <div className={styles.roleInfo}>
          <p>Login sebagai:</p>
          <span>Admin: aris@gmail.com</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
