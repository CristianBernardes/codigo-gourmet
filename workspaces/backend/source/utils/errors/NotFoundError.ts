import { ERROR_MESSAGES } from '../constants';
import AppError from './AppError';

/**
 * Error class for resource not found errors
 * Extends AppError with a 404 status code
 */
export class NotFoundError extends AppError {
  /**
   * Create a new NotFoundError
   * @param message Error message
   */
  constructor(message: string = ERROR_MESSAGES.NOT_FOUND) {
    // Not found errors always use 404 Not Found status code
    super(message, 404, true);
  }

  /**
   * Create a NotFoundError for a user
   * @param id User ID
   * @returns NotFoundError instance
   */
  static forUser(id?: number): NotFoundError {
    const message = id 
      ? `Usuário com ID ${id} não encontrado` 
      : ERROR_MESSAGES.USER_NOT_FOUND;
    return new NotFoundError(message);
  }

  /**
   * Create a NotFoundError for a category
   * @param id Category ID
   * @returns NotFoundError instance
   */
  static forCategory(id?: number): NotFoundError {
    const message = id 
      ? `Categoria com ID ${id} não encontrada` 
      : ERROR_MESSAGES.CATEGORY_NOT_FOUND;
    return new NotFoundError(message);
  }

  /**
   * Create a NotFoundError for a recipe
   * @param id Recipe ID
   * @returns NotFoundError instance
   */
  static forRecipe(id?: number): NotFoundError {
    const message = id 
      ? `Receita com ID ${id} não encontrada` 
      : ERROR_MESSAGES.RECIPE_NOT_FOUND;
    return new NotFoundError(message);
  }

  /**
   * Create a NotFoundError for a generic resource
   * @param resourceType Resource type (e.g., 'Comentário', 'Avaliação')
   * @param id Resource ID
   * @returns NotFoundError instance
   */
  static forResource(resourceType: string, id?: number): NotFoundError {
    const message = id 
      ? `${resourceType} com ID ${id} não encontrado` 
      : `${resourceType} não encontrado`;
    return new NotFoundError(message);
  }
}

export default NotFoundError;