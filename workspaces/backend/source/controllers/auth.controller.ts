import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../domain/interfaces/services/IAuthService';
import { UnauthorizedError } from '../middlewares/error.middleware';
import ResponseUtil from '../utils/response';

export class AuthController {
  constructor(private authService: IAuthService) {}

  /**
   * Login endpoint
   * @route POST /api/auth/login
   */
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { login, senha } = req.body;
      const result = await this.authService.login({ login, senha });

      return ResponseUtil.success(res, result);
    } catch (error) {
      if (error instanceof Error) {
        // Convert known errors to appropriate HTTP errors
        if (error.message === 'Usuário não encontrado' || error.message === 'Senha incorreta') {
          return next(new UnauthorizedError('Credenciais inválidas'));
        }
      }
      return next(error);
    }
  };

  /**
   * Register endpoint
   * @route POST /api/auth/register
   */
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nome, login, senha } = req.body;
      const result = await this.authService.register({ nome, login, senha });

      return ResponseUtil.created(res, result);
    } catch (error) {
      if (error instanceof Error && error.message === 'Este login já está em uso') {
        return ResponseUtil.error(res, 'Este login já está em uso', 409);
      }
      return next(error);
    }
  };

  /**
   * Get current user profile
   * @route GET /api/auth/me
   */
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // The user is already attached to the request by the auth middleware
      if (!req.user) {
        return next(new UnauthorizedError());
      }

      return ResponseUtil.success(res, {
        id: req.user.id,
        login: req.user.login
      });
    } catch (error) {
      return next(error);
    }
  };
}
