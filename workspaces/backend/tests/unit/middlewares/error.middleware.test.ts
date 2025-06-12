import { Request, Response, NextFunction } from 'express';
import { errorMiddleware, UnauthorizedError, ForbiddenError } from '../../../source/middlewares/error.middleware';
import AppError from '../../../source/utils/errors/AppError';
import ValidationError from '../../../source/utils/errors/ValidationError';
import NotFoundError from '../../../source/utils/errors/NotFoundError';
import { logger } from '../../../source/utils/logger';
import { ERROR_MESSAGES, RESPONSE_STATUS } from '../../../source/utils/constants';

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();

    // Mock logger to avoid cluttering test output
    jest.spyOn(logger, 'error').mockImplementation(() => {
      return logger;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Error Classes', () => {
    it('should create AppError with default values', () => {
      // Act
      const error = new AppError('Test error');

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it('should create AppError with custom values', () => {
      // Act
      const error = new AppError('Custom error', 400, false);

      // Assert
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(false);
    });

    it('should create ValidationError', () => {
      // Act
      const errors = { field1: 'Error 1', field2: 'Error 2' };
      const error = new ValidationError('Validation failed', errors);

      // Assert
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.errors).toEqual(errors);
    });

    it('should create NotFoundError with default message', () => {
      // Act
      const error = new NotFoundError();

      // Assert
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(ERROR_MESSAGES.NOT_FOUND);
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });

    it('should create NotFoundError with custom message', () => {
      // Act
      const error = new NotFoundError('Custom not found message');

      // Assert
      expect(error.message).toBe('Custom not found message');
      expect(error.statusCode).toBe(404);
    });

    it('should create UnauthorizedError with default message', () => {
      // Act
      const error = new UnauthorizedError();

      // Assert
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(ERROR_MESSAGES.UNAUTHORIZED);
      expect(error.statusCode).toBe(401);
      expect(error.isOperational).toBe(true);
    });

    it('should create UnauthorizedError with custom message', () => {
      // Act
      const error = new UnauthorizedError('Custom unauthorized message');

      // Assert
      expect(error.message).toBe('Custom unauthorized message');
      expect(error.statusCode).toBe(401);
    });

    it('should create ForbiddenError with default message', () => {
      // Act
      const error = new ForbiddenError();

      // Assert
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(ERROR_MESSAGES.FORBIDDEN);
      expect(error.statusCode).toBe(403);
      expect(error.isOperational).toBe(true);
    });

    it('should create ForbiddenError with custom message', () => {
      // Act
      const error = new ForbiddenError('Custom forbidden message');

      // Assert
      expect(error.message).toBe('Custom forbidden message');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('errorMiddleware', () => {
    it('should handle ValidationError', () => {
      // Arrange
      const errors = { field1: 'Error 1', field2: 'Error 2' };
      const error = new ValidationError('Validation failed', errors);

      // Act
      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.ERROR,
        message: 'Validation failed',
        errors
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle NotFoundError', () => {
      // Arrange
      const error = new NotFoundError('Resource not found');

      // Act
      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.ERROR,
        message: 'Resource not found'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle UnauthorizedError', () => {
      // Arrange
      const error = new UnauthorizedError('Unauthorized access');

      // Act
      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.ERROR,
        message: 'Unauthorized access'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle ForbiddenError', () => {
      // Arrange
      const error = new ForbiddenError('Forbidden access');

      // Act
      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.ERROR,
        message: 'Forbidden access'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle generic AppError', () => {
      // Arrange
      const error = new AppError('Generic error', 418); // I'm a teapot

      // Act
      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(418);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.ERROR,
        message: 'Generic error'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle non-operational AppError as internal server error', () => {
      // Arrange
      const error = new AppError('Non-operational error', 400, false);

      // Act
      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.ERROR,
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle standard Error as internal server error', () => {
      // Arrange
      const error = new Error('Standard error');

      // Act
      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: RESPONSE_STATUS.ERROR,
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should log error details', () => {
      // Arrange
      const error = new Error('Error to log');

      // Act
      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(`Error: ${error.message}`, expect.objectContaining({
        stack: expect.any(String)
      }));
    });
  });
});
