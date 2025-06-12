/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: Usuário de Teste
 *         login:
 *           type: string
 *           example: teste@exemplo.com
 *         criado_em:
 *           type: string
 *           format: date-time
 *         alterado_em:
 *           type: string
 *           format: date-time
 *     
 *     Categoria:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 2
 *         nome:
 *           type: string
 *           example: Carnes
 *     
 *     Receita:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         id_usuarios:
 *           type: integer
 *           example: 1
 *         id_categorias:
 *           type: integer
 *           example: 2
 *         nome:
 *           type: string
 *           example: Bife à Parmegiana
 *         tempo_preparo_minutos:
 *           type: integer
 *           example: 45
 *         porcoes:
 *           type: integer
 *           example: 4
 *         modo_preparo:
 *           type: string
 *           example: "1. Tempere os bifes com sal e pimenta..."
 *         ingredientes:
 *           type: string
 *           example: "- 4 bifes de contra filé\n- 2 ovos batidos..."
 *         criado_em:
 *           type: string
 *           format: date-time
 *         alterado_em:
 *           type: string
 *           format: date-time
 *         usuario:
 *           $ref: '#/components/schemas/Usuario'
 *         categoria:
 *           $ref: '#/components/schemas/Categoria'
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// This file is only for Swagger documentation
// It doesn't export anything
export {};