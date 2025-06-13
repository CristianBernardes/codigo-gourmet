// TypeScript interfaces for API models

// User model
export interface User {
  id: number;
  nome: string;
  login: string;
  criado_em?: string;
  alterado_em?: string;
}

// Category model
export interface Category {
  id: number;
  nome: string;
}

// Recipe model
export interface Recipe {
  id: number;
  id_usuarios: number;
  id_categorias: number;
  nome: string;
  tempo_preparo_minutos: number;
  porcoes: number;
  modo_preparo: string;
  ingredientes: string;
  criado_em?: string;
  alterado_em?: string;
  usuario?: User;
  categoria?: Category;
}

// Authentication models
export interface LoginRequest {
  login: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  login: string;
  senha: string;
}

export interface AuthResponse {
  status: string;
  data: {
    usuario: User;
    token: string;
  };
}

// API response models
export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  status: string;
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// Request params
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface RecipeSearchParams extends PaginationParams {
  termo_busca?: string;
  id_usuarios?: number;
  id_categorias?: number;
}