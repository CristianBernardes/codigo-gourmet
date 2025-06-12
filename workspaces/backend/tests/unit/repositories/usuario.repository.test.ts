import { UsuarioRepository } from '../../../source/repositories/usuario.repository';
import { Usuario } from '../../../source/domain/entities/Usuario';
import { UsuarioEntity } from '../../../source/domain/entities/Usuario';

// Create a mock for the database module
jest.mock('../../../source/config/database');

// Create mock query builder
const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  first: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  returning: jest.fn().mockReturnThis()
};

// Create a mock database function
const mockDb = jest.fn().mockReturnValue(mockQueryBuilder);

// Import the mocked database after mocking
import db from '../../../source/config/database';

// Setup the mock implementation
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();

  // Setup the mock implementation for db
  (db as jest.Mock).mockImplementation(() => mockQueryBuilder);
});

describe('UsuarioRepository', () => {
  let usuarioRepository: UsuarioRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    usuarioRepository = new UsuarioRepository();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        nome: 'Usuário de Teste',
        login: 'teste@exemplo.com',
        senha: 'senha-hash',
        criado_em: new Date(),
        alterado_em: new Date()
      };

      mockQueryBuilder.first.mockResolvedValue(mockUser);

      // Act
      const result = await usuarioRepository.findById(1);

      // Assert
      expect(mockDb).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.first).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      // Arrange
      mockQueryBuilder.first.mockResolvedValue(null);

      // Act
      const result = await usuarioRepository.findById(999);

      // Assert
      expect(mockDb).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 999 });
      expect(mockQueryBuilder.first).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should throw an error when database operation fails', async () => {
      // Arrange
      const error = new Error('Database error');
      mockQueryBuilder.first.mockRejectedValue(error);

      // Act & Assert
      await expect(usuarioRepository.findById(1)).rejects.toThrow(error);
    });
  });

  describe('findByLogin', () => {
    it('should return a user when found', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        nome: 'Usuário de Teste',
        login: 'teste@exemplo.com',
        senha: 'senha-hash',
        criado_em: new Date(),
        alterado_em: new Date()
      };

      mockQueryBuilder.first.mockResolvedValue(mockUser);

      // Act
      const result = await usuarioRepository.findByLogin('teste@exemplo.com');

      // Assert
      expect(mockDb).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ login: 'teste@exemplo.com' });
      expect(mockQueryBuilder.first).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      // Arrange
      mockQueryBuilder.first.mockResolvedValue(null);

      // Act
      const result = await usuarioRepository.findByLogin('inexistente@exemplo.com');

      // Assert
      expect(mockDb).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ login: 'inexistente@exemplo.com' });
      expect(mockQueryBuilder.first).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user and return it with ID', async () => {
      // Arrange
      const newUser: Usuario = {
        nome: 'Novo Usuário',
        login: 'novo@exemplo.com',
        senha: 'senha-hash'
      };

      const expectedUser = {
        ...newUser,
        id: 1,
        criado_em: expect.any(Date),
        alterado_em: expect.any(Date)
      };

      // Mock the insert method to return the ID
      mockQueryBuilder.insert.mockResolvedValue([1]);

      // Act
      const result = await usuarioRepository.create(newUser);

      // Assert
      expect(mockDb).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
        nome: 'Novo Usuário',
        login: 'novo@exemplo.com',
        senha: 'senha-hash',
        criado_em: expect.any(Date),
        alterado_em: expect.any(Date)
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('update', () => {
    it('should update a user and return the updated user', async () => {
      // Arrange
      const updateData: Partial<Usuario> = {
        nome: 'Nome Atualizado'
      };

      const updatedUser = {
        id: 1,
        nome: 'Nome Atualizado',
        login: 'teste@exemplo.com',
        senha: 'senha-hash',
        criado_em: new Date(),
        alterado_em: new Date()
      };

      mockQueryBuilder.update.mockResolvedValue(1);

      // Mock the findById method to return the updated user
      jest.spyOn(usuarioRepository, 'findById').mockResolvedValue(updatedUser);

      // Act
      const result = await usuarioRepository.update(1, updateData);

      // Assert
      expect(mockDb).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        ...updateData,
        alterado_em: expect.any(Date)
      });
      expect(usuarioRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(updatedUser);
    });

    it('should return null when user is not found', async () => {
      // Arrange
      const updateData: Partial<Usuario> = {
        nome: 'Nome Atualizado'
      };

      mockQueryBuilder.update.mockResolvedValue(0);

      // Mock the findById method to return null
      jest.spyOn(usuarioRepository, 'findById').mockResolvedValue(null);

      // Act
      const result = await usuarioRepository.update(999, updateData);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a user and return true when successful', async () => {
      // Arrange
      mockQueryBuilder.delete.mockResolvedValue(1);

      // Act
      const result = await usuarioRepository.delete(1);

      // Assert
      expect(mockDb).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when user is not found', async () => {
      // Arrange
      mockQueryBuilder.delete.mockResolvedValue(0);

      // Act
      const result = await usuarioRepository.delete(999);

      // Assert
      expect(mockDb).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 999 });
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      // Arrange
      const mockUsers = [
        {
          id: 1,
          nome: 'Usuário 1',
          login: 'usuario1@exemplo.com',
          senha: 'senha-hash-1',
          criado_em: new Date(),
          alterado_em: new Date()
        },
        {
          id: 2,
          nome: 'Usuário 2',
          login: 'usuario2@exemplo.com',
          senha: 'senha-hash-2',
          criado_em: new Date(),
          alterado_em: new Date()
        }
      ];

      mockQueryBuilder.select.mockResolvedValue(mockUsers);

      // Act
      const result = await usuarioRepository.findAll();

      // Assert
      expect(mockDb).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(result).toEqual(mockUsers);
    });

    it('should return an empty array when no users are found', async () => {
      // Arrange
      mockQueryBuilder.select.mockResolvedValue([]);

      // Act
      const result = await usuarioRepository.findAll();

      // Assert
      expect(mockDb).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(result).toEqual([]);
    });
  });
});
