// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi, User, ApiError, ChatMessage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// --- NEW: Define the shape of our upgraded context ---
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  unreadCount: number; // For the badge
  clearUnreadCount: () => void; // To reset the badge
  wsRef: React.MutableRefObject<WebSocket | null>; // To send messages from ChatView
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
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  
  // --- NEW: State for the unread message count ---
  const [unreadCount, setUnreadCount] = useState(0);

  const isAuthenticated = !!user;

  // --- NEW: Global WebSocket Connection Logic ---
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const connectWebSocket = () => {
        if (wsRef.current && wsRef.current.readyState < 2) return;

        const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => console.log("Global WebSocket connected.");
        ws.onclose = () => {
          if (localStorage.getItem('auth_token')) {
            setTimeout(connectWebSocket, 5000);
          }
        };
        ws.onerror = (error) => console.error("Global WebSocket error:", error);

        ws.onmessage = (event) => {
          try {
            const newMessageData: ChatMessage = JSON.parse(event.data);

            if (newMessageData.type === 'message') {
              queryClient.setQueryData(
                ['chatMessages', newMessageData.chat_room_id],
                (oldData: ChatMessage[] = []) => {
                  if (!oldData.some(m => m.id === newMessageData.id)) {
                    return [...oldData, newMessageData];
                  }
                  return oldData;
                }
              );

              if (newMessageData.sender_id !== user.id) {
                setUnreadCount(prev => prev + 1);

                toast({
                  title: `New message from Visitor`,
                  description: (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>V</AvatarFallback>
                      </Avatar>
                      <p className="truncate">{newMessageData.content}</p>
                    </div>
                  ),
                });
              }
              
              queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
            }
          } catch (error) {
            console.error('Error processing global WebSocket message:', error);
          }
        };
      };
      
      connectWebSocket();

      return () => {
        wsRef.current?.close();
      };
    }
  }, [isAuthenticated, user, queryClient, toast]);

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
      const apiError = error as ApiError;
      toast({
        title: "Login failed",
        description: apiError.message || "An unexpected error occurred.",
        variant: "destructive",
      });
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
        const apiError = error as ApiError;
        toast({
            title: "Registration failed",
            description: apiError.message || "An unexpected error occurred.",
            variant: "destructive",
        });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    wsRef.current?.close(); // Ensure disconnection on logout
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
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const clearUnreadCount = () => setUnreadCount(0);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    unreadCount,
    clearUnreadCount,
    wsRef,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</Auth-Context.Provider>;
};