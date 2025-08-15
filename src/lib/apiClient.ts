// src/lib/apiClient.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// A custom error class to handle API errors gracefully
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// The core, dependency-free function for making API requests
export const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
  // Directly accesses localStorage, so it doesn't need to import useAuth
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
    let errorData;
    try {
      // Try to parse a JSON error message from the server
      errorData = await response.json();
    } catch (e) {
      // Fallback if the server sends a non-JSON error
      errorData = { message: response.statusText };
    }
    throw new ApiError(response.status, errorData.message || 'An unknown API error occurred');
  }

  // Handle successful but empty responses (like a DELETE request)
  if (response.status === 204) {
    return null;
  }

  return response.json();
};