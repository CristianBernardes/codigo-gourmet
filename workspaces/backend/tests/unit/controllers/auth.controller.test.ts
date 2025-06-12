import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../../../source/controllers/auth.controller';
import { IAuthService } from '../../../source/domain/interfaces/services/IAuthService';
import { UnauthorizedError } from '../../../source/middlewares/error.middleware';

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<IAuthService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    // Create mock for auth service
    mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
      validateToken: jest.fn(),
      refreshToken: jest.fn()
    };

    // Create mock for request, response, and next function
    mockRequest = {
      body: {},
      user: undefined
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    nextFunction = jest.fn();

    // Create controller instance with mock service
    authController = new AuthController(mockAuthService);
  });

  describe('login', () => {
    it('should return success response when login is successful', async () => {
      // Arrange
      const loginData = { login: 'test@example.com', senha: 'password123' };
      const loginResult = { token: 'jwt-token', user: { id: 1, login: 'test@example.com' } };

      mockRequest.body = loginData;
      mockAuthService.login.mockResolvedValue(loginResult);

      // Act
      await authController.login(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        data: loginResult
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with UnauthorizedError when credentials are invalid', async () => {
      // Arrange
      const loginData = { login: 'test@example.com', senha: 'wrong-password' };

      mockRequest.body = loginData;
      mockAuthService.login.mockRejectedValue(new Error('Usuário não encontrado'));

      // Act
      await authController.login(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should return created response when registration is successful', async () => {
      // Arrange
      const registerData = { nome: 'Test User', login: 'test@example.com', senha: 'password123' };
      const registerResult = { id: 1, login: 'test@example.com' };

      mockRequest.body = registerData;
      mockAuthService.register.mockResolvedValue(registerResult);

      // Act
      await authController.register(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        data: registerResult
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return conflict error when login is already in use', async () => {
      // Arrange
      const registerData = { nome: 'Test User', login: 'existing@example.com', senha: 'password123' };

      mockRequest.body = registerData;
      mockAuthService.register.mockRejectedValue(new Error('Este login já está em uso'));

      // Act
      await authController.register(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "error",
        message: 'Este login já está em uso'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return user profile when user is authenticated', async () => {
      // Arrange
      const user = { id: 1, login: 'test@example.com' };
      mockRequest.user = user;

      // Act
      await authController.getProfile(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: "success",
        data: {
          id: user.id,
          login: user.login
        }
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with UnauthorizedError when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await authController.getProfile(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });
});
