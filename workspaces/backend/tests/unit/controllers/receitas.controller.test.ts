import { Request, Response, NextFunction } from 'express';
import { ReceitasController } from '../../../source/controllers/receitas.controller';
import { IReceitaService } from '../../../source/domain/interfaces/services/IReceitaService';
import NotFoundError from '../../../source/utils/errors/NotFoundError';
import { ForbiddenError } from '../../../source/middlewares/error.middleware';
import { DEFAULT_PAGE_SIZE } from '../../../source/utils/constants';

describe('ReceitasController', () => {
  let receitasController: ReceitasController;
  let mockReceitaService: jest.Mocked<IReceitaService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    // Create mock for receita service
    mockReceitaService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUsuario: jest.fn(),
      findByCategoria: jest.fn(),
      search: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    // Create mock for request, response, and next function
    mockRequest = {
      params: {},
      query: {},
      body: {},
      user: { id: 1, login: 'test@example.com' }
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    nextFunction = jest.fn();

    // Create controller instance with mock service
    receitasController = new ReceitasController(mockReceitaService);
  });

  describe('getAll', () => {
    it('should return paginated recipes', async () => {
      // Arrange
      const mockRecipes = [{ id: 1, nome: 'Recipe 1' }, { id: 2, nome: 'Recipe 2' }];
      const mockResult = {
        data: mockRecipes,
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        totalItems: 2,
        totalPages: 1
      };

      mockReceitaService.findAll.mockResolvedValue(mockResult);

      // Act
      await receitasController.getAll(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.findAll).toHaveBeenCalledWith(1, DEFAULT_PAGE_SIZE);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockRecipes,
        meta: {
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          totalItems: 2,
          totalPages: 1
        }
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should use provided page and pageSize', async () => {
      // Arrange
      mockRequest.query = { page: '2', pageSize: '5' };
      
      const mockRecipes = [{ id: 3, nome: 'Recipe 3' }, { id: 4, nome: 'Recipe 4' }];
      const mockResult = {
        data: mockRecipes,
        page: 2,
        pageSize: 5,
        totalItems: 10,
        totalPages: 2
      };

      mockReceitaService.findAll.mockResolvedValue(mockResult);

      // Act
      await receitasController.getAll(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.findAll).toHaveBeenCalledWith(2, 5);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockRecipes,
        meta: {
          page: 2,
          pageSize: 5,
          totalItems: 10,
          totalPages: 2
        }
      });
    });

    it('should call next with error when service throws', async () => {
      // Arrange
      const error = new Error('Service error');
      mockReceitaService.findAll.mockRejectedValue(error);

      // Act
      await receitasController.getAll(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.findAll).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return recipe when found', async () => {
      // Arrange
      const mockRecipe = { id: 1, nome: 'Recipe 1' };
      mockRequest.params = { id: '1' };
      mockReceitaService.findById.mockResolvedValue(mockRecipe);

      // Act
      await receitasController.getById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.findById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockRecipe
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when recipe not found', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockReceitaService.findById.mockResolvedValue(null);

      // Act
      await receitasController.getById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.findById).toHaveBeenCalledWith(999);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      const error = new Error('Service error');
      mockReceitaService.findById.mockRejectedValue(error);

      // Act
      await receitasController.getById(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.findById).toHaveBeenCalledWith(1);
      expect(nextFunction).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('getByCategoria', () => {
    it('should return recipes for a category', async () => {
      // Arrange
      const mockRecipes = [{ id: 1, nome: 'Recipe 1' }, { id: 2, nome: 'Recipe 2' }];
      const mockResult = {
        data: mockRecipes,
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        totalItems: 2,
        totalPages: 1
      };

      mockRequest.params = { id_categorias: '1' };
      mockReceitaService.findByCategoria.mockResolvedValue(mockResult);

      // Act
      await receitasController.getByCategoria(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.findByCategoria).toHaveBeenCalledWith(1, 1, DEFAULT_PAGE_SIZE);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockRecipes,
        meta: {
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          totalItems: 2,
          totalPages: 1
        }
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when category not found', async () => {
      // Arrange
      mockRequest.params = { id_categorias: '999' };
      mockReceitaService.findByCategoria.mockRejectedValue(new Error('Categoria não encontrada'));

      // Act
      await receitasController.getByCategoria(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.findByCategoria).toHaveBeenCalledWith(999, 1, DEFAULT_PAGE_SIZE);
      expect(nextFunction).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws other error', async () => {
      // Arrange
      mockRequest.params = { id_categorias: '1' };
      const error = new Error('Other error');
      mockReceitaService.findByCategoria.mockRejectedValue(error);

      // Act
      await receitasController.getByCategoria(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.findByCategoria).toHaveBeenCalledWith(1, 1, DEFAULT_PAGE_SIZE);
      expect(nextFunction).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search recipes with filters', async () => {
      // Arrange
      const mockRecipes = [{ id: 1, nome: 'Chocolate Cake' }];
      const mockResult = {
        data: mockRecipes,
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        totalItems: 1,
        totalPages: 1
      };

      mockRequest.query = { 
        termo_busca: 'chocolate',
        id_usuarios: '1',
        id_categorias: '2'
      };
      
      mockReceitaService.search.mockResolvedValue(mockResult);

      // Act
      await receitasController.search(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.search).toHaveBeenCalledWith({
        termo_busca: 'chocolate',
        id_usuarios: 1,
        id_categorias: 2,
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockRecipes,
        meta: {
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          totalItems: 1,
          totalPages: 1
        }
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when category not found', async () => {
      // Arrange
      mockRequest.query = { id_categorias: '999' };
      mockReceitaService.search.mockRejectedValue(new Error('Categoria não encontrada'));

      // Act
      await receitasController.search(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.search).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws other error', async () => {
      // Arrange
      mockRequest.query = { termo_busca: 'chocolate' };
      const error = new Error('Other error');
      mockReceitaService.search.mockRejectedValue(error);

      // Act
      await receitasController.search(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.search).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new recipe', async () => {
      // Arrange
      const recipeData = {
        id_categorias: 1,
        nome: 'New Recipe',
        tempo_preparo_minutos: 30,
        porcoes: 4,
        modo_preparo: 'Test preparation',
        ingredientes: 'Test ingredients'
      };

      const createdRecipe = {
        id: 1,
        ...recipeData,
        id_usuarios: 1
      };

      mockRequest.body = recipeData;
      mockReceitaService.create.mockResolvedValue(createdRecipe);

      // Act
      await receitasController.create(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.create).toHaveBeenCalledWith({
        ...recipeData,
        id_usuarios: 1
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: createdRecipe
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with ForbiddenError when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await receitasController.create(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.create).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when category not found', async () => {
      // Arrange
      const recipeData = {
        id_categorias: 999,
        nome: 'New Recipe'
      };

      mockRequest.body = recipeData;
      mockReceitaService.create.mockRejectedValue(new Error('Categoria não encontrada'));

      // Act
      await receitasController.create(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.create).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws other error', async () => {
      // Arrange
      const recipeData = {
        id_categorias: 1,
        nome: 'New Recipe'
      };

      mockRequest.body = recipeData;
      const error = new Error('Other error');
      mockReceitaService.create.mockRejectedValue(error);

      // Act
      await receitasController.create(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.create).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a recipe', async () => {
      // Arrange
      const updateData = {
        nome: 'Updated Recipe',
        tempo_preparo_minutos: 45
      };

      const updatedRecipe = {
        id: 1,
        ...updateData,
        id_usuarios: 1,
        id_categorias: 1
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockReceitaService.update.mockResolvedValue(updatedRecipe);

      // Act
      await receitasController.update(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.update).toHaveBeenCalledWith(1, 1, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: updatedRecipe
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with ForbiddenError when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;
      mockRequest.params = { id: '1' };

      // Act
      await receitasController.update(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.update).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when recipe not found', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockRequest.body = { nome: 'Updated Recipe' };
      mockReceitaService.update.mockResolvedValue(null);

      // Act
      await receitasController.update(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.update).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when recipe not found error is thrown', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockRequest.body = { nome: 'Updated Recipe' };
      mockReceitaService.update.mockRejectedValue(new Error('Receita não encontrada'));

      // Act
      await receitasController.update(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.update).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when category not found error is thrown', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { id_categorias: 999 };
      mockReceitaService.update.mockRejectedValue(new Error('Categoria não encontrada'));

      // Act
      await receitasController.update(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.update).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with ForbiddenError when permission error is thrown', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { nome: 'Updated Recipe' };
      mockReceitaService.update.mockRejectedValue(new Error('Você não tem permissão para editar esta receita'));

      // Act
      await receitasController.update(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.update).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws other error', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { nome: 'Updated Recipe' };
      const error = new Error('Other error');
      mockReceitaService.update.mockRejectedValue(error);

      // Act
      await receitasController.update(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.update).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a recipe', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockReceitaService.delete.mockResolvedValue(true);

      // Act
      await receitasController.delete(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.delete).toHaveBeenCalledWith(1, 1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: null,
        message: 'Receita excluída com sucesso'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next with ForbiddenError when user is not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;
      mockRequest.params = { id: '1' };

      // Act
      await receitasController.delete(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.delete).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when recipe not found', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockReceitaService.delete.mockResolvedValue(false);

      // Act
      await receitasController.delete(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.delete).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with NotFoundError when recipe not found error is thrown', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockReceitaService.delete.mockRejectedValue(new Error('Receita não encontrada'));

      // Act
      await receitasController.delete(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.delete).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with ForbiddenError when permission error is thrown', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockReceitaService.delete.mockRejectedValue(new Error('Você não tem permissão para excluir esta receita'));

      // Act
      await receitasController.delete(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.delete).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should call next with error when service throws other error', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      const error = new Error('Other error');
      mockReceitaService.delete.mockRejectedValue(error);

      // Act
      await receitasController.delete(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert
      expect(mockReceitaService.delete).toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });
});