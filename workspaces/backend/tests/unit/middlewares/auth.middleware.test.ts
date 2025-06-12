import { Request, Response, NextFunction } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../../../source/middlewares/auth.middleware';

// Mock the jwt module
jest.mock('../../../source/config/jwt');

// Import the mocked functions after mocking
import { verifyToken } from '../../../source/config/jwt';

// Setup the mock implementations
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
});

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  describe('authMiddleware', () => {
    it('should call next() when token is valid', () => {
      // Arrange
      const mockUser = { id: 1, login: 'teste@exemplo.com' };
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };
      (jwt.verifyToken as jest.Mock).mockReturnValue(mockUser);

      // Act
      authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(jwt.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual(mockUser);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is missing', () => {
      // Arrange
      mockRequest.headers = {};

      // Act
      authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(jwt.verifyToken).not.toHaveBeenCalled();
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Token de autenticação não fornecido' });
    });

    it('should return 401 when authorization header is malformed', () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'InvalidFormat'
      };

      // Act
      authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(jwt.verifyToken).not.toHaveBeenCalled();
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Token mal formatado' });
    });

    it('should return 401 when token is invalid', () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };
      (jwt.verifyToken as jest.Mock).mockReturnValue(null);

      // Act
      authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(jwt.verifyToken).toHaveBeenCalledWith('invalid-token');
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Token inválido ou expirado' });
    });

    it('should return 500 when an error occurs', () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };
      (jwt.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      // Act
      authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(jwt.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Erro ao autenticar usuário' });
    });
  });

  describe('optionalAuthMiddleware', () => {
    it('should set user and call next() when token is valid', () => {
      // Arrange
      const mockUser = { id: 1, login: 'teste@exemplo.com' };
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };
      (jwt.verifyToken as jest.Mock).mockReturnValue(mockUser);

      // Act
      optionalAuthMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(jwt.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual(mockUser);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should call next() without setting user when authorization header is missing', () => {
      // Arrange
      mockRequest.headers = {};

      // Act
      optionalAuthMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(jwt.verifyToken).not.toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should call next() without setting user when authorization header is malformed', () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'InvalidFormat'
      };

      // Act
      optionalAuthMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(jwt.verifyToken).not.toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should call next() without setting user when token is invalid', () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };
      (jwt.verifyToken as jest.Mock).mockReturnValue(null);

      // Act
      optionalAuthMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(jwt.verifyToken).toHaveBeenCalledWith('invalid-token');
      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should call next() when an error occurs', () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'Bearer valid-token'
      };
      (jwt.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      // Act
      optionalAuthMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(jwt.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
