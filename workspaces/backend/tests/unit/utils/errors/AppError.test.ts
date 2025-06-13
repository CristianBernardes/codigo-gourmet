import { AppError } from '../../../../source/utils/errors/AppError';
import { logger } from '../../../../source/utils/logger';

// Mock the logger
jest.mock('../../../../source/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  }
}));

describe('AppError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create an error with default values', () => {
      // Act
      const error = new AppError();

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Erro interno do servidor');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.stack).toBeDefined();
    });

    it('should create an error with custom message', () => {
      // Act
      const error = new AppError('Custom error message');

      // Assert
      expect(error.message).toBe('Custom error message');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it('should create an error with custom message and status code', () => {
      // Act
      const error = new AppError('Custom error message', 400);

      // Assert
      expect(error.message).toBe('Custom error message');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('should create an error with custom message, status code, and isOperational flag', () => {
      // Act
      const error = new AppError('Custom error message', 400, false);

      // Assert
      expect(error.message).toBe('Custom error message');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('logError', () => {
    it('should log as error for 5xx status codes', () => {
      // Act
      new AppError('Server error', 500);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        '[AppError] Server error',
        expect.objectContaining({
          name: 'AppError',
          statusCode: 500,
          isOperational: true,
          stack: expect.any(String)
        })
      );
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should log as warn for 4xx status codes', () => {
      // Act
      new AppError('Client error', 400);

      // Assert
      expect(logger.warn).toHaveBeenCalledWith(
        '[AppError] Client error',
        expect.objectContaining({
          name: 'AppError',
          statusCode: 400,
          isOperational: true,
          stack: expect.any(String)
        })
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('should log as info for other status codes', () => {
      // Act
      new AppError('Informational message', 300);

      // Assert
      expect(logger.info).toHaveBeenCalledWith(
        '[AppError] Informational message',
        expect.objectContaining({
          name: 'AppError',
          statusCode: 300,
          isOperational: true,
          stack: expect.any(String)
        })
      );
      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });
});