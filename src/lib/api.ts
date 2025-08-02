// src/lib/api.ts

const API_BASE_URL = 'http://localhost:3000/api/v1'; // Your API base URL

// --- Existing Types ---
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


// --- ADDED: Chat Feature Types ---
export interface ChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  type?: 'message';
  // Frontend-specific properties
  isOwn?: boolean;
  sender?: { name: string };
}


export interface ChatRoom {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread_count: number;
}


// --- API Error class ---
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to make authenticated requests
const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || response.statusText);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// --- Existing API Calls ---
export const authApi = {
  register: async (userData: { name: string; email: string; password: string }) => {
    return makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    return makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  getProfile: async (): Promise<{ user: User }> => {
    return makeRequest('/auth/profile');
  },
};

export const integrationsApi = {
  getAll: async (): Promise<{ integrations: Integration[] }> => {
    // Note: The backend returns an array directly, but we wrap it for consistency
    const integrations = await makeRequest('/integrations');
    return { integrations };
  },
  create: async (data: CreateIntegrationRequest): Promise<CreateIntegrationResponse> => {
    return makeRequest('/integrations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: string, data: Partial<CreateIntegrationRequest>) => {
    return makeRequest(`/integrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string) => {
    return makeRequest(`/integrations/${id}`, {
      method: 'DELETE',
    });
  },
};

export const submissionsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<SubmissionsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    return makeRequest(`/submissions${queryString ? `?${queryString}` : ''}`);
  },
  delete: async (id: string) => {
    return makeRequest(`/submissions/${id}`, {
      method: 'DELETE',
    });
  },
};

// --- ADDED: Chat API Calls ---
export const chatApi = {
  getRooms: async (): Promise<ChatRoom[]> => {
    return makeRequest('/chat/rooms');
  },
  getMessages: async (roomId: string): Promise<ChatMessage[]> => {
    return makeRequest(`/chat/rooms/${roomId}/messages`);
  },
  createRoom: async (data: { name: string; participants: string[] }): Promise<ChatRoom> => {
    return makeRequest('/chat/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};