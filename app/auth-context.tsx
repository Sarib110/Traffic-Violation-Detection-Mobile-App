import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { useRouter } from 'expo-router';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBlXVxh0h8nplmXPvZoHtgbmvf4Qju8S64',
  projectId: 'fyp-2-22295',
  storageBucket: 'fyp-2-22295.firebasestorage.app',
  messagingSenderId: '304274854493',
  appId: '1:304274854493:android:14ea16814345eb488b33b4',
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  signup: (email: string, password: string) => void;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return unsubscribe;
  }, []);

  const handleAuthError = (error: any) => {
    const errorMessages: Record<string, string> = {
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/weak-password': 'Password should be at least 6 characters.',
    };
    const errorMessage = errorMessages[error.code as keyof typeof errorMessages] || error.message;
    alert(errorMessage);
  };

  const login = (email: string, password: string) => {
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        setIsAuthenticated(true);
        // Use a safer navigation method
        try {
          router.replace('/Camera');
        } catch (e) {
          console.error('Navigation error:', e);
          // Fallback navigation
          setTimeout(() => {
            router.navigate('/Camera');
          }, 100);
        }
      })
      .catch(handleAuthError)
      .finally(() => setLoading(false));
  };

  const signup = (email: string, password: string) => {
    setLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        setIsAuthenticated(true);
        // Use a safer navigation method
        try {
          router.replace('/Camera');
        } catch (e) {
          console.error('Navigation error:', e);
          // Fallback navigation
          setTimeout(() => {
            router.navigate('/Camera');
          }, 100);
        }
      })
      .catch(handleAuthError)
      .finally(() => setLoading(false));
  };

  const logout = () => {
    setLoading(true);
    signOut(auth)
      .then(() => {
        setIsAuthenticated(false);
        // Use a safer navigation method
        try {
          router.replace('/login');
        } catch (e) {
          console.error('Navigation error:', e);
          // Fallback navigation
          setTimeout(() => {
            router.navigate('/login');
          }, 100);
        }
      })
      .catch((error) => alert('Logout failed: ' + error.message))
      .finally(() => setLoading(false));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        signup,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};