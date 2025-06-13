import { CategoriaRepository } from '../../../source/repositories/categoria.repository';
import { Categoria, CategoriaEntity } from '../../../source/domain/entities/Categoria';

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

describe('CategoriaRepository', () => {
  let categoriaRepository: CategoriaRepository;
  let mockQueryBuilder: any;

  // Mock category data
  const mockCategory: Categoria = {
    id: 1,
    nome: 'Test Category'
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Get the mock query builder
    mockQueryBuilder = (db as any).queryBuilder;

    // Create repository instance
    categoriaRepository = new CategoriaRepository();
  });

  describe('findById', () => {
    it('should return category when found by id', async () => {
      // Arrange
      mockQueryBuilder.first.mockResolvedValue(mockCategory);

      // Act
      const result = await categoriaRepository.findById(1);

      // Assert
      expect(db).toHaveBeenCalledWith('categorias');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.first).toHaveBeenCalled();
      expect(result).toBeInstanceOf(CategoriaEntity);
      expect(result).toEqual(expect.objectContaining({
        id: mockCategory.id,
        nome: mockCategory.nome
      }));
    });

    it('should return null when category is not found by id', async () => {
      // Arrange
      mockQueryBuilder.first.mockResolvedValue(null);

      // Act
      const result = await categoriaRepository.findById(999);

      // Assert
      expect(db).toHaveBeenCalledWith('categorias');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 999 });
      expect(mockQueryBuilder.first).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should throw error when database query fails', async () => {
      // Arrange
      const error = new Error('Database error');
      mockQueryBuilder.first.mockRejectedValue(error);

      // Act & Assert
      await expect(categoriaRepository.findById(1)).rejects.toThrow('Database error');
      expect(db).toHaveBeenCalledWith('categorias');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.first).toHaveBeenCalled();
    });
  });

  describe('findByNome', () => {
    it('should return category when found by nome', async () => {
      // Arrange
      mockQueryBuilder.first.mockResolvedValue(mockCategory);

      // Act
      const result = await categoriaRepository.findByNome('Test Category');

      // Assert
      expect(db).toHaveBeenCalledWith('categorias');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ nome: 'Test Category' });
      expect(mockQueryBuilder.first).toHaveBeenCalled();
      expect(result).toBeInstanceOf(CategoriaEntity);
      expect(result).toEqual(expect.objectContaining({
        id: mockCategory.id,
        nome: mockCategory.nome
      }));
    });

    it('should return null when category is not found by nome', async () => {
      // Arrange
      mockQueryBuilder.first.mockResolvedValue(null);

      // Act
      const result = await categoriaRepository.findByNome('Nonexistent Category');

      // Assert
      expect(db).toHaveBeenCalledWith('categorias');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ nome: 'Nonexistent Category' });
      expect(mockQueryBuilder.first).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should throw error when database query fails', async () => {
      // Arrange
      const error = new Error('Database error');
      mockQueryBuilder.first.mockRejectedValue(error);

      // Act & Assert
      await expect(categoriaRepository.findByNome('Test Category')).rejects.toThrow('Database error');
      expect(db).toHaveBeenCalledWith('categorias');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ nome: 'Test Category' });
      expect(mockQueryBuilder.first).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create and return a new category', async () => {
      // Arrange
      const newCategory: Partial<Categoria> = {
        nome: 'New Category'
      };

      mockQueryBuilder.insert.mockResolvedValue([2]); // Return new ID

      // Act
      const result = await categoriaRepository.create(newCategory as Categoria);

      // Assert
      expect(db).toHaveBeenCalledWith('categorias');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
        nome: newCategory.nome
      });

      expect(result).toBeInstanceOf(CategoriaEntity);
      expect(result).toEqual(expect.objectContaining({
        id: 2,
        nome: newCategory.nome
      }));
    });

    it('should throw error when database insert fails', async () => {
      // Arrange
      const newCategory: Partial<Categoria> = {
        nome: 'New Category'
      };

      const error = new Error('Database error');
      mockQueryBuilder.insert.mockRejectedValue(error);

      // Act & Assert
      await expect(categoriaRepository.create(newCategory as Categoria)).rejects.toThrow('Database error');
      expect(db).toHaveBeenCalledWith('categorias');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
        nome: newCategory.nome
      });
    });
  });

  describe('update', () => {
    it('should update and return the updated category', async () => {
      // Arrange
      const updateData: Partial<Categoria> = {
        nome: 'Updated Category'
      };

      const updatedCategory = { ...mockCategory, nome: 'Updated Category' };

      mockQueryBuilder.update.mockResolvedValue(1); // 1 row affected

      // Mock the findById call that happens after update
      jest.spyOn(categoriaRepository, 'findById').mockResolvedValue(updatedCategory as Categoria);

      // Act
      const result = await categoriaRepository.update(1, updateData);

      // Assert
      expect(db).toHaveBeenCalledWith('categorias');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(updateData);

      expect(categoriaRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(updatedCategory);
    });

    it('should throw error when database update fails', async () => {
      // Arrange
      const updateData: Partial<Categoria> = {
        nome: 'Updated Category'
      };

      const error = new Error('Database error');
      mockQueryBuilder.update.mockRejectedValue(error);

      // Act & Assert
      await expect(categoriaRepository.update(1, updateData)).rejects.toThrow('Database error');
      expect(db).toHaveBeenCalledWith('categorias');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(updateData);
    });
  });

  describe('delete', () => {
    it('should delete and return the deleted category', async () => {
      // Arrange
      // Mock the findById call that happens before delete
      jest.spyOn(categoriaRepository, 'findById').mockResolvedValue(mockCategory);

      mockQueryBuilder.delete.mockResolvedValue(1); // 1 row affected

      // Act
      const result = await categoriaRepository.delete(1);

      // Assert
      expect(categoriaRepository.findById).toHaveBeenCalledWith(1);
      expect(db).toHaveBeenCalledWith('categorias');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(result).toEqual(mockCategory);
    });

    it('should throw error when category is not found', async () => {
      // Arrange
      // Mock the findById call that happens before delete
      jest.spyOn(categoriaRepository, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(categoriaRepository.delete(999)).rejects.toThrow('Categoria não encontrada');
      expect(categoriaRepository.findById).toHaveBeenCalledWith(999);
      expect(mockQueryBuilder.delete).not.toHaveBeenCalled();
    });

    it('should throw error when database delete fails', async () => {
      // Arrange
      // Mock the findById call that happens before delete
      jest.spyOn(categoriaRepository, 'findById').mockResolvedValue(mockCategory);

      const error = new Error('Database error');
      mockQueryBuilder.delete.mockRejectedValue(error);

      // Act & Assert
      await expect(categoriaRepository.delete(1)).rejects.toThrow('Database error');
      expect(categoriaRepository.findById).toHaveBeenCalledWith(1);
      expect(db).toHaveBeenCalledWith('categorias');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ id: 1 });
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of categories', async () => {
      // Arrange
      const mockCategories = [
        mockCategory,
        { ...mockCategory, id: 2, nome: 'Category 2' }
      ];

      mockQueryBuilder.select.mockImplementation(() => {
        return {
          ...mockQueryBuilder,
          then: (callback: Function) => Promise.resolve(callback(mockCategories))
        };
      });

      // Act
      const result = await categoriaRepository.findAll();

      // Assert
      expect(db).toHaveBeenCalledWith('categorias');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(CategoriaEntity);
      expect(result[1]).toBeInstanceOf(CategoriaEntity);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('should throw error when database query fails', async () => {
      // Arrange
      const error = new Error('Database error');

      // Mock the select method to return a promise that rejects
      mockQueryBuilder.select.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      await expect(categoriaRepository.findAll()).rejects.toThrow('Database error');
      expect(db).toHaveBeenCalledWith('categorias');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
    });
  });
});
