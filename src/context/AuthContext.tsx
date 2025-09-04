import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Patient } from '../types';
import { mockPatients } from '../data/mockData';

interface AuthContextType {
  user: Patient | null;
  userType: 'patient' | 'doctor' | null;
  login: (email: string, password: string, type: 'patient' | 'doctor') => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<Patient>, type: 'patient' | 'doctor') => Promise<boolean>;
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
  const [user, setUser] = useState<Patient | null>(null);
  const [userType, setUserType] = useState<'patient' | 'doctor' | null>(null);

  const login = async (email: string, password: string, type: 'patient' | 'doctor'): Promise<boolean> => {
    // Mock authentication
    if (type === 'patient') {
      const patient = mockPatients.find(p => p.email === email);
      if (patient) {
        setUser(patient);
        setUserType('patient');
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
  };

  const register = async (userData: Partial<Patient>, type: 'patient' | 'doctor'): Promise<boolean> => {
    // Mock registration
    if (type === 'patient') {
      const newPatient: Patient = {
        id: `patient-${Date.now()}`,
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || 'other'
      };
      setUser(newPatient);
      setUserType('patient');
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, userType, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
