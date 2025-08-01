import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, ApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user;

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });
      
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.user.name}!`,
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof ApiError) {
        if (error.status === 401) {
          toast({
            title: "Login failed",
            description: "Invalid email or password",
            variant: "destructive",
          });
        } else if (error.status === 400) {
          toast({
            title: "Login failed",
            description: "Please provide both email and password",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login failed",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Login failed",
          description: "Network error. Please check your connection.",
          variant: "destructive",
        });
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await authApi.register({ name, email, password });
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. Please log in.",
      });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof ApiError) {
        if (error.status === 400) {
          toast({
            title: "Registration failed",
            description: "Email already exists or invalid data provided",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration failed",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Registration failed",
          description: "Network error. Please check your connection.",
          variant: "destructive",
        });
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

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
      console.error('Auth check error:', error);
      
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        // Token is invalid or expired
        localStorage.removeItem('auth_token');
        toast({
          title: "Session expired",
          description: "Please log in again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};