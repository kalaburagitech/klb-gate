import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';

interface User {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'OFFICER' | 'GUARD' | 'RESIDENT';
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  unitNumber?: string;
  idProofUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to load auth', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { phoneNumber: string; otp: string }) => {
    try {
      const response = await authApi.verifyOTP(credentials.phoneNumber, credentials.otp);
      const { token, user } = response.data.data;

      await AsyncStorage.setItem('klb_token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      if (user.tenant?.id) {
        await AsyncStorage.setItem('klb_tenant_id', user.tenant.id);
      }

      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
