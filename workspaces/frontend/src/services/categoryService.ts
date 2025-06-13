import api from './api';
import type { Category, ApiResponse } from '../types/models';

/**
 * Service for category-related API calls
 */
export const categoryService = {
  /**
   * Get all categories
   */
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get<ApiResponse<Category[]>>('/categorias');
    return response.data;
  },

  /**
   * Get a category by ID
   */
  getById: async (id: number): Promise<ApiResponse<Category>> => {
    const response = await api.get<ApiResponse<Category>>(`/categorias/${id}`);
    return response.data;
  },

  /**
   * Create a new category
   */
  create: async (category: { nome: string }): Promise<ApiResponse<Category>> => {
    const response = await api.post<ApiResponse<Category>>('/categorias', category);
    return response.data;
  },

  /**
   * Update an existing category
   */
  update: async (id: number, category: { nome: string }): Promise<ApiResponse<Category>> => {
    const response = await api.put<ApiResponse<Category>>(`/categorias/${id}`, category);
    return response.data;
  },

  /**
   * Delete a category
   */
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/categorias/${id}`);
    return response.data;
  }
};
