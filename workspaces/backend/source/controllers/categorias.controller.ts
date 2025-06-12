import { Request, Response, NextFunction } from 'express';
import { ICategoriaService } from '../domain/interfaces/services/ICategoriaService';
import NotFoundError from '../utils/errors/NotFoundError';
import ResponseUtil from '../utils/response';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';

export class CategoriasController {
  constructor(private categoriaService: ICategoriaService) {}

  /**
   * Get all categories
   * @route GET /api/categorias
   */
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categorias = await this.categoriaService.findAll();

      return ResponseUtil.success(res, categorias);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Get a category by ID
   * @route GET /api/categorias/:id
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const categoria = await this.categoriaService.findById(id);

      if (!categoria) {
        return next(new NotFoundError('Categoria não encontrada'));
      }

      return ResponseUtil.success(res, categoria);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Create a new category
   * @route POST /api/categorias
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nome } = req.body;
      const novaCategoria = await this.categoriaService.create({ nome });

      return ResponseUtil.created(res, novaCategoria);
    } catch (error) {
      if (error instanceof Error && error.message === 'Já existe uma categoria com este nome') {
        return ResponseUtil.error(res, ERROR_MESSAGES.DUPLICATE_CATEGORY, 409);
      }
      return next(error);
    }
  };

  /**
   * Update a category
   * @route PUT /api/categorias/:id
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const { nome } = req.body;

      const categoriaAtualizada = await this.categoriaService.update(id, { nome });

      if (!categoriaAtualizada) {
        return next(new NotFoundError('Categoria não encontrada'));
      }

      return ResponseUtil.success(res, categoriaAtualizada);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Categoria não encontrada') {
          return next(new NotFoundError(error.message));
        }
        if (error.message === 'Já existe uma categoria com este nome') {
          return ResponseUtil.error(res, ERROR_MESSAGES.DUPLICATE_CATEGORY, 409);
        }
      }
      return next(error);
    }
  };

  /**
   * Delete a category
   * @route DELETE /api/categorias/:id
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const deletedCategoria = await this.categoriaService.delete(id);

      return ResponseUtil.success(res, deletedCategoria, SUCCESS_MESSAGES.CATEGORY_DELETED);
    } catch (error) {
      if (error instanceof Error && error.message === 'Categoria não encontrada') {
        return next(new NotFoundError(error.message));
      }
      return next(error);
    }
  };
}
