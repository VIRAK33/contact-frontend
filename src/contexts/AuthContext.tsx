// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query'; // Import useQueryClient
import { authApi, User } from '@/lib/api';
import { ApiError } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient(); // Get the query client instance
  const isAuthenticated = !!user;

  const handleApiError = (error: unknown, action: 'Login' | 'Register' | 'Auth check') => {
      console.error(`${action} error:`, error);
      if (error instanceof ApiError) {
          toast({ title: `${action} failed`, description: error.message, variant: "destructive" });
      } else {
          toast({ title: "An unexpected error occurred", description: "Please check the console.", variant: "destructive" });
      }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
      toast({ title: "Login successful", description: `Welcome back, ${response.user.name}!` });
      return true;
    } catch (error) {
      handleApiError(error, 'Login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await authApi.register({ name, email, password });
      toast({ title: "Registration successful", description: "Your account has been created. Please log in." });
      return true;
    } catch (error) {
      handleApiError(error, 'Register');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    // This is crucial: clear all cached data on logout to prevent data leakage
    queryClient.clear(); 
    toast({ title: "Logged out", description: "You have been successfully logged out." });
  };
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await authApi.getProfile();
        setUser(response.user);
      } catch (error) {
        handleApiError(error, 'Auth check');
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const value = { user, isLoading, isAuthenticated, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};