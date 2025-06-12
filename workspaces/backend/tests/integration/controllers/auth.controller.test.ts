import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../../../source/controllers/auth.controller';
import { IAuthService, LoginDTO, RegisterDTO, AuthResult } from '../../../source/domain/interfaces/services/IAuthService';
import { UnauthorizedError } from '../../../source/middlewares/error.middleware';

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<IAuthService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock<NextFunction>;

  beforeEach(() => {
    // Create mock for auth service
    mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
      validateToken: jest.fn()
    } as jest.Mocked<IAuthService>;

    // Create controller instance with mock service
    authController = new AuthController(mockAuthService);

    // Create mock request and response objects
    mockRequest = {
      body: {},
      user: undefined
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    nextFunction = jest.fn();
  });

  describe('login', () => {
    it('should return 200 and user data with token on successful login', async () => {
      // Arrange
      const loginData: LoginDTO = {
        login: 'test@example.com',
        senha: 'password123'
      };

      const authResult: AuthResult = {
        usuario: {
          id: 1,
          nome: 'Test User',
          login: 'test@example.com',
          criado_em: new Date(),
          alterado_em: new Date()
        },
        token: 'jwt-token-123'
      };

      mockRequest.body = loginData;
      mockAuthService.login.mockResolvedValue(authResult);

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: authResult
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with UnauthorizedError when user is not found', async () => {
      // Arrange
      mockRequest.body = {
        login: 'nonexistent@example.com',
        senha: 'password123'
      };

      mockAuthService.login.mockRejectedValue(new Error('Usuário não encontrado'));

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(nextFunction.mock.calls[0][0].message).toBe('Credenciais inválidas');
    });

    it('should call next with UnauthorizedError when password is incorrect', async () => {
      // Arrange
      mockRequest.body = {
        login: 'test@example.com',
        senha: 'wrong-password'
      };

      mockAuthService.login.mockRejectedValue(new Error('Senha incorreta'));

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(nextFunction.mock.calls[0][0].message).toBe('Credenciais inválidas');
    });

    it('should call next with the error for other errors', async () => {
      // Arrange
      mockRequest.body = {
        login: 'test@example.com',
        senha: 'password123'
      };

      const error = new Error('Database connection error');
      mockAuthService.login.mockRejectedValue(error);

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('register', () => {
    it('should return 201 and user data with token on successful registration', async () => {
      // Arrange
      const registerData: RegisterDTO = {
        nome: 'New User',
        login: 'new@example.com',
        senha: 'password123'
      };

      const authResult: AuthResult = {
        usuario: {
          id: 2,
          nome: 'New User',
          login: 'new@example.com',
          criado_em: new Date(),
          alterado_em: new Date()
        },
        token: 'jwt-token-456'
      };

      mockRequest.body = registerData;
      mockAuthService.register.mockResolvedValue(authResult);

      // Act
      await authController.register(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: authResult
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 409 when login already exists', async () => {
      // Arrange
      mockRequest.body = {
        nome: 'Duplicate User',
        login: 'existing@example.com',
        senha: 'password123'
      };

      mockAuthService.register.mockRejectedValue(new Error('Este login já está em uso'));

      // Act
      await authController.register(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockAuthService.register).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Este login já está em uso'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with the error for other errors', async () => {
      // Arrange
      mockRequest.body = {
        nome: 'New User',
        login: 'new@example.com',
        senha: 'password123'
      };

      const error = new Error('Database connection error');
      mockAuthService.register.mockRejectedValue(error);

      // Act
      await authController.register(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockAuthService.register).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('getProfile', () => {
    it('should return 200 and user profile when user is authenticated', async () => {
      // Arrange
      mockRequest.user = {
        id: 1,
        login: 'test@example.com'
      };

      // Act
      await authController.getProfile(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          id: 1,
          login: 'test@example.com'
        }
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with UnauthorizedError when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await authController.getProfile(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should call next with the error for other errors', async () => {
      // Arrange
      mockRequest.user = {
        id: 1,
        login: 'test@example.com'
      };

      // Mock response.json to throw an error
      const error = new Error('Response error');
      mockResponse.json = jest.fn().mockImplementation(() => {
        throw error;
      });

      // Act
      await authController.getProfile(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockResponse.status).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });
});