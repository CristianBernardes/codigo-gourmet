import { Request, Response, NextFunction } from 'express';
import { IUsuarioService } from '../domain/interfaces/services/IUsuarioService';
import ResponseUtil from '../utils/response';

export class UsuarioController {
  constructor(private usuarioService: IUsuarioService) {}

  /**
   * Get all users (only id and name)
   * @route GET /api/usuarios
   */
  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.usuarioService.getAllUsers();
      return ResponseUtil.success(res, users);
    } catch (error) {
      return next(error);
    }
  };
}