import { Request, Response, NextFunction } from 'express';
import { IReceitaService } from '../domain/interfaces/services/IReceitaService';
import NotFoundError from '../utils/errors/NotFoundError';
import { ForbiddenError } from '../middlewares/error.middleware';
import ResponseUtil from '../utils/response';
import { SUCCESS_MESSAGES, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../utils/constants';

export class ReceitasController {
  constructor(private receitaService: IReceitaService) {}

  /**
   * Get all recipes
   * @route GET /api/receitas
   */
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : DEFAULT_PAGE_SIZE;

      // Ensure pageSize doesn't exceed the maximum
      const limitSize = Math.min(pageSize, MAX_PAGE_SIZE);

      const result = await this.receitaService.findAll(page, limitSize);

      return ResponseUtil.paginated(
        res, 
        result.data, 
        result.page, 
        result.pageSize, 
        result.totalItems
      );
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Get a recipe by ID
   * @route GET /api/receitas/:id
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params.id);
      const receita = await this.receitaService.findById(id);

      if (!receita) {
        return next(new NotFoundError('Receita não encontrada'));
      }

      return ResponseUtil.success(res, receita);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Get recipes by user ID
   * @route GET /api/receitas/usuario/:id_usuarios
   */
  getByUsuario = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id_usuarios = parseInt(req.params.id_usuarios);
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : DEFAULT_PAGE_SIZE;

      // Ensure pageSize doesn't exceed the maximum
      const limitSize = Math.min(pageSize, MAX_PAGE_SIZE);

      const result = await this.receitaService.findByUsuario(id_usuarios, page, limitSize);

      return ResponseUtil.paginated(
        res, 
        result.data, 
        result.page, 
        result.pageSize, 
        result.totalItems
      );
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Get recipes by category ID
   * @route GET /api/receitas/categoria/:id_categorias
   */
  getByCategoria = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id_categorias = parseInt(req.params.id_categorias);
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : DEFAULT_PAGE_SIZE;

      // Ensure pageSize doesn't exceed the maximum
      const limitSize = Math.min(pageSize, MAX_PAGE_SIZE);

      const result = await this.receitaService.findByCategoria(id_categorias, page, limitSize);

      return ResponseUtil.paginated(
        res, 
        result.data, 
        result.page, 
        result.pageSize, 
        result.totalItems
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'Categoria não encontrada') {
        return next(new NotFoundError(error.message));
      }
      return next(error);
    }
  };

  /**
   * Search recipes
   * @route GET /api/receitas/search
   */
  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { termo_busca, id_usuarios, id_categorias, page, pageSize } = req.query;

      const filtros = {
        termo_busca: termo_busca as string,
        id_usuarios: id_usuarios ? parseInt(id_usuarios as string) : undefined,
        id_categorias: id_categorias ? parseInt(id_categorias as string) : undefined,
        page: page ? parseInt(page as string) : 1,
        pageSize: pageSize ? parseInt(pageSize as string) : DEFAULT_PAGE_SIZE
      };

      // Ensure pageSize doesn't exceed the maximum
      filtros.pageSize = Math.min(filtros.pageSize, MAX_PAGE_SIZE);

      const result = await this.receitaService.search(filtros);

      return ResponseUtil.paginated(
        res, 
        result.data, 
        result.page, 
        result.pageSize, 
        result.totalItems
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'Categoria não encontrada') {
        return next(new NotFoundError(error.message));
      }
      return next(error);
    }
  };

  /**
   * Create a new recipe
   * @route POST /api/receitas
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ForbiddenError('Usuário não autenticado'));
      }

      const { id_categorias, nome, tempo_preparo_minutos, porcoes, modo_preparo, ingredientes } = req.body;

      const novaReceita = await this.receitaService.create({
        id_usuarios: req.user.id,
        id_categorias,
        nome,
        tempo_preparo_minutos,
        porcoes,
        modo_preparo,
        ingredientes
      });

      return ResponseUtil.created(res, novaReceita);
    } catch (error) {
      if (error instanceof Error && error.message === 'Categoria não encontrada') {
        return next(new NotFoundError(error.message));
      }
      return next(error);
    }
  };

  /**
   * Update a recipe
   * @route PUT /api/receitas/:id
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ForbiddenError('Usuário não autenticado'));
      }

      const id = parseInt(req.params.id);
      const { id_categorias, nome, tempo_preparo_minutos, porcoes, modo_preparo, ingredientes } = req.body;

      const receitaAtualizada = await this.receitaService.update(
        id,
        req.user.id,
        {
          id_categorias,
          nome,
          tempo_preparo_minutos,
          porcoes,
          modo_preparo,
          ingredientes
        }
      );

      if (!receitaAtualizada) {
        return next(new NotFoundError('Receita não encontrada'));
      }

      return ResponseUtil.success(res, receitaAtualizada);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Receita não encontrada') {
          return next(new NotFoundError(error.message));
        }
        if (error.message === 'Categoria não encontrada') {
          return next(new NotFoundError(error.message));
        }
        if (error.message === 'Você não tem permissão para editar esta receita') {
          return next(new ForbiddenError(error.message));
        }
      }
      return next(error);
    }
  };

  /**
   * Delete a recipe
   * @route DELETE /api/receitas/:id
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ForbiddenError('Usuário não autenticado'));
      }

      const id = parseInt(req.params.id);
      const deleted = await this.receitaService.delete(id, req.user.id);

      if (!deleted) {
        return next(new NotFoundError('Receita não encontrada'));
      }

      return ResponseUtil.success(res, null, SUCCESS_MESSAGES.RECIPE_DELETED);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Receita não encontrada') {
          return next(new NotFoundError(error.message));
        }
        if (error.message === 'Você não tem permissão para excluir esta receita') {
          return next(new ForbiddenError(error.message));
        }
      }
      return next(error);
    }
  };
}
