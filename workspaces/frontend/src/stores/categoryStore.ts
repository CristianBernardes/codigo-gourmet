import { defineStore } from 'pinia';
import { categoryService } from '../services/categoryService';
import type { Category } from '../types/models';

interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
  loading: boolean;
  error: string | null;
}

export const useCategoryStore = defineStore('category', {
  state: (): CategoryState => ({
    categories: [],
    currentCategory: null,
    loading: false,
    error: null
  }),

  getters: {
    allCategories: (state) => state.categories,
    categoryById: (state) => (id: number) => state.categories.find(cat => cat.id === id),
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    errorMessage: (state) => state.error
  },

  actions: {
    async fetchCategories() {
      this.loading = true;
      this.error = null;

      try {
        const response = await categoryService.getAll();
        this.categories = response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Falha ao carregar categorias';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchCategoryById(id: number) {
      this.loading = true;
      this.error = null;

      try {
        const response = await categoryService.getById(id);
        this.currentCategory = response.data;
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Falha ao carregar categoria';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createCategory(category: { nome: string }) {
      this.loading = true;
      this.error = null;

      try {
        const response = await categoryService.create(category);
        this.categories.push(response.data);
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Falha ao criar categoria';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateCategory(id: number, category: { nome: string }) {
      this.loading = true;
      this.error = null;

      try {
        const response = await categoryService.update(id, category);
        const index = this.categories.findIndex(c => c.id === id);
        if (index !== -1) {
          this.categories[index] = response.data;
        }
        if (this.currentCategory?.id === id) {
          this.currentCategory = response.data;
        }
        return response.data;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Falha ao atualizar categoria';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteCategory(id: number) {
      this.loading = true;
      this.error = null;

      try {
        await categoryService.delete(id);
        this.categories = this.categories.filter(c => c.id !== id);
        if (this.currentCategory?.id === id) {
          this.currentCategory = null;
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Falha ao excluir categoria';
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
