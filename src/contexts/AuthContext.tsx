import React, { createContext, useContext, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { User } from '../types';
import { apiService } from '../services/api';
import { auth, googleProvider } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, password?: string, name?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const isNative = Capacitor.isNativePlatform();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isNative) {
      let isMounted = true;

      const restoreNativeUser = async () => {
        try {
          const { user: nativeUser } = await FirebaseAuthentication.getCurrentUser();
          if (!nativeUser) {
            localStorage.removeItem('meditrack_token');
            if (isMounted) setUser(null);
            return;
          }

          const { token } = await FirebaseAuthentication.getIdToken({ forceRefresh: false });
          localStorage.setItem('meditrack_token', token);
          const userData = await apiService.getCurrentUser();
          if (isMounted) setUser(userData);
        } catch (err) {
          console.error('Native auth sync failed:', err);
          localStorage.removeItem('meditrack_token');
          if (isMounted) setUser(null);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      restoreNativeUser();

      return () => {
        isMounted = false;
      };
    }

    let authSettled = false;
    const finishAuth = () => {
      authSettled = true;
      setLoading(false);
    };

    const authTimeout = window.setTimeout(() => {
      if (!authSettled) {
        console.warn('Firebase auth initialization timed out.');
        setUser(null);
        finishAuth();
      }
    }, 20000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('meditrack_token', token);
          const userData = await apiService.getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error("Auth sync failed:", err);
          setUser(null);
        }
      } else {
        setUser(null);
        localStorage.removeItem('meditrack_token');
      }
      finishAuth();
    });

    getRedirectResult(auth).catch((err) => {
      console.error('Google redirect sign-in failed:', err);
    });

    return () => {
      window.clearTimeout(authTimeout);
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string) => {
    if (isNative) {
      await FirebaseAuthentication.signInWithEmailAndPassword({
        email,
        password: password || 'guest-mode-default',
      });
      const { token } = await FirebaseAuthentication.getIdToken({ forceRefresh: true });
      localStorage.setItem('meditrack_token', token);
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      return;
    }

    await signInWithEmailAndPassword(auth, email, password || 'guest-mode-default');
  };

  const register = async (email: string, password?: string, name?: string) => {
    if (isNative) {
      await FirebaseAuthentication.createUserWithEmailAndPassword({
        email,
        password: password || 'guest-mode-default',
      });
      const { token } = await FirebaseAuthentication.getIdToken({ forceRefresh: true });
      localStorage.setItem('meditrack_token', token);
      const userData = await apiService.register(email, password, name);
      setUser(userData.user);
      return;
    }

    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password || 'guest-mode-default');
    
    // We can't set the display name directly in AuthContext easily without updating profile
    // But we'll send it to our backend during the first registration check
    const token = await firebaseUser.getIdToken();
    localStorage.setItem('meditrack_token', token);
    
    // Explicitly call sync to create user in our DB
    const userData = await apiService.register(email, password, name);
    setUser(userData.user);
  };

  const loginWithGoogle = async () => {
    if (isNative) {
      await FirebaseAuthentication.signInWithGoogle();
      const { token } = await FirebaseAuthentication.getIdToken({ forceRefresh: true });
      localStorage.setItem('meditrack_token', token);
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      return;
    }

    await signInWithRedirect(auth, googleProvider);
  };

  const logout = () => {
    if (isNative) {
      FirebaseAuthentication.signOut().finally(() => {
        localStorage.removeItem('meditrack_token');
        setUser(null);
      });
      return;
    }

    signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
