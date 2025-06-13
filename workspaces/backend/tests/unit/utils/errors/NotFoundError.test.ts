import { NotFoundError } from '../../../../source/utils/errors/NotFoundError';
import { ERROR_MESSAGES } from '../../../../source/utils/constants';

describe('NotFoundError', () => {
  describe('constructor', () => {
    it('should create an error with default message', () => {
      // Act
      const error = new NotFoundError();

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(ERROR_MESSAGES.NOT_FOUND);
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });

    it('should create an error with custom message', () => {
      // Act
      const error = new NotFoundError('Custom not found message');

      // Assert
      expect(error.message).toBe('Custom not found message');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('forUser', () => {
    it('should create an error with user ID in message when ID is provided', () => {
      // Act
      const error = NotFoundError.forUser(123);

      // Assert
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe('Usuário com ID 123 não encontrado');
      expect(error.statusCode).toBe(404);
    });

    it('should create an error with generic message when ID is not provided', () => {
      // Act
      const error = NotFoundError.forUser();

      // Assert
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe(ERROR_MESSAGES.USER_NOT_FOUND);
      expect(error.statusCode).toBe(404);
    });
  });

  describe('forCategory', () => {
    it('should create an error with category ID in message when ID is provided', () => {
      // Act
      const error = NotFoundError.forCategory(456);

      // Assert
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe('Categoria com ID 456 não encontrada');
      expect(error.statusCode).toBe(404);
    });

    it('should create an error with generic message when ID is not provided', () => {
      // Act
      const error = NotFoundError.forCategory();

      // Assert
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe(ERROR_MESSAGES.CATEGORY_NOT_FOUND);
      expect(error.statusCode).toBe(404);
    });
  });

  describe('forRecipe', () => {
    it('should create an error with recipe ID in message when ID is provided', () => {
      // Act
      const error = NotFoundError.forRecipe(789);

      // Assert
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe('Receita com ID 789 não encontrada');
      expect(error.statusCode).toBe(404);
    });

    it('should create an error with generic message when ID is not provided', () => {
      // Act
      const error = NotFoundError.forRecipe();

      // Assert
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe(ERROR_MESSAGES.RECIPE_NOT_FOUND);
      expect(error.statusCode).toBe(404);
    });
  });

  describe('forResource', () => {
    it('should create an error with resource type and ID in message when ID is provided', () => {
      // Act
      const error = NotFoundError.forResource('Comentário', 101);

      // Assert
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe('Comentário com ID 101 não encontrado');
      expect(error.statusCode).toBe(404);
    });

    it('should create an error with resource type in message when ID is not provided', () => {
      // Act
      const error = NotFoundError.forResource('Avaliação');

      // Assert
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe('Avaliação não encontrado');
      expect(error.statusCode).toBe(404);
    });
  });
});