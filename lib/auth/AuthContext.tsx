'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { TokenService } from './token';
import { TokenRefreshService } from './refresh';
import { api } from '../api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

interface User {
  id: string;
  email: string;
  permissions: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        if (TokenService.isTokenValid()) {
          const response = await api.get('/api/auth/user');
          setUser(response.data.user);
          TokenRefreshService.startRefreshInterval();
        }
      } catch (error) {
        TokenService.clearToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      // Cleanup refresh interval on unmount
      // Add cleanup logic here if needed
    };
  }, []);

  const login = async (token: string) => {
    TokenService.setToken(token);
    const response = await api.get('/api/auth/user');
    setUser(response.data.user);
    TokenRefreshService.startRefreshInterval();
  };

  const logout = () => {
    TokenService.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 