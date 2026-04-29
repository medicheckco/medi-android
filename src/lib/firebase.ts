import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCdzlECeHoiDEYD9RpPmKjvxC6rSsR8u2I',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'meditrackandroid.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'meditrackandroid',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'meditrackandroid.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '552071838400',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:552071838400:web:2dd15d82ce20e170b34b25',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-CCVBZZC17G',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
