import api from './api';
import type { ApiResponse } from '../types/models';

/**
 * Service for user-related API calls
 */
export const usuarioService = {
  /**
   * Get all users (only id and name)
   */
  getAllUsers: async (): Promise<ApiResponse<{id: number, nome: string}[]>> => {
    const response = await api.get<ApiResponse<{id: number, nome: string}[]>>('/usuarios');
    return response.data;
  }
};