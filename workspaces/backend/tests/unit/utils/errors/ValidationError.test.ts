import { ValidationError } from '../../../../source/utils/errors/ValidationError';
import { ERROR_MESSAGES } from '../../../../source/utils/constants';

describe('ValidationError', () => {
  describe('constructor', () => {
    it('should create an error with default message and empty errors object', () => {
      // Act
      const error = new ValidationError();

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(ERROR_MESSAGES.VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.errors).toEqual({});
    });

    it('should create an error with custom message', () => {
      // Act
      const error = new ValidationError('Custom validation error');

      // Assert
      expect(error.message).toBe('Custom validation error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.errors).toEqual({});
    });

    it('should create an error with custom message and errors object', () => {
      // Arrange
      const validationErrors = {
        'field1': 'Field 1 is required',
        'field2': 'Field 2 must be a number'
      };

      // Act
      const error = new ValidationError('Custom validation error', validationErrors);

      // Assert
      expect(error.message).toBe('Custom validation error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.errors).toEqual(validationErrors);
    });
  });

  describe('fromJoiError', () => {
    it('should create a ValidationError from a Joi error with details', () => {
      // Arrange
      const joiError = {
        details: [
          { path: ['name'], message: 'Name is required' },
          { path: ['age'], message: 'Age must be a number' }
        ]
      };

      // Act
      const error = ValidationError.fromJoiError(joiError);

      // Assert
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe(ERROR_MESSAGES.VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual({
        'name': 'Name is required',
        'age': 'Age must be a number'
      });
    });

    it('should create a ValidationError with empty errors when Joi error has no details', () => {
      // Arrange
      const joiError = {};

      // Act
      const error = ValidationError.fromJoiError(joiError);

      // Assert
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe(ERROR_MESSAGES.VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual({});
    });

    it('should create a ValidationError with empty errors when Joi error details is not an array', () => {
      // Arrange
      const joiError = {
        details: 'not an array'
      };

      // Act
      const error = ValidationError.fromJoiError(joiError);

      // Assert
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe(ERROR_MESSAGES.VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual({});
    });

    it('should create a ValidationError with empty errors when Joi error is null', () => {
      // Act
      const error = ValidationError.fromJoiError(null);

      // Assert
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe(ERROR_MESSAGES.VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual({});
    });
  });

  describe('forField', () => {
    it('should create a ValidationError for a single field', () => {
      // Act
      const error = ValidationError.forField('email', 'Email is invalid');

      // Assert
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe(ERROR_MESSAGES.VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual({
        'email': 'Email is invalid'
      });
    });
  });
});