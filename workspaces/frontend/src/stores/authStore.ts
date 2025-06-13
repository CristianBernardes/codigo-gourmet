import { defineStore } from 'pinia';
import { authService } from '../services/authService';
import type { User, LoginRequest, RegisterRequest } from '../types/models';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: authService.isAuthenticated(),
    loading: false,
    error: null
  }),
  
  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    errorMessage: (state) => state.error
  },
  
  actions: {
    async login(credentials: LoginRequest) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authService.login(credentials);
        this.user = response.data.usuario;
        this.isAuthenticated = true;
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Falha na autenticação';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async register(userData: RegisterRequest) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authService.register(userData);
        this.user = response.data.usuario;
        this.isAuthenticated = true;
        return response;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Falha no registro';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchUserProfile() {
      if (!this.isAuthenticated) return;
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authService.getProfile();
        this.user = response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Falha ao carregar perfil';
        // If unauthorized, logout
        if (error.response?.status === 401) {
          this.logout();
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    logout() {
      authService.logout();
      this.user = null;
      this.isAuthenticated = false;
      this.error = null;
    },
    
    clearError() {
      this.error = null;
    }
  }
});