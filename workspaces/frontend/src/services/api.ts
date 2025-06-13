import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create a base API instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle specific error cases
    if (error.response) {
      const { status } = error.response;

      // Handle authentication errors
      if (status === 401) {
        // Clear token and redirect to login if unauthorized
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

      // Handle rate limiting
      if (status === 429) {
        console.error('Rate limit exceeded. Please try again later.');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
