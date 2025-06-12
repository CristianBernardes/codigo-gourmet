import { UsuarioRepository } from '../../../source/repositories/usuario.repository';
import { Usuario, UsuarioEntity } from '../../../source/domain/entities/Usuario';

// Mock the database module
jest.mock('../../../source/config/database', () => {
  // Create mock query builder
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    first: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  };

  // Create a mock database function that returns the query builder
  const mockDb = jest.fn().mockReturnValue(mockQueryBuilder);

  // Add the query builder to the mockDb for easy access in tests
  mockDb.queryBuilder = mockQueryBuilder;

  return mockDb;
});

// Import the mocked database
import db from '../../../source/config/database';

describe('UsuarioRepository', () => {
  let usuarioRepository: UsuarioRepository;
  let mockQueryBuilder: any;

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
    // Clear all mocks
    jest.clearAllMocks();

    // Get the mock query builder
    mockQueryBuilder = (db as any).queryBuilder;

    // Create repository instance
    usuarioRepository = new UsuarioRepository();
  });

  describe('findById', () => {
    it('should return user when found by id', async () => {
      // Arrange
      mockQueryBuilder.first.mockResolvedValue(mockUser);

      // Act
      const result = await usuarioRepository.findById(1);

      // Assert
      expect(db).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.first).toHaveBeenCalled();
      expect(result).toBeInstanceOf(UsuarioEntity);
      expect(result).toEqual(expect.objectContaining({
        id: mockUser.id,
        nome: mockUser.nome,
        login: mockUser.login
      }));
    });

    it('should return null when user is not found by id', async () => {
      // Arrange
      mockQueryBuilder.first.mockResolvedValue(null);

      // Act
      const result = await usuarioRepository.findById(999);

      // Assert
      expect(db).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 999 });
      expect(mockQueryBuilder.first).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should throw error when database query fails', async () => {
      // Arrange
      const error = new Error('Database error');
      mockQueryBuilder.first.mockRejectedValue(error);

      // Act & Assert
      await expect(usuarioRepository.findById(1)).rejects.toThrow('Database error');
      expect(db).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.first).toHaveBeenCalled();
    });
  });

  describe('findByLogin', () => {
    it('should return user when found by login', async () => {
      // Arrange
      mockQueryBuilder.first.mockResolvedValue(mockUser);

      // Act
      const result = await usuarioRepository.findByLogin('test@example.com');

      // Assert
      expect(db).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ login: 'test@example.com' });
      expect(mockQueryBuilder.first).toHaveBeenCalled();
      expect(result).toBeInstanceOf(UsuarioEntity);
      expect(result).toEqual(expect.objectContaining({
        id: mockUser.id,
        nome: mockUser.nome,
        login: mockUser.login
      }));
    });

    it('should return null when user is not found by login', async () => {
      // Arrange
      mockQueryBuilder.first.mockResolvedValue(null);

      // Act
      const result = await usuarioRepository.findByLogin('nonexistent@example.com');

      // Assert
      expect(db).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ login: 'nonexistent@example.com' });
      expect(mockQueryBuilder.first).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      // Arrange
      const newUser: Partial<Usuario> = {
        nome: 'New User',
        login: 'new@example.com',
        senha: 'hashed-new-password'
      };
      
      mockQueryBuilder.insert.mockResolvedValue([2]); // Return new ID

      // Act
      const result = await usuarioRepository.create(newUser as Usuario);

      // Assert
      expect(db).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({
        nome: newUser.nome,
        login: newUser.login,
        senha: newUser.senha,
        criado_em: expect.any(Date),
        alterado_em: expect.any(Date)
      }));
      
      expect(result).toBeInstanceOf(UsuarioEntity);
      expect(result).toEqual(expect.objectContaining({
        id: 2,
        nome: newUser.nome,
        login: newUser.login,
        senha: newUser.senha
      }));
    });
  });

  describe('update', () => {
    it('should update and return the updated user', async () => {
      // Arrange
      const updateData: Partial<Usuario> = {
        nome: 'Updated Name'
      };
      
      const updatedUser = { ...mockUser, nome: 'Updated Name' };
      
      mockQueryBuilder.update.mockResolvedValue(1); // 1 row affected
      
      // Mock the findById call that happens after update
      jest.spyOn(usuarioRepository, 'findById').mockResolvedValue(updatedUser as Usuario);

      // Act
      const result = await usuarioRepository.update(1, updateData);

      // Assert
      expect(db).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(expect.objectContaining({
        nome: updateData.nome,
        alterado_em: expect.any(Date)
      }));
      
      expect(usuarioRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('delete', () => {
    it('should return true when user is successfully deleted', async () => {
      // Arrange
      mockQueryBuilder.delete.mockResolvedValue(1); // 1 row affected

      // Act
      const result = await usuarioRepository.delete(1);

      // Assert
      expect(db).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when no user is deleted', async () => {
      // Arrange
      mockQueryBuilder.delete.mockResolvedValue(0); // 0 rows affected

      // Act
      const result = await usuarioRepository.delete(999);

      // Assert
      expect(db).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 999 });
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      // Arrange
      const mockUsers = [
        mockUser,
        { ...mockUser, id: 2, login: 'user2@example.com' }
      ];
      
      mockQueryBuilder.select.mockImplementation(() => {
        return {
          ...mockQueryBuilder,
          then: (callback: Function) => Promise.resolve(callback(mockUsers))
        };
      });

      // Act
      const result = await usuarioRepository.findAll();

      // Assert
      expect(db).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(UsuarioEntity);
      expect(result[1]).toBeInstanceOf(UsuarioEntity);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('should return empty array when no users exist', async () => {
      // Arrange
      mockQueryBuilder.select.mockImplementation(() => {
        return {
          ...mockQueryBuilder,
          then: (callback: Function) => Promise.resolve(callback([]))
        };
      });

      // Act
      const result = await usuarioRepository.findAll();

      // Assert
      expect(db).toHaveBeenCalledWith('usuarios');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(result).toHaveLength(0);
    });
  });
});