import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      localStorage.setItem('token', response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      const response = await authService.register(userData);
      localStorage.setItem('token', response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    authService.logout().catch(() => {
      // Ignore logout errors
    });
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};