import bcrypt from 'bcrypt';
import { AuthService } from '../../../source/services/auth.service';
import { IUsuarioRepository } from '../../../source/domain/interfaces/repositories/IUsuarioRepository';
import { Usuario } from '../../../source/domain/entities/Usuario';
import { generateToken, verifyToken } from '../../../source/config/jwt';

// Mock bcrypt
jest.mock('bcrypt');

// Mock jwt functions
jest.mock('../../../source/config/jwt', () => ({
  generateToken: jest.fn().mockReturnValue('mocked-jwt-token'),
  verifyToken: jest.fn()
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsuarioRepository: jest.Mocked<IUsuarioRepository>;
  
  // Mock user data
  const mockUser: Usuario = {
    id: 1,
    nome: 'Test User',
    login: 'test@example.com',
    senha: 'hashed-password',
    criado_em: new Date(),
    atualizado_em: new Date()
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock for usuario repository
    mockUsuarioRepository = {
      findById: jest.fn(),
      findByLogin: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn()
    };
    
    // Create service instance with mock repository
    authService = new AuthService(mockUsuarioRepository);
    
    // Setup bcrypt mock
    (bcrypt.compare as jest.Mock).mockImplementation((plainText, hash) => {
      return Promise.resolve(plainText === 'correct-password');
    });
    
    (bcrypt.hash as jest.Mock).mockImplementation((plainText, saltRounds) => {
      return Promise.resolve(`hashed-${plainText}`);
    });
  });
  
  describe('login', () => {
    it('should return user and token when credentials are valid', async () => {
      // Arrange
      const loginData = { login: 'test@example.com', senha: 'correct-password' };
      mockUsuarioRepository.findByLogin.mockResolvedValue(mockUser);
      
      // Act
      const result = await authService.login(loginData);
      
      // Assert
      expect(mockUsuarioRepository.findByLogin).toHaveBeenCalledWith(loginData.login);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.senha, mockUser.senha);
      expect(generateToken).toHaveBeenCalledWith({ id: mockUser.id, login: mockUser.login });
      
      expect(result).toEqual({
        usuario: {
          id: mockUser.id,
          nome: mockUser.nome,
          login: mockUser.login,
          criado_em: mockUser.criado_em,
          atualizado_em: mockUser.atualizado_em
        },
        token: 'mocked-jwt-token'
      });
    });
    
    it('should throw error when user is not found', async () => {
      // Arrange
      const loginData = { login: 'nonexistent@example.com', senha: 'any-password' };
      mockUsuarioRepository.findByLogin.mockResolvedValue(null);
      
      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow('Usuário não encontrado');
      expect(mockUsuarioRepository.findByLogin).toHaveBeenCalledWith(loginData.login);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(generateToken).not.toHaveBeenCalled();
    });
    
    it('should throw error when password is incorrect', async () => {
      // Arrange
      const loginData = { login: 'test@example.com', senha: 'wrong-password' };
      mockUsuarioRepository.findByLogin.mockResolvedValue(mockUser);
      
      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow('Senha incorreta');
      expect(mockUsuarioRepository.findByLogin).toHaveBeenCalledWith(loginData.login);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.senha, mockUser.senha);
      expect(generateToken).not.toHaveBeenCalled();
    });
  });
  
  describe('register', () => {
    it('should create user and return user with token when registration is successful', async () => {
      // Arrange
      const registerData = { nome: 'New User', login: 'new@example.com', senha: 'new-password' };
      const createdUser: Usuario = {
        id: 2,
        nome: registerData.nome,
        login: registerData.login,
        senha: `hashed-${registerData.senha}`,
        criado_em: new Date(),
        atualizado_em: new Date()
      };
      
      mockUsuarioRepository.findByLogin.mockResolvedValue(null);
      mockUsuarioRepository.create.mockResolvedValue(createdUser);
      
      // Act
      const result = await authService.register(registerData);
      
      // Assert
      expect(mockUsuarioRepository.findByLogin).toHaveBeenCalledWith(registerData.login);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.senha, expect.any(Number));
      expect(mockUsuarioRepository.create).toHaveBeenCalledWith({
        nome: registerData.nome,
        login: registerData.login,
        senha: `hashed-${registerData.senha}`
      });
      expect(generateToken).toHaveBeenCalledWith({ id: createdUser.id, login: createdUser.login });
      
      expect(result).toEqual({
        usuario: {
          id: createdUser.id,
          nome: createdUser.nome,
          login: createdUser.login,
          criado_em: createdUser.criado_em,
          atualizado_em: createdUser.atualizado_em
        },
        token: 'mocked-jwt-token'
      });
    });
    
    it('should throw error when login is already in use', async () => {
      // Arrange
      const registerData = { nome: 'New User', login: 'existing@example.com', senha: 'new-password' };
      mockUsuarioRepository.findByLogin.mockResolvedValue(mockUser);
      
      // Act & Assert
      await expect(authService.register(registerData)).rejects.toThrow('Este login já está em uso');
      expect(mockUsuarioRepository.findByLogin).toHaveBeenCalledWith(registerData.login);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUsuarioRepository.create).not.toHaveBeenCalled();
      expect(generateToken).not.toHaveBeenCalled();
    });
  });
  
  describe('validateToken', () => {
    it('should return user data when token is valid', async () => {
      // Arrange
      const token = 'valid-token';
      const decodedToken = { id: 1, login: 'test@example.com' };
      (verifyToken as jest.Mock).mockReturnValue(decodedToken);
      
      // Act
      const result = await authService.validateToken(token);
      
      // Assert
      expect(verifyToken).toHaveBeenCalledWith(token);
      expect(result).toEqual(decodedToken);
    });
    
    it('should return null when token is invalid', async () => {
      // Arrange
      const token = 'invalid-token';
      (verifyToken as jest.Mock).mockReturnValue(null);
      
      // Act
      const result = await authService.validateToken(token);
      
      // Assert
      expect(verifyToken).toHaveBeenCalledWith(token);
      expect(result).toBeNull();
    });
  });
});