import api from './api';
import type { Recipe, ApiResponse, PaginatedResponse, PaginationParams, RecipeSearchParams } from '../types/models';

/**
 * Service for recipe-related API calls
 */
export const recipeService = {
  /**
   * Get all recipes with pagination
   */
  getAll: async (params: PaginationParams = {}): Promise<PaginatedResponse<Recipe>> => {
    const response = await api.get<PaginatedResponse<Recipe>>('/receitas', { params });
    return response.data;
  },

  /**
   * Get a recipe by ID
   */
  getById: async (id: number): Promise<ApiResponse<Recipe>> => {
    const response = await api.get<ApiResponse<Recipe>>(`/receitas/${id}`);
    return response.data;
  },

  /**
   * Create a new recipe
   */
  create: async (recipe: Partial<Recipe>): Promise<ApiResponse<Recipe>> => {
    const response = await api.post<ApiResponse<Recipe>>('/receitas', recipe);
    return response.data;
  },

  /**
   * Update an existing recipe
   */
  update: async (id: number, recipe: Partial<Recipe>): Promise<ApiResponse<Recipe>> => {
    const response = await api.put<ApiResponse<Recipe>>(`/receitas/${id}`, recipe);
    return response.data;
  },

  /**
   * Delete a recipe
   */
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/receitas/${id}`);
    return response.data;
  },

  /**
   * Search recipes with filters
   */
  search: async (params: RecipeSearchParams = {}): Promise<PaginatedResponse<Recipe>> => {
    const response = await api.get<PaginatedResponse<Recipe>>('/receitas/search', { params });
    return response.data;
  },

  /**
   * Get recipes by user ID
   */
  getByUserId: async (userId: number, params: PaginationParams = {}): Promise<PaginatedResponse<Recipe>> => {
    const response = await api.get<PaginatedResponse<Recipe>>(`/receitas/usuario/${userId}`, { params });
    return response.data;
  },

  /**
   * Get recipes by category ID
   */
  getByCategoryId: async (categoryId: number, params: PaginationParams = {}): Promise<PaginatedResponse<Recipe>> => {
    const response = await api.get<PaginatedResponse<Recipe>>(`/receitas/categoria/${categoryId}`, { params });
    return response.data;
  }
};
