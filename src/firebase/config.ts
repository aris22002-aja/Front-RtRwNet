// ============================================================
// Firebase Configuration — Rt-Rw-Net
// ============================================================

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User, 
  Auth, 
  sendPasswordResetEmail as firebaseSendPasswordResetEmail 
} from 'firebase/auth';
import { getDatabase, ref, set, get, Database } from 'firebase/database';
import { getRedirectResult, signInWithRedirect } from 'firebase/auth';
import { getRedirectResult, signInWithRedirect } from 'firebase/auth';

// --- Environment Variables ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

// --- Singleton Initialization ---
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth: Auth = getAuth(app);

// Initialize Analytics (only in production to avoid errors in development)
const analytics: Analytics | null = import.meta.env.PROD && firebaseConfig.measurementId
  ? getAnalytics(app)
  : null;

// Validate databaseURL before initializing RTDB
const database = firebaseConfig.databaseURL
  ? getDatabase(app)
  : (() => {
      if (import.meta.env.DEV) {
        console.warn('[Firebase] databaseURL not configured. Realtime Database disabled.');
      }
      return null;
    })() as Database | null;

// --- Google SSO Provider ---
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  hd: import.meta.env.VITE_GOOGLE_HD_DOMAIN || undefined,
});

// --- Auth Functions ---

/**
 * Sign in with Google Account (SSO) using redirect method
 * Recommended: avoids COOP issues with popup method
 */
export const signInWithGoogle = async (): Promise<void> => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error: unknown) {
    if (import.meta.env.DEV) console.error('[Firebase] Google redirect signIn error:', error);
    throw error;
  }
};

/**
 * Get redirect result on page load (call after redirect back)
 */
export const getGoogleRedirectResult = async () => {
  try {
    return await getRedirectResult(auth);
  } catch (error: unknown) {
    if (import.meta.env.DEV) console.error('[Firebase] Redirect result error:', error);
    return null;
  }
};

/**
 * Sign in with Email and Password
 */
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

/**
 * Register new user with Email and Password
 */
export const registerWithEmail = async (email: string, password: string): Promise<User> => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
};

/**
 * Sign out current user
 */
export const logout = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  await firebaseSendPasswordResetEmail(auth, email);
};

/**
 * Observe authentication state changes
 */
export const observeAuthState = (callback: (user: User | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

// --- Realtime Database Functions ---

/**
 * Store user profile in Realtime Database
 */
export const saveUserProfile = async (uid: string, profile: Record<string, unknown>): Promise<void> => {
  if (!database) {
    if (import.meta.env.DEV) console.warn('[Firebase] saveUserProfile skipped: databaseURL not configured.');
    return;
  }
  await set(ref(database, `users/${uid}`), {
    ...profile,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Retrieve user profile from Realtime Database
 */
export const getUserProfile = async (uid: string): Promise<Record<string, unknown> | null> => {
  if (!database) {
    if (import.meta.env.DEV) console.warn('[Firebase] getUserProfile skipped: databaseURL not configured.');
    return null;
  }
  const snapshot = await get(ref(database, `users/${uid}`));
  return snapshot.exists() ? snapshot.val() : null;
};

export { app, auth, database, analytics };
