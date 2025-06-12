import { CategoriaService } from '../../../source/services/categorias.service';
import { ICategoriaRepository } from '../../../source/domain/interfaces/repositories/ICategoriaRepository';
import { Categoria } from '../../../source/domain/entities/Categoria';

describe('CategoriaService', () => {
  let categoriaService: CategoriaService;
  let mockCategoriaRepository: jest.Mocked<ICategoriaRepository>;

  beforeEach(() => {
    // Create a mock for the categoria repository
    mockCategoriaRepository = {
      findById: jest.fn(),
      findByNome: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn()
    } as jest.Mocked<ICategoriaRepository>;

    // Create an instance of the categoria service with the mock repository
    categoriaService = new CategoriaService(mockCategoriaRepository);
  });

  describe('findById', () => {
    it('should return a category when found', async () => {
      // Arrange
      const mockCategoria: Categoria = {
        id: 1,
        nome: 'Carnes'
      };

      mockCategoriaRepository.findById.mockResolvedValue(mockCategoria);

      // Act
      const result = await categoriaService.findById(1);

      // Assert
      expect(mockCategoriaRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCategoria);
    });

    it('should return null when category is not found', async () => {
      // Arrange
      mockCategoriaRepository.findById.mockResolvedValue(null);

      // Act
      const result = await categoriaService.findById(999);

      // Assert
      expect(mockCategoriaRepository.findById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      // Arrange
      const mockCategorias: Categoria[] = [
        { id: 1, nome: 'Carnes' },
        { id: 2, nome: 'Massas' },
        { id: 3, nome: 'Sobremesas' }
      ];

      mockCategoriaRepository.findAll.mockResolvedValue(mockCategorias);

      // Act
      const result = await categoriaService.findAll();

      // Assert
      expect(mockCategoriaRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCategorias);
    });

    it('should return an empty array when no categories are found', async () => {
      // Arrange
      mockCategoriaRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await categoriaService.findAll();

      // Assert
      expect(mockCategoriaRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new category when name is unique', async () => {
      // Arrange
      const newCategoria = { nome: 'Nova Categoria' };
      const createdCategoria = { id: 4, nome: 'Nova Categoria' };

      mockCategoriaRepository.findByNome.mockResolvedValue(null);
      mockCategoriaRepository.create.mockResolvedValue(createdCategoria);

      // Act
      const result = await categoriaService.create(newCategoria);

      // Assert
      expect(mockCategoriaRepository.findByNome).toHaveBeenCalledWith('Nova Categoria');
      expect(mockCategoriaRepository.create).toHaveBeenCalledWith(newCategoria);
      expect(result).toEqual(createdCategoria);
    });

    it('should throw an error when category name already exists', async () => {
      // Arrange
      const newCategoria = { nome: 'Categoria Existente' };
      const existingCategoria = { id: 1, nome: 'Categoria Existente' };

      mockCategoriaRepository.findByNome.mockResolvedValue(existingCategoria);

      // Act & Assert
      await expect(categoriaService.create(newCategoria))
        .rejects.toThrow('Já existe uma categoria com este nome');
      expect(mockCategoriaRepository.findByNome).toHaveBeenCalledWith('Categoria Existente');
      expect(mockCategoriaRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a category when it exists and new name is unique', async () => {
      // Arrange
      const updateData = { nome: 'Categoria Atualizada' };
      const existingCategoria = { id: 1, nome: 'Carnes' };
      const updatedCategoria = { id: 1, nome: 'Categoria Atualizada' };

      mockCategoriaRepository.findById.mockResolvedValue(existingCategoria);
      mockCategoriaRepository.findByNome.mockResolvedValue(null);
      mockCategoriaRepository.update.mockResolvedValue(updatedCategoria);

      // Act
      const result = await categoriaService.update(1, updateData);

      // Assert
      expect(mockCategoriaRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCategoriaRepository.findByNome).toHaveBeenCalledWith('Categoria Atualizada');
      expect(mockCategoriaRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedCategoria);
    });

    it('should throw an error when category does not exist', async () => {
      // Arrange
      const updateData = { nome: 'Categoria Atualizada' };

      mockCategoriaRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(categoriaService.update(999, updateData))
        .rejects.toThrow('Categoria não encontrada');
      expect(mockCategoriaRepository.findById).toHaveBeenCalledWith(999);
      expect(mockCategoriaRepository.findByNome).not.toHaveBeenCalled();
      expect(mockCategoriaRepository.update).not.toHaveBeenCalled();
    });

    it('should throw an error when new name already exists', async () => {
      // Arrange
      const updateData = { nome: 'Categoria Existente' };
      const existingCategoria = { id: 1, nome: 'Carnes' };
      const anotherCategoria = { id: 2, nome: 'Categoria Existente' };

      mockCategoriaRepository.findById.mockResolvedValue(existingCategoria);
      mockCategoriaRepository.findByNome.mockResolvedValue(anotherCategoria);

      // Act & Assert
      await expect(categoriaService.update(1, updateData))
        .rejects.toThrow('Já existe uma categoria com este nome');
      expect(mockCategoriaRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCategoriaRepository.findByNome).toHaveBeenCalledWith('Categoria Existente');
      expect(mockCategoriaRepository.update).not.toHaveBeenCalled();
    });

    it('should not check for duplicate name if name is not changed', async () => {
      // Arrange
      const updateData = { nome: 'Carnes' };
      const existingCategoria = { id: 1, nome: 'Carnes' };
      const updatedCategoria = { id: 1, nome: 'Carnes' };

      mockCategoriaRepository.findById.mockResolvedValue(existingCategoria);
      mockCategoriaRepository.update.mockResolvedValue(updatedCategoria);

      // Act
      const result = await categoriaService.update(1, updateData);

      // Assert
      expect(mockCategoriaRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCategoriaRepository.findByNome).not.toHaveBeenCalled();
      expect(mockCategoriaRepository.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedCategoria);
    });
  });

  describe('delete', () => {
    it('should delete a category when it exists', async () => {
      // Arrange
      const existingCategoria = { id: 1, nome: 'Carnes' };

      mockCategoriaRepository.findById.mockResolvedValue(existingCategoria);
      mockCategoriaRepository.delete.mockResolvedValue(existingCategoria);

      // Act
      const result = await categoriaService.delete(1);

      // Assert
      expect(mockCategoriaRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCategoriaRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(existingCategoria);
    });

    it('should throw an error when category does not exist', async () => {
      // Arrange
      mockCategoriaRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(categoriaService.delete(999))
        .rejects.toThrow('Categoria não encontrada');
      expect(mockCategoriaRepository.findById).toHaveBeenCalledWith(999);
      expect(mockCategoriaRepository.delete).not.toHaveBeenCalled();
    });
  });
});
