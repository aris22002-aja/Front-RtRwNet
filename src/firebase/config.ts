// ============================================================
// Firebase Configuration — Rt-Rw-Net
// ============================================================

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { getDatabase, ref, set, get, Database } from 'firebase/database';

// --- Environment Variables ---
// Obtain from Firebase Console > Project Settings > Your Apps > Web App
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// --- Singleton Initialization ---
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth: Auth = getAuth(app);
const database: Database = getDatabase(app);

// --- Google SSO Provider ---
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  hd: import.meta.env.VITE_AUTH_DOMAIN || undefined, // Restrict to specific domain (e.g., gmail.com)
});

// --- Auth Functions ---

/**
 * Sign in with Google Account (SSO)
 * @returns User credential
 */
export const signInWithGoogle = async (): Promise<User> => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
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
  await set(ref(database, `users/${uid}`), {
    ...profile,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Retrieve user profile from Realtime Database
 */
export const getUserProfile = async (uid: string): Promise<Record<string, unknown> | null> => {
  const snapshot = await get(ref(database, `users/${uid}`));
  return snapshot.exists() ? snapshot.val() : null;
};

export { app, auth, database };
