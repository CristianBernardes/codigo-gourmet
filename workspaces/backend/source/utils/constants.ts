/**
 * Application-wide constants
 */

// Environment
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_TEST = NODE_ENV === 'test';

// Server
export const PORT = parseInt(process.env.PORT || '3000', 10);
export const API_PREFIX = '/api';
export const API_VERSION = '';

// Authentication
export const JWT_SECRET = process.env.JWT_SECRET || 'codigo_gourmet_secret_key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
export const BCRYPT_SALT_ROUNDS = 10;

// Database
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
export const DB_USER = process.env.DB_USER || 'desafio';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'desafio';
export const DB_NAME = process.env.DB_NAME || 'codigo_gourmet';

// Rate limiting
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per window
export const AUTH_RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per window for auth endpoints
export const SEARCH_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
export const SEARCH_RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute for search endpoints

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Validation
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 100;
export const MIN_LOGIN_LENGTH = 3;
export const MAX_LOGIN_LENGTH = 100;
export const MIN_NAME_LENGTH = 3;
export const MAX_NAME_LENGTH = 100;
export const MIN_RECIPE_NAME_LENGTH = 3;
export const MAX_RECIPE_NAME_LENGTH = 255;
export const MIN_RECIPE_TEXT_LENGTH = 10;

// Error messages
export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Erro interno do servidor',
  UNAUTHORIZED: 'Não autorizado',
  FORBIDDEN: 'Acesso proibido',
  NOT_FOUND: 'Recurso não encontrado',
  VALIDATION_ERROR: 'Erro de validação',
  DUPLICATE_LOGIN: 'Este login já está em uso',
  DUPLICATE_CATEGORY: 'Já existe uma categoria com este nome',
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  USER_NOT_FOUND: 'Usuário não encontrado',
  CATEGORY_NOT_FOUND: 'Categoria não encontrada',
  RECIPE_NOT_FOUND: 'Receita não encontrada',
  RECIPE_PERMISSION_DENIED: 'Você não tem permissão para editar esta receita',
  RECIPE_DELETE_PERMISSION_DENIED: 'Você não tem permissão para excluir esta receita'
};

// Success messages
export const SUCCESS_MESSAGES = {
  CATEGORY_DELETED: 'Categoria excluída com sucesso',
  RECIPE_DELETED: 'Receita excluída com sucesso'
};

// Response status
export const RESPONSE_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error'
};
