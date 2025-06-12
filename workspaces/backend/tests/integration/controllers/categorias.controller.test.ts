import { Request, Response, NextFunction } from 'express';
import { CategoriasController } from '../../../source/controllers/categorias.controller';
import { ICategoriaService, CreateCategoriaDTO, UpdateCategoriaDTO } from '../../../source/domain/interfaces/services/ICategoriaService';
import { Categoria } from '../../../source/domain/entities/Categoria';
import { NotFoundError } from '../../../source/middlewares/error.middleware';

describe('CategoriasController', () => {
  let categoriasController: CategoriasController;
  let mockCategoriaService: jest.Mocked<ICategoriaService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock<NextFunction>;

  beforeEach(() => {
    // Create mock for categoria service
    mockCategoriaService = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as jest.Mocked<ICategoriaService>;

    // Create controller instance with mock service
    categoriasController = new CategoriasController(mockCategoriaService);

    // Create mock request and response objects
    mockRequest = {
      body: {},
      params: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    nextFunction = jest.fn();
  });

  describe('getAll', () => {
    it('should return 200 and all categories', async () => {
      // Arrange
      const mockCategorias: Categoria[] = [
        { id: 1, nome: 'Categoria 1' },
        { id: 2, nome: 'Categoria 2' },
        { id: 3, nome: 'Categoria 3' }
      ];

      mockCategoriaService.findAll.mockResolvedValue(mockCategorias);

      // Act
      await categoriasController.getAll(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockCategoriaService.findAll).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockCategorias
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      // Arrange
      const error = new Error('Database error');
      mockCategoriaService.findAll.mockRejectedValue(error);

      // Act
      await categoriasController.getAll(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockCategoriaService.findAll).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    it('should return 200 and category when found', async () => {
      // Arrange
      const mockCategoria: Categoria = { id: 1, nome: 'Categoria 1' };
      mockRequest.params = { id: '1' };
      mockCategoriaService.findById.mockResolvedValue(mockCategoria);

      // Act
      await categoriasController.getById(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockCategoriaService.findById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockCategoria
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when category not found', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockCategoriaService.findById.mockResolvedValue(null);

      // Act
      await categoriasController.getById(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockCategoriaService.findById).toHaveBeenCalledWith(999);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(nextFunction.mock.calls[0][0].message).toBe('Categoria não encontrada');
    });

    it('should call next with error when service throws', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      const error = new Error('Database error');
      mockCategoriaService.findById.mockRejectedValue(error);

      // Act
      await categoriasController.getById(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockCategoriaService.findById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('create', () => {
    it('should return 201 and created category', async () => {
      // Arrange
      const createData: CreateCategoriaDTO = { nome: 'Nova Categoria' };
      const createdCategoria: Categoria = { id: 4, nome: 'Nova Categoria' };

      mockRequest.body = createData;
      mockCategoriaService.create.mockResolvedValue(createdCategoria);

      // Act
      await categoriasController.create(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockCategoriaService.create).toHaveBeenCalledWith(createData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: createdCategoria
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 409 when category name already exists', async () => {
      // Arrange
      mockRequest.body = { nome: 'Categoria Existente' };
      mockCategoriaService.create.mockRejectedValue(new Error('Já existe uma categoria com este nome'));

      // Act
      await categoriasController.create(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockCategoriaService.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Já existe uma categoria com este nome'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with error for other errors', async () => {
      // Arrange
      mockRequest.body = { nome: 'Nova Categoria' };
      const error = new Error('Database error');
      mockCategoriaService.create.mockRejectedValue(error);

      // Act
      await categoriasController.create(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockCategoriaService.create).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    it('should return 200 and updated category', async () => {
      // Arrange
      const updateData: UpdateCategoriaDTO = { nome: 'Categoria Atualizada' };
      const updatedCategoria: Categoria = { id: 1, nome: 'Categoria Atualizada' };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockCategoriaService.update.mockResolvedValue(updatedCategoria);

      // Act
      await categoriasController.update(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockCategoriaService.update).toHaveBeenCalledWith(1, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: updatedCategoria
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when category not found', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockRequest.body = { nome: 'Categoria Inexistente' };
      mockCategoriaService.update.mockResolvedValue(null);

      // Act
      await categoriasController.update(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockCategoriaService.update).toHaveBeenCalledWith(999, { nome: 'Categoria Inexistente' });
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(nextFunction.mock.calls[0][0].message).toBe('Categoria não encontrada');
    });

    it('should return 409 when category name already exists', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { nome: 'Categoria Existente' };
      mockCategoriaService.update.mockRejectedValue(new Error('Já existe uma categoria com este nome'));

      // Act
      await categoriasController.update(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockCategoriaService.update).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Já existe uma categoria com este nome'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when service throws category not found', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { nome: 'Categoria Atualizada' };
      mockCategoriaService.update.mockRejectedValue(new Error('Categoria não encontrada'));

      // Act
      await categoriasController.update(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockCategoriaService.update).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(nextFunction.mock.calls[0][0].message).toBe('Categoria não encontrada');
    });

    it('should call next with error for other errors', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { nome: 'Categoria Atualizada' };
      const error = new Error('Database error');
      mockCategoriaService.update.mockRejectedValue(error);

      // Act
      await categoriasController.update(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockCategoriaService.update).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    it('should return 200 with deleted category and success message', async () => {
      // Arrange
      const deletedCategoria = { id: 1, nome: 'Categoria Deletada' };
      mockRequest.params = { id: '1' };
      mockCategoriaService.delete.mockResolvedValue(deletedCategoria);

      // Act
      await categoriasController.delete(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockCategoriaService.delete).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Categoria excluída com sucesso',
        data: deletedCategoria
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when service throws category not found', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockCategoriaService.delete.mockRejectedValue(new Error('Categoria não encontrada'));

      // Act
      await categoriasController.delete(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockCategoriaService.delete).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(nextFunction.mock.calls[0][0].message).toBe('Categoria não encontrada');
    });

    it('should call next with error for other errors', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      const error = new Error('Database error');
      mockCategoriaService.delete.mockRejectedValue(error);

      // Act
      await categoriasController.delete(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(mockCategoriaService.delete).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });
});
