import { defineStore } from 'pinia';
import { usuarioService } from '../services/usuarioService';

interface UsuarioState {
  users: { id: number; nome: string }[];
  loading: boolean;
  error: string | null;
}

export const useUsuarioStore = defineStore('usuario', {
  state: (): UsuarioState => ({
    users: [],
    loading: false,
    error: null
  }),

  getters: {
    allUsers: (state) => state.users,
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    errorMessage: (state) => state.error
  },

  actions: {
    async fetchAllUsers() {
      this.loading = true;
      this.error = null;

      try {
        const response = await usuarioService.getAllUsers();
        this.users = response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Falha ao carregar usuários';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearError() {
      this.error = null;
    }
  }
});