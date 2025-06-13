import { Request, Response } from 'express';
import { 
  defaultRateLimiter, 
  authRateLimiter, 
  searchRateLimiter 
} from '../../../source/middlewares/rate-limit.middleware';

// Mock express-rate-limit
jest.mock('express-rate-limit', () => {
  return jest.fn().mockImplementation((options) => {
    // Store the handler function for testing
    return {
      handler: options.handler
    };
  });
});

describe('Rate Limit Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('defaultRateLimiter', () => {
    it('should return 429 status with error message', () => {
      // Act
      defaultRateLimiter.handler(
        mockRequest as Request,
        mockResponse as Response,
        null
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Muitas requisições, por favor tente novamente mais tarde.'
      });
    });
  });

  describe('authRateLimiter', () => {
    it('should return 429 status with error message for auth rate limiting', () => {
      // Act
      authRateLimiter.handler(
        mockRequest as Request,
        mockResponse as Response,
        null
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Muitas tentativas de login, por favor tente novamente mais tarde.'
      });
    });
  });

  describe('searchRateLimiter', () => {
    it('should return 429 status with error message for search rate limiting', () => {
      // Act
      searchRateLimiter.handler(
        mockRequest as Request,
        mockResponse as Response,
        null
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Muitas buscas, por favor tente novamente mais tarde.'
      });
    });
  });
});