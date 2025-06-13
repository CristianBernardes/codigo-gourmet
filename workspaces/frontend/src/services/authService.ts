import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/models';
import type { ApiResponse } from '../types/models';

/**
 * Service for authentication-related API calls
 */
export const authService = {
  /**
   * Login with credentials
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);

    // Store token in localStorage for future requests
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }

    return response.data;
  },

  /**
   * Register a new user
   */
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);

    // Store token in localStorage for future requests
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }

    return response.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  /**
   * Logout the current user
   */
  logout: (): void => {
    localStorage.removeItem('token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};
