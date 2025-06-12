import { Request, Response, NextFunction } from 'express';
import { AuthController } from '../../../source/controllers/auth.controller';
import { IAuthService } from '../../../source/domain/interfaces/services/IAuthService';
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

    // Setup mock request, response, and next function
    mockRequest = {
      body: {},
      user: undefined
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockResponse.status = jest.fn().mockReturnValue(mockResponse);
    mockResponse.json = jest.fn().mockReturnValue(mockResponse);
    nextFunction = jest.fn();
  });

  describe('login', () => {
    it('should return success response when login is successful', async () => {
      // Arrange
      const loginCredentials = { login: 'teste@exemplo.com', senha: 'senha123' };
      const authResult = {
        usuario: {
          id: 1,
          nome: 'Usuário de Teste',
          login: 'teste@exemplo.com'
        },
        token: 'valid-token'
      };

      mockRequest.body = loginCredentials;
      mockAuthService.login.mockResolvedValue(authResult);

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(loginCredentials);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: authResult
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with UnauthorizedError when user is not found', async () => {
      // Arrange
      mockRequest.body = { login: 'inexistente@exemplo.com', senha: 'senha123' };
      mockAuthService.login.mockRejectedValue(new Error('Usuário não encontrado'));

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith({ 
        login: 'inexistente@exemplo.com', 
        senha: 'senha123' 
      });
      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with UnauthorizedError when password is incorrect', async () => {
      // Arrange
      mockRequest.body = { login: 'teste@exemplo.com', senha: 'senha_errada' };
      mockAuthService.login.mockRejectedValue(new Error('Senha incorreta'));

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith({ 
        login: 'teste@exemplo.com', 
        senha: 'senha_errada' 
      });
      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with the error when an unexpected error occurs', async () => {
      // Arrange
      const unexpectedError = new Error('Unexpected error');
      mockRequest.body = { login: 'teste@exemplo.com', senha: 'senha123' };
      mockAuthService.login.mockRejectedValue(unexpectedError);

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith({ 
        login: 'teste@exemplo.com', 
        senha: 'senha123' 
      });
      expect(nextFunction).toHaveBeenCalledWith(unexpectedError);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should return created response when registration is successful', async () => {
      // Arrange
      const registerData = { 
        nome: 'Novo Usuário', 
        login: 'novo@exemplo.com', 
        senha: 'senha123' 
      };
      const authResult = {
        usuario: {
          id: 2,
          nome: 'Novo Usuário',
          login: 'novo@exemplo.com'
        },
        token: 'valid-token'
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

    it('should return conflict response when login already exists', async () => {
      // Arrange
      mockRequest.body = { 
        nome: 'Novo Usuário', 
        login: 'existente@exemplo.com', 
        senha: 'senha123' 
      };
      mockAuthService.register.mockRejectedValue(new Error('Este login já está em uso'));

      // Act
      await authController.register(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith({ 
        nome: 'Novo Usuário', 
        login: 'existente@exemplo.com', 
        senha: 'senha123' 
      });
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Este login já está em uso'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with the error when an unexpected error occurs', async () => {
      // Arrange
      const unexpectedError = new Error('Unexpected error');
      mockRequest.body = { 
        nome: 'Novo Usuário', 
        login: 'novo@exemplo.com', 
        senha: 'senha123' 
      };
      mockAuthService.register.mockRejectedValue(unexpectedError);

      // Act
      await authController.register(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith({ 
        nome: 'Novo Usuário', 
        login: 'novo@exemplo.com', 
        senha: 'senha123' 
      });
      expect(nextFunction).toHaveBeenCalledWith(unexpectedError);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return user profile when user is authenticated', async () => {
      // Arrange
      mockRequest.user = {
        id: 1,
        login: 'teste@exemplo.com'
      };

      // Act
      await authController.getProfile(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          id: 1,
          login: 'teste@exemplo.com'
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
      expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with the error when an unexpected error occurs', async () => {
      // Arrange
      const unexpectedError = new Error('Unexpected error');
      mockRequest.user = {
        id: 1,
        login: 'teste@exemplo.com'
      };

      // Mock to throw an error
      mockResponse.status = jest.fn().mockImplementation(() => {
        throw unexpectedError;
      });

      // Act
      await authController.getProfile(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(nextFunction).toHaveBeenCalledWith(unexpectedError);
    });
  });
});
