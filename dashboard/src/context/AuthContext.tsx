'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/utils/api';

interface User {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'TENANT_ADMIN' | 'OFFICER' | 'GUARD' | 'RESIDENT';
  firstName: string;
  lastName: string;
  tenantId?: string;
  organizationId?: string;
  tenant?: any;
  organization?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const refreshProfile = async (savedToken: string) => {
      try {
        const res = await api.get('/auth/profile', {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });
        const fullUser = res.data.data;
        setUser(fullUser);
        localStorage.setItem('klb_user', JSON.stringify(fullUser));
      } catch (error) {
        console.error('Failed to refresh profile');
      }
    };

    const savedToken = localStorage.getItem('klb_token');
    const savedUser = localStorage.getItem('klb_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      refreshProfile(savedToken);
    } else if (!pathname.includes('/login')) {
      router.push('/login');
    }
    
    setIsLoading(false);
  }, [pathname, router]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('klb_token', newToken);
    localStorage.setItem('klb_user', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    router.push('/dashboard');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('klb_token');
    localStorage.removeItem('klb_user');
    delete axios.defaults.headers.common['Authorization'];
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
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
}
