import { defineStore } from 'pinia';
import { recipeService } from '../services/recipeService';
import type { Recipe, PaginationParams, RecipeSearchParams } from '../types/models';

interface RecipeState {
  recipes: Recipe[];
  currentRecipe: Recipe | null;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
}

export const useRecipeStore = defineStore('recipe', {
  state: (): RecipeState => ({
    recipes: [],
    currentRecipe: null,
    pagination: {
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0
    },
    loading: false,
    error: null
  }),

  getters: {
    allRecipes: (state) => state.recipes,
    recipeById: (state) => (id: number) => state.recipes.find(recipe => recipe.id === id),
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    errorMessage: (state) => state.error,
    currentPage: (state) => state.pagination.page,
    totalPages: (state) => state.pagination.totalPages
  },

  actions: {
    async fetchRecipes(params: PaginationParams = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await recipeService.getAll(params);
        this.recipes = response.data;
        this.pagination = response.meta;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Falha ao carregar receitas';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchRecipeById(id: number) {
      this.loading = true;
      this.error = null;

      try {
        const response = await recipeService.getById(id);
        this.currentRecipe = response.data;
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Falha ao carregar receita';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createRecipe(recipe: Partial<Recipe>) {
      this.loading = true;
      this.error = null;

      try {
        const response = await recipeService.create(recipe);
        // Optionally add to list if we're viewing the first page
        if (this.pagination.page === 1) {
          this.recipes = [response.data, ...this.recipes];
          if (this.recipes.length > this.pagination.pageSize) {
            this.recipes.pop();
          }
          this.pagination.totalItems++;
          this.pagination.totalPages = Math.ceil(this.pagination.totalItems / this.pagination.pageSize);
        }
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Falha ao criar receita';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateRecipe(id: number, recipe: Partial<Recipe>) {
      this.loading = true;
      this.error = null;

      try {
        const response = await recipeService.update(id, recipe);
        // Update in list if present
        const index = this.recipes.findIndex(r => r.id === id);
        if (index !== -1) {
          this.recipes[index] = response.data;
        }
        // Update current recipe if it's the one being edited
        if (this.currentRecipe?.id === id) {
          this.currentRecipe = response.data;
        }
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Falha ao atualizar receita';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteRecipe(id: number) {
      this.loading = true;
      this.error = null;

      try {
        await recipeService.delete(id);
        // Remove from list if present
        this.recipes = this.recipes.filter(r => r.id !== id);
        // Clear current recipe if it's the one being deleted
        if (this.currentRecipe?.id === id) {
          this.currentRecipe = null;
        }
        // Update pagination
        this.pagination.totalItems--;
        this.pagination.totalPages = Math.ceil(this.pagination.totalItems / this.pagination.pageSize);
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Falha ao excluir receita';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async searchRecipes(params: RecipeSearchParams = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await recipeService.search(params);
        this.recipes = response.data;
        this.pagination = response.meta;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Falha na busca de receitas';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchRecipesByUserId(userId: number, params: PaginationParams = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await recipeService.getByUserId(userId, params);
        this.recipes = response.data;
        this.pagination = response.meta;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Falha ao carregar receitas do usuário';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchRecipesByCategoryId(categoryId: number, params: PaginationParams = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await recipeService.getByCategoryId(categoryId, params);
        this.recipes = response.data;
        this.pagination = response.meta;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Falha ao carregar receitas da categoria';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    clearCurrentRecipe() {
      this.currentRecipe = null;
    },

    clearError() {
      this.error = null;
    }
  }
});
