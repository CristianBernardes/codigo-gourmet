import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';

export const createUsuariosRouter = (usuarioController: UsuarioController): Router => {
  const router = Router();

  /**
   * @swagger
   * /usuarios:
   *   get:
   *     tags:
   *       - Usuários
   *     summary: Obter todos os usuários
   *     description: Retorna uma lista com id e nome de todos os usuários
   *     responses:
   *       200:
   *         description: Lista de usuários
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         example: 1
   *                       nome:
   *                         type: string
   *                         example: "Usuário de Teste"
   */
  router.get(
    '/',
    usuarioController.getAllUsers
  );

  return router;
};