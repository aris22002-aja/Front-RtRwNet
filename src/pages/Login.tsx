// ============================================================
// Login Page — SSO Google & Email/Password
// ============================================================

import React, { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EnvelopeSimple, LockKey, Eye, EyeSlash, HouseLine } from 'lucide-react';
import './Login.css';

const Login: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login Google gagal. Coba lagi.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email dan password wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        if (password.length < 6) {
          setError('Password minimal 6 karakter.');
          return;
        }
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      navigate(from, { replace: true });
    } catch (err: unknown) {
      let msg = 'Autentikasi gagal.';
      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string };
        switch (firebaseError.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            msg = 'Email atau password salah.';
            break;
          case 'auth/email-already-in-use':
            msg = 'Email sudah terdaftar. Gunakan login.';
            break;
          case 'auth/weak-password':
            msg = 'Password terlalu lemah.';
            break;
          case 'auth/invalid-email':
            msg = 'Format email tidak valid.';
            break;
          default:
            msg = firebaseError.code.replace('auth/', '').replace(/-/g, ' ');
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo & Branding */}
        <div className="login-header">
          <div className="login-logo">
            <HouseLine size={48} weight="duotone" color="var(--primary)" />
          </div>
          <h1 className="login-title">Rt-Rw-Net</h1>
          <p className="login-subtitle">
            Sistem Informasi Rumah Tangga Warga<br />
            Graha Harmony 5
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-error" role="alert">
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleEmailSubmit} className="login-form">
          {/* Email Field */}
          <div className="input-group">
            <label htmlFor="email" className="label">Email</label>
            <div className="input-wrapper">
              <EnvelopeSimple size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                className="input"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="input-group">
            <label htmlFor="password" className="label">Password</label>
            <div className="input-wrapper">
              <LockKey size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                disabled={loading}
                required
                minLength={6}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? '⏳' : isRegister ? 'Daftar' : 'Masuk'}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider">
          <span>atau</span>
        </div>

        {/* Google SSO Button */}
        <button
          type="button"
          className="btn btn-google btn-full"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Lanjutkan dengan Google
        </button>

        {/* Toggle Register/Login */}
        <p className="login-toggle">
          {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
          >
            {isRegister ? 'Masuk' : 'Daftar'}
          </button>
        </p>

        {/* Footer */}
        <div className="login-footer">
          <p>© 2026 Rt-Rw-Net · Graha Harmony 5</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
