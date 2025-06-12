import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { authRateLimiter } from '../middlewares/rate-limit.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';

export const createAuthRouter = (authController: AuthController): Router => {
  const router = Router();

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     tags:
   *       - Autenticação
   *     summary: Autenticar usuário
   *     description: Autentica um usuário e retorna um token JWT
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - login
   *               - senha
   *             properties:
   *               login:
   *                 type: string
   *                 example: teste@exemplo.com
   *               senha:
   *                 type: string
   *                 format: password
   *                 example: senha123
   *     responses:
   *       200:
   *         description: Autenticação bem-sucedida
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   type: object
   *                   properties:
   *                     usuario:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: integer
   *                           example: 1
   *                         nome:
   *                           type: string
   *                           example: Usuário de Teste
   *                         login:
   *                           type: string
   *                           example: teste@exemplo.com
   *                     token:
   *                       type: string
   *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *       401:
   *         description: Credenciais inválidas
   *       429:
   *         description: Muitas tentativas de login
   */
  router.post(
    '/login',
    authRateLimiter,
    validateBody(loginSchema),
    authController.login
  );

  /**
   * @swagger
   * /auth/register:
   *   post:
   *     tags:
   *       - Autenticação
   *     summary: Registrar novo usuário
   *     description: Cria um novo usuário e retorna um token JWT
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nome
   *               - login
   *               - senha
   *             properties:
   *               nome:
   *                 type: string
   *                 example: Novo Usuário
   *               login:
   *                 type: string
   *                 example: novo@exemplo.com
   *               senha:
   *                 type: string
   *                 format: password
   *                 example: senha123
   *     responses:
   *       201:
   *         description: Usuário criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   type: object
   *                   properties:
   *                     usuario:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: integer
   *                           example: 3
   *                         nome:
   *                           type: string
   *                           example: Novo Usuário
   *                         login:
   *                           type: string
   *                           example: novo@exemplo.com
   *                     token:
   *                       type: string
   *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *       409:
   *         description: Login já está em uso
   *       429:
   *         description: Muitas tentativas de registro
   */
  router.post(
    '/register',
    authRateLimiter,
    validateBody(registerSchema),
    authController.register
  );

  /**
   * @swagger
   * /auth/me:
   *   get:
   *     tags:
   *       - Autenticação
   *     summary: Obter perfil do usuário atual
   *     description: Retorna os dados do usuário autenticado
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Perfil do usuário
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     login:
   *                       type: string
   *                       example: teste@exemplo.com
   *       401:
   *         description: Não autorizado
   */
  router.get(
    '/me',
    authMiddleware,
    authController.getProfile
  );

  return router;
};
