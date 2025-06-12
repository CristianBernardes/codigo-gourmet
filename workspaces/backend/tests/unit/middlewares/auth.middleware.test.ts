import { Request, Response, NextFunction } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../../../source/middlewares/auth.middleware';

// Mock the jwt module
jest.mock('../../../source/config/jwt', () => ({
  verifyToken: jest.fn()
}));

// Import the mocked function
import { verifyToken } from '../../../source/config/jwt';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock request, response, and next function
    mockRequest = {
      headers: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    nextFunction = jest.fn();
  });

  describe('authMiddleware', () => {
    it('should call next() when token is valid', () => {
      // Arrange
      const mockUser = { id: 1, login: 'test@example.com' };
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };
      (verifyToken as jest.Mock).mockReturnValue(mockUser);

      // Act
      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual(mockUser);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is missing', () => {
      // Arrange
      mockRequest.headers = {};

      // Act
      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(verifyToken).not.toHaveBeenCalled();
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        status: 'error',
        message: 'Token de autenticação não fornecido' 
      });
    });

    it('should return 401 when token format is invalid', () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'InvalidFormat'
      };

      // Act
      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(verifyToken).not.toHaveBeenCalled();
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        status: 'error',
        message: 'Token mal formatado' 
      });
    });

    it('should return 401 when token is invalid', () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };
      (verifyToken as jest.Mock).mockReturnValue(null);

      // Act
      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(verifyToken).toHaveBeenCalledWith('invalid-token');
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        status: 'error',
        message: 'Token inválido ou expirado' 
      });
    });

    it('should return 500 when an error occurs', () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };
      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      // Act
      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(verifyToken).toHaveBeenCalledWith('valid-token');
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ 
        status: 'error',
        message: 'Erro ao autenticar usuário' 
      });
    });
  });

  describe('optionalAuthMiddleware', () => {
    it('should add user to request when token is valid', () => {
      // Arrange
      const mockUser = { id: 1, login: 'test@example.com' };
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };
      (verifyToken as jest.Mock).mockReturnValue(mockUser);

      // Act
      optionalAuthMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual(mockUser);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should call next() when authorization header is missing', () => {
      // Arrange
      mockRequest.headers = {};

      // Act
      optionalAuthMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(verifyToken).not.toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should call next() when token format is invalid', () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'InvalidFormat'
      };

      // Act
      optionalAuthMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(verifyToken).not.toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should call next() without user when token is invalid', () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };
      (verifyToken as jest.Mock).mockReturnValue(null);

      // Act
      optionalAuthMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(verifyToken).toHaveBeenCalledWith('invalid-token');
      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should call next() when an error occurs', () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };
      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      // Act
      optionalAuthMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
