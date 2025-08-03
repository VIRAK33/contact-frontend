// src/lib/api.ts

import { makeRequest } from './apiClient'; // Import from our new client file

// --- TypeScript Interfaces for Data Structures ---

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Integration {
  id: string;
  website_url: string;
  is_forwarding_enabled: boolean;
  telegram_bot_token?: string;
  telegram_chat_id?: string;
}

export interface CreateIntegrationRequest {
  website_url: string;
  telegram_bot_token: string;
  telegram_chat_id: string;
  is_forwarding_enabled: boolean;
}

export interface CreateIntegrationResponse {
  integration_id: string;
  api_key: string;
}

export interface Submission {
  id: string;
  user_id: string;
  integration_id: string;
  timestamp: string;
  form_data: Record<string, any>;
}

export interface SubmissionsResponse {
  total_items: number;
  total_pages: number;
  current_page: number;
  submissions: Submission[];
}

export interface ChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  type?: 'message';
}

export interface ChatRoom {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread_count: number;
}

// --- API Endpoint Definitions ---

export const authApi = {
  register: (data: { name: string; email: string; password: string }) => 
    makeRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  
  login: (data: { email: string; password: string }): Promise<AuthResponse> => 
    makeRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  
  getProfile: (): Promise<{ user: User }> => 
    makeRequest('/auth/profile'),
};

export const integrationsApi = {
  getAll: (): Promise<{ integrations: Integration[] }> => 
    makeRequest('/integrations'),
  
  create: (data: CreateIntegrationRequest): Promise<CreateIntegrationResponse> =>
    makeRequest('/integrations', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<CreateIntegrationRequest>) =>
    makeRequest(`/integrations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    makeRequest(`/integrations/${id}`, { method: 'DELETE' }),
};

export const submissionsApi = {
  getAll: (params?: { page?: number; limit?: number; }): Promise<SubmissionsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const queryString = searchParams.toString();
    return makeRequest(`/submissions${queryString ? `?${queryString}` : ''}`);
  },

  delete: (id: string) =>
    makeRequest(`/submissions/${id}`, { method: 'DELETE' }),
};

export const chatApi = {
  getRooms: (): Promise<ChatRoom[]> => 
    makeRequest('/chat/rooms'),
  
  getMessages: (roomId: string): Promise<ChatMessage[]> => 
    makeRequest(`/chat/rooms/${roomId}/messages`),
  
  createRoom: (data: { name: string; participants: string[] }): Promise<ChatRoom> => 
    makeRequest('/chat/rooms', { method: 'POST', body: JSON.stringify(data) }),

  clearUnreadCount: (roomId: string): Promise<{ message: string }> =>
    makeRequest(`/chat/rooms/${roomId}/read`, { method: 'POST' }),
};