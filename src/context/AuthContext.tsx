import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '../firebaseConfig'; // Assuming you have this file
import { doc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userType: 'patient' | 'doctor' | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, type: 'patient' | 'doctor') => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'patient' | 'doctor' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // In a real app, you would fetch the userType from your database (e.g., Firestore)
      // For now, we'll leave it null on initial load
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // You might want to fetch userType from Firestore here
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setUserType(null);
    } catch (error) {
        console.error("Logout error:", error);
    }
  };

  const register = async (name: string, email: string, password: string, type: 'patient' | 'doctor'): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Update the user's profile with their name
      await updateProfile(newUser, { displayName: name });
      
      // Save user role in Firestore
      await setDoc(doc(db, "users", newUser.uid), {
        uid: newUser.uid,
        name,
        email,
        role: type,
        createdAt: new Date(),
      });

      setUser({ ...newUser, displayName: name }); // Update local user state
      setUserType(type);
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const value = {
    user,
    userType,
    loading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};