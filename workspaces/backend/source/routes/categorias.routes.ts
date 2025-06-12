import { Router } from 'express';
import { CategoriasController } from '../controllers/categorias.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody, validateParams } from '../middlewares/validation.middleware';
import { defaultRateLimiter } from '../middlewares/rate-limit.middleware';
import Joi from 'joi';

// Validation schemas
const categoriaSchema = Joi.object({
  nome: Joi.string()
    .required()
    .min(3)
    .max(100)
    .messages({
      'string.empty': 'Nome é obrigatório',
      'string.min': 'Nome deve ter no mínimo {#limit} caracteres',
      'string.max': 'Nome deve ter no máximo {#limit} caracteres',
      'any.required': 'Nome é obrigatório'
    })
});

const idParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'ID deve ser um número',
      'number.integer': 'ID deve ser um número inteiro',
      'number.positive': 'ID deve ser um número positivo',
      'any.required': 'ID é obrigatório'
    })
});

export const createCategoriasRouter = (categoriasController: CategoriasController): Router => {
  const router = Router();

  /**
   * @swagger
   * /categorias:
   *   get:
   *     tags:
   *       - Categorias
   *     summary: Listar todas as categorias
   *     description: Retorna uma lista de todas as categorias disponíveis
   *     responses:
   *       200:
   *         description: Lista de categorias
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
   *                         example: Bolos e tortas doces
   *       429:
   *         description: Muitas requisições
   */
  router.get(
    '/',
    defaultRateLimiter,
    categoriasController.getAll
  );

  /**
   * @swagger
   * /categorias/{id}:
   *   get:
   *     tags:
   *       - Categorias
   *     summary: Obter categoria por ID
   *     description: Retorna uma categoria específica pelo seu ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da categoria
   *         example: 1
   *     responses:
   *       200:
   *         description: Categoria encontrada
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
   *                     nome:
   *                       type: string
   *                       example: Bolos e tortas doces
   *       404:
   *         description: Categoria não encontrada
   *       429:
   *         description: Muitas requisições
   */
  router.get(
    '/:id',
    defaultRateLimiter,
    validateParams(idParamSchema),
    categoriasController.getById
  );

  /**
   * @swagger
   * /categorias:
   *   post:
   *     tags:
   *       - Categorias
   *     summary: Criar nova categoria
   *     description: Cria uma nova categoria no sistema
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nome
   *             properties:
   *               nome:
   *                 type: string
   *                 example: Nova Categoria
   *     responses:
   *       201:
   *         description: Categoria criada com sucesso
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
   *                       example: 16
   *                     nome:
   *                       type: string
   *                       example: Nova Categoria
   *       400:
   *         description: Dados inválidos
   *       401:
   *         description: Não autorizado
   *       409:
   *         description: Já existe uma categoria com este nome
   *       429:
   *         description: Muitas requisições
   */
  router.post(
    '/',
    defaultRateLimiter,
    authMiddleware,
    validateBody(categoriaSchema),
    categoriasController.create
  );

  /**
   * @swagger
   * /categorias/{id}:
   *   put:
   *     tags:
   *       - Categorias
   *     summary: Atualizar categoria
   *     description: Atualiza uma categoria existente
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da categoria
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nome
   *             properties:
   *               nome:
   *                 type: string
   *                 example: Categoria Atualizada
   *     responses:
   *       200:
   *         description: Categoria atualizada com sucesso
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
   *                     nome:
   *                       type: string
   *                       example: Categoria Atualizada
   *       400:
   *         description: Dados inválidos
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Categoria não encontrada
   *       409:
   *         description: Já existe uma categoria com este nome
   *       429:
   *         description: Muitas requisições
   */
  router.put(
    '/:id',
    defaultRateLimiter,
    authMiddleware,
    validateParams(idParamSchema),
    validateBody(categoriaSchema),
    categoriasController.update
  );

  /**
   * @swagger
   * /categorias/{id}:
   *   delete:
   *     tags:
   *       - Categorias
   *     summary: Excluir categoria
   *     description: Remove uma categoria existente
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da categoria
   *         example: 1
   *     responses:
   *       200:
   *         description: Categoria excluída com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 message:
   *                   type: string
   *                   example: Categoria excluída com sucesso
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Categoria não encontrada
   *       429:
   *         description: Muitas requisições
   */
  router.delete(
    '/:id',
    defaultRateLimiter,
    authMiddleware,
    validateParams(idParamSchema),
    categoriasController.delete
  );

  return router;
};
