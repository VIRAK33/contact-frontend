const API_BASE_URL = 'http://localhost:3000/api/v1'; // Update this to your actual API base URL

// Types
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

// API Error class
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

  // Handle 204 No Content responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// Auth API calls
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

// Integrations API calls
export const integrationsApi = {
  getAll: async (): Promise<{ integrations: Integration[] }> => {
    return makeRequest('/integrations');
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

// Submissions API calls
export const submissionsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    integrationId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<SubmissionsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.integrationId) searchParams.set('integrationId', params.integrationId);
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);

    const queryString = searchParams.toString();
    return makeRequest(`/submissions${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string): Promise<Submission> => {
    return makeRequest(`/submissions/${id}`);
  },

  delete: async (id: string) => {
    return makeRequest(`/submissions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Public submission endpoint (no auth required)
export const publicApi = {
  submit: async (data: Record<string, any>, apiKey: string) => {
    return fetch(`${API_BASE_URL}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(data),
    });
  },
};