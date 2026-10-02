import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAo37m-6Lw81J5jrFTSDpleJTA7jrSawxc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "combinakai.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "combinakai",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "combinakai.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "490402338036",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:490402338036:web:db007323916d1a2d2ffaa1",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-4XVK6BBR87",
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  if (isFirebaseConfigured()) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Initialize Analytics in browser if supported
    if (typeof window !== 'undefined') {
      import('firebase/analytics').then(({ getAnalytics, isSupported }) => {
        isSupported().then((yes) => {
          if (yes && app) {
            getAnalytics(app);
          }
        });
      });
    }
  }
} catch (err) {
  console.warn('Firebase initialization note:', err);
}

export { app, auth, db };
