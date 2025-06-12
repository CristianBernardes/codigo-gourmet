import bcrypt from 'bcrypt';
import { AuthService } from '../../../source/services/auth.service';
import { IUsuarioRepository } from '../../../source/domain/interfaces/repositories/IUsuarioRepository';
import { Usuario } from '../../../source/domain/entities/Usuario';

// Mock the jwt module
jest.mock('../../../source/config/jwt');

// Import the mocked functions after mocking
import { generateToken, verifyToken } from '../../../source/config/jwt';

// Type the mocked functions
const mockGenerateToken = generateToken as jest.MockedFunction<typeof generateToken>;
const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsuarioRepository: jest.Mocked<IUsuarioRepository>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup mock implementations AFTER clearing mocks
    mockGenerateToken.mockReturnValue('mocked-token');
    mockVerifyToken.mockImplementation((token) => {
      if (token === 'valid-token') {
        return { id: 1, login: 'teste@exemplo.com' };
      }
      return null;
    });

    // Create a mock for the usuario repository
    mockUsuarioRepository = {
      findById: jest.fn(),
      findByLogin: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn()
    } as jest.Mocked<IUsuarioRepository>;

    // Create an instance of the auth service with the mock repository
    authService = new AuthService(mockUsuarioRepository);
  });

  describe('login', () => {
    it('should return user and token when credentials are valid', async () => {
      // Arrange
      const mockUser: Usuario = {
        id: 1,
        nome: 'Usuário de Teste',
        login: 'teste@exemplo.com',
        senha: await bcrypt.hash('senha123', 10),
        criado_em: new Date(),
        alterado_em: new Date()
      };

      mockUsuarioRepository.findByLogin.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      // Act
      const result = await authService.login({ login: 'teste@exemplo.com', senha: 'senha123' });

      // Assert
      expect(mockUsuarioRepository.findByLogin).toHaveBeenCalledWith('teste@exemplo.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('senha123', mockUser.senha);
      expect(mockGenerateToken).toHaveBeenCalledWith({ id: 1, login: 'teste@exemplo.com' });
      expect(result).toEqual({
        usuario: {
          id: 1,
          nome: 'Usuário de Teste',
          login: 'teste@exemplo.com',
          criado_em: mockUser.criado_em,
          alterado_em: mockUser.alterado_em
        },
        token: 'mocked-token'
      });
    });

    it('should throw an error when user is not found', async () => {
      // Arrange
      mockUsuarioRepository.findByLogin.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login({ login: 'inexistente@exemplo.com', senha: 'senha123' }))
          .rejects.toThrow('Usuário não encontrado');
    });

    it('should throw an error when password is incorrect', async () => {
      // Arrange
      const mockUser: Usuario = {
        id: 1,
        nome: 'Usuário de Teste',
        login: 'teste@exemplo.com',
        senha: await bcrypt.hash('senha123', 10),
        criado_em: new Date(),
        alterado_em: new Date()
      };

      mockUsuarioRepository.findByLogin.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      // Act & Assert
      await expect(authService.login({ login: 'teste@exemplo.com', senha: 'senha_errada' }))
          .rejects.toThrow('Senha incorreta');
    });
  });

  describe('register', () => {
    it('should create a new user and return user and token', async () => {
      // Arrange
      const newUser: Usuario = {
        nome: 'Novo Usuário',
        login: 'novo@exemplo.com',
        senha: 'senha123'
      };

      const createdUser: Usuario = {
        id: 2,
        nome: 'Novo Usuário',
        login: 'novo@exemplo.com',
        senha: await bcrypt.hash('senha123', 10),
        criado_em: new Date(),
        alterado_em: new Date()
      };

      mockUsuarioRepository.findByLogin.mockResolvedValue(null);
      mockUsuarioRepository.create.mockResolvedValue(createdUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);

      // Act
      const result = await authService.register(newUser);

      // Assert
      expect(mockUsuarioRepository.findByLogin).toHaveBeenCalledWith('novo@exemplo.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 10);
      expect(mockUsuarioRepository.create).toHaveBeenCalledWith({
        nome: 'Novo Usuário',
        login: 'novo@exemplo.com',
        senha: 'hashed-password'
      });
      expect(mockGenerateToken).toHaveBeenCalledWith({ id: 2, login: 'novo@exemplo.com' });
      expect(result).toEqual({
        usuario: {
          id: 2,
          nome: 'Novo Usuário',
          login: 'novo@exemplo.com',
          criado_em: createdUser.criado_em,
          alterado_em: createdUser.alterado_em
        },
        token: 'mocked-token'
      });
    });

    it('should throw an error when login already exists', async () => {
      // Arrange
      const existingUser: Usuario = {
        id: 1,
        nome: 'Usuário Existente',
        login: 'existente@exemplo.com',
        senha: 'senha-hash',
        criado_em: new Date(),
        alterado_em: new Date()
      };

      mockUsuarioRepository.findByLogin.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(authService.register({
        nome: 'Novo Usuário',
        login: 'existente@exemplo.com',
        senha: 'senha123'
      })).rejects.toThrow('Este login já está em uso');
    });
  });

  describe('validateToken', () => {
    it('should return user info when token is valid', async () => {
      // Act
      const result = await authService.validateToken('valid-token');

      // Assert
      expect(mockVerifyToken).toHaveBeenCalledWith('valid-token');
      expect(result).toEqual({ id: 1, login: 'teste@exemplo.com' });
    });

    it('should return null when token is invalid', async () => {
      // Act
      const result = await authService.validateToken('invalid-token');

      // Assert
      expect(mockVerifyToken).toHaveBeenCalledWith('invalid-token');
      expect(result).toBeNull();
    });
  });
});