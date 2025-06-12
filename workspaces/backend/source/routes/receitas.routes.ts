import { Router } from 'express';
import { ReceitasController } from '../controllers/receitas.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../middlewares/validation.middleware';
import { defaultRateLimiter, searchRateLimiter } from '../middlewares/rate-limit.middleware';
import Joi from 'joi';
import { 
  createReceitaSchema, 
  updateReceitaSchema, 
  idParamSchema, 
  searchQuerySchema 
} from '../validators/receitas.validator';

export const createReceitasRouter = (receitasController: ReceitasController): Router => {
  const router = Router();

  /**
   * @swagger
   * /receitas:
   *   get:
   *     tags:
   *       - Receitas
   *     summary: Listar todas as receitas
   *     description: Retorna uma lista paginada de todas as receitas disponíveis
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número da página
   *         example: 1
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *           default: 10
   *           maximum: 100
   *         description: Quantidade de itens por página
   *         example: 10
   *     responses:
   *       200:
   *         description: Lista paginada de receitas
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
   *                       id_usuarios:
   *                         type: integer
   *                         example: 1
   *                       id_categorias:
   *                         type: integer
   *                         example: 2
   *                       nome:
   *                         type: string
   *                         example: Bife à Parmegiana
   *                       tempo_preparo_minutos:
   *                         type: integer
   *                         example: 45
   *                       porcoes:
   *                         type: integer
   *                         example: 4
   *                       modo_preparo:
   *                         type: string
   *                         example: "1. Tempere os bifes com sal e pimenta..."
   *                       ingredientes:
   *                         type: string
   *                         example: "- 4 bifes de contra filé\n- 2 ovos batidos..."
   *                       criado_em:
   *                         type: string
   *                         format: date-time
   *                       alterado_em:
   *                         type: string
   *                         format: date-time
   *                       usuario:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 1
   *                           nome:
   *                             type: string
   *                             example: Usuário de Teste
   *                           login:
   *                             type: string
   *                             example: teste@exemplo.com
   *                       categoria:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 2
   *                           nome:
   *                             type: string
   *                             example: Carnes
   *                 meta:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                       example: 1
   *                     pageSize:
   *                       type: integer
   *                       example: 10
   *                     totalItems:
   *                       type: integer
   *                       example: 3
   *                     totalPages:
   *                       type: integer
   *                       example: 1
   *       429:
   *         description: Muitas requisições
   */
  router.get(
    '/',
    defaultRateLimiter,
    receitasController.getAll
  );

  /**
   * @swagger
   * /receitas/search:
   *   get:
   *     tags:
   *       - Receitas
   *     summary: Buscar receitas
   *     description: Busca receitas com filtros e retorna resultados paginados
   *     parameters:
   *       - in: query
   *         name: termo_busca
   *         schema:
   *           type: string
   *         description: Termo para busca em nome, ingredientes e modo de preparo
   *         example: frango
   *       - in: query
   *         name: id_usuarios
   *         schema:
   *           type: integer
   *         description: ID do usuário para filtrar receitas
   *         example: 1
   *       - in: query
   *         name: id_categorias
   *         schema:
   *           type: integer
   *         description: ID da categoria para filtrar receitas
   *         example: 3
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número da página
   *         example: 1
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *           default: 10
   *           maximum: 100
   *         description: Quantidade de itens por página
   *         example: 10
   *     responses:
   *       200:
   *         description: Receitas encontradas
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
   *                     $ref: '#/components/schemas/Receita'
   *                 meta:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                       example: 1
   *                     pageSize:
   *                       type: integer
   *                       example: 10
   *                     totalItems:
   *                       type: integer
   *                       example: 3
   *                     totalPages:
   *                       type: integer
   *                       example: 1
   *       404:
   *         description: Categoria não encontrada (se id_categorias for fornecido e inválido)
   *       429:
   *         description: Muitas requisições
   */
  router.get(
    '/search',
    searchRateLimiter,
    validateQuery(searchQuerySchema),
    receitasController.search
  );

  /**
   * @swagger
   * /receitas/usuario/{id_usuarios}:
   *   get:
   *     tags:
   *       - Receitas
   *     summary: Listar receitas por usuário
   *     description: Retorna uma lista paginada das receitas de um usuário específico
   *     parameters:
   *       - in: path
   *         name: id_usuarios
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do usuário
   *         example: 1
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número da página
   *         example: 1
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *           default: 10
   *           maximum: 100
   *         description: Quantidade de itens por página
   *         example: 10
   *     responses:
   *       200:
   *         description: Receitas do usuário
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
   *                         example: Bife à Parmegiana
   *                       id_categorias:
   *                         type: integer
   *                         example: 2
   *                       categoria:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 2
   *                           nome:
   *                             type: string
   *                             example: Carnes
   *                 meta:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                       example: 1
   *                     pageSize:
   *                       type: integer
   *                       example: 10
   *                     totalItems:
   *                       type: integer
   *                       example: 3
   *                     totalPages:
   *                       type: integer
   *                       example: 1
   *       429:
   *         description: Muitas requisições
   */
  router.get(
    '/usuario/:id_usuarios',
    defaultRateLimiter,
    validateParams(Joi.object({
      id_usuarios: Joi.number().integer().positive().required()
    })),
    receitasController.getByUsuario
  );

  /**
   * @swagger
   * /receitas/categoria/{id_categorias}:
   *   get:
   *     tags:
   *       - Receitas
   *     summary: Listar receitas por categoria
   *     description: Retorna uma lista paginada das receitas de uma categoria específica
   *     parameters:
   *       - in: path
   *         name: id_categorias
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da categoria
   *         example: 2
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número da página
   *         example: 1
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *           default: 10
   *           maximum: 100
   *         description: Quantidade de itens por página
   *         example: 10
   *     responses:
   *       200:
   *         description: Receitas da categoria
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
   *                         example: Bife à Parmegiana
   *                       id_usuarios:
   *                         type: integer
   *                         example: 1
   *                       usuario:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 1
   *                           nome:
   *                             type: string
   *                             example: Usuário de Teste
   *                           login:
   *                             type: string
   *                             example: teste@exemplo.com
   *                 meta:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                       example: 1
   *                     pageSize:
   *                       type: integer
   *                       example: 10
   *                     totalItems:
   *                       type: integer
   *                       example: 3
   *                     totalPages:
   *                       type: integer
   *                       example: 1
   *       404:
   *         description: Categoria não encontrada
   *       429:
   *         description: Muitas requisições
   */
  router.get(
    '/categoria/:id_categorias',
    defaultRateLimiter,
    validateParams(Joi.object({
      id_categorias: Joi.number().integer().positive().required()
    })),
    receitasController.getByCategoria
  );

  /**
   * @swagger
   * /receitas/{id}:
   *   get:
   *     tags:
   *       - Receitas
   *     summary: Obter receita por ID
   *     description: Retorna uma receita específica pelo seu ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da receita
   *         example: 1
   *     responses:
   *       200:
   *         description: Receita encontrada
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
   *                     id_usuarios:
   *                       type: integer
   *                       example: 1
   *                     id_categorias:
   *                       type: integer
   *                       example: 2
   *                     nome:
   *                       type: string
   *                       example: Bife à Parmegiana
   *                     tempo_preparo_minutos:
   *                       type: integer
   *                       example: 45
   *                     porcoes:
   *                       type: integer
   *                       example: 4
   *                     modo_preparo:
   *                       type: string
   *                       example: "1. Tempere os bifes com sal e pimenta..."
   *                     ingredientes:
   *                       type: string
   *                       example: "- 4 bifes de contra filé\n- 2 ovos batidos..."
   *                     criado_em:
   *                       type: string
   *                       format: date-time
   *                     alterado_em:
   *                       type: string
   *                       format: date-time
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
   *                     categoria:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: integer
   *                           example: 2
   *                         nome:
   *                           type: string
   *                           example: Carnes
   *       404:
   *         description: Receita não encontrada
   *       429:
   *         description: Muitas requisições
   */
  router.get(
    '/:id',
    defaultRateLimiter,
    validateParams(idParamSchema),
    receitasController.getById
  );

  /**
   * @swagger
   * /receitas:
   *   post:
   *     tags:
   *       - Receitas
   *     summary: Criar nova receita
   *     description: Cria uma nova receita no sistema
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
   *               - modo_preparo
   *               - ingredientes
   *             properties:
   *               id_categorias:
   *                 type: integer
   *                 example: 2
   *               nome:
   *                 type: string
   *                 example: Frango Assado com Batatas
   *               tempo_preparo_minutos:
   *                 type: integer
   *                 example: 60
   *               porcoes:
   *                 type: integer
   *                 example: 4
   *               modo_preparo:
   *                 type: string
   *                 example: "1. Tempere o frango...\n2. Pré-aqueça o forno..."
   *               ingredientes:
   *                 type: string
   *                 example: "- 1 frango inteiro\n- 4 batatas médias\n- Sal e pimenta a gosto"
   *     responses:
   *       201:
   *         description: Receita criada com sucesso
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
   *                       example: 4
   *                     id_usuarios:
   *                       type: integer
   *                       example: 1
   *                     id_categorias:
   *                       type: integer
   *                       example: 2
   *                     nome:
   *                       type: string
   *                       example: Frango Assado com Batatas
   *                     tempo_preparo_minutos:
   *                       type: integer
   *                       example: 60
   *                     porcoes:
   *                       type: integer
   *                       example: 4
   *                     modo_preparo:
   *                       type: string
   *                       example: "1. Tempere o frango...\n2. Pré-aqueça o forno..."
   *                     ingredientes:
   *                       type: string
   *                       example: "- 1 frango inteiro\n- 4 batatas médias\n- Sal e pimenta a gosto"
   *       400:
   *         description: Dados inválidos
   *       401:
   *         description: Não autorizado
   *       404:
   *         description: Categoria não encontrada
   *       429:
   *         description: Muitas requisições
   */
  router.post(
    '/',
    defaultRateLimiter,
    authMiddleware,
    validateBody(createReceitaSchema),
    receitasController.create
  );

  /**
   * @swagger
   * /receitas/{id}:
   *   put:
   *     tags:
   *       - Receitas
   *     summary: Atualizar receita
   *     description: Atualiza uma receita existente
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da receita
   *         example: 1
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               id_categorias:
   *                 type: integer
   *                 example: 3
   *               nome:
   *                 type: string
   *                 example: Bife à Parmegiana Atualizado
   *               tempo_preparo_minutos:
   *                 type: integer
   *                 example: 50
   *               porcoes:
   *                 type: integer
   *                 example: 5
   *               modo_preparo:
   *                 type: string
   *                 example: "1. Tempere os bifes...\n2. Frite os bifes..."
   *               ingredientes:
   *                 type: string
   *                 example: "- 5 bifes de contra filé\n- 3 ovos batidos..."
   *     responses:
   *       200:
   *         description: Receita atualizada com sucesso
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
   *                     id_usuarios:
   *                       type: integer
   *                       example: 1
   *                     id_categorias:
   *                       type: integer
   *                       example: 3
   *                     nome:
   *                       type: string
   *                       example: Bife à Parmegiana Atualizado
   *                     tempo_preparo_minutos:
   *                       type: integer
   *                       example: 50
   *                     porcoes:
   *                       type: integer
   *                       example: 5
   *                     modo_preparo:
   *                       type: string
   *                       example: "1. Tempere os bifes...\n2. Frite os bifes..."
   *                     ingredientes:
   *                       type: string
   *                       example: "- 5 bifes de contra filé\n- 3 ovos batidos..."
   *       400:
   *         description: Dados inválidos
   *       401:
   *         description: Não autorizado
   *       403:
   *         description: Você não tem permissão para editar esta receita
   *       404:
   *         description: Receita não encontrada ou categoria não encontrada
   *       429:
   *         description: Muitas requisições
   */
  router.put(
    '/:id',
    defaultRateLimiter,
    authMiddleware,
    validateParams(idParamSchema),
    validateBody(updateReceitaSchema),
    receitasController.update
  );

  /**
   * @swagger
   * /receitas/{id}:
   *   delete:
   *     tags:
   *       - Receitas
   *     summary: Excluir receita
   *     description: Remove uma receita existente
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID da receita
   *         example: 1
   *     responses:
   *       200:
   *         description: Receita excluída com sucesso
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
   *                   example: Receita excluída com sucesso
   *       401:
   *         description: Não autorizado
   *       403:
   *         description: Você não tem permissão para excluir esta receita
   *       404:
   *         description: Receita não encontrada
   *       429:
   *         description: Muitas requisições
   */
  router.delete(
    '/:id',
    defaultRateLimiter,
    authMiddleware,
    validateParams(idParamSchema),
    receitasController.delete
  );

  return router;
};
