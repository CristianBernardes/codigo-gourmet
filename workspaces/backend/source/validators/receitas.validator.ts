import Joi from 'joi';
import { MIN_RECIPE_NAME_LENGTH, MAX_RECIPE_NAME_LENGTH, MIN_RECIPE_TEXT_LENGTH, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../utils/constants';

/**
 * Validation schema for creating a recipe
 */
export const createReceitaSchema = Joi.object({
  id_categorias: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      'number.base': 'ID da categoria deve ser um número',
      'number.integer': 'ID da categoria deve ser um número inteiro',
      'number.positive': 'ID da categoria deve ser um número positivo'
    }),

  nome: Joi.string()
    .required()
    .min(MIN_RECIPE_NAME_LENGTH)
    .max(MAX_RECIPE_NAME_LENGTH)
    .messages({
      'string.empty': 'Nome é obrigatório',
      'string.min': 'Nome deve ter no mínimo {#limit} caracteres',
      'string.max': 'Nome deve ter no máximo {#limit} caracteres',
      'any.required': 'Nome é obrigatório'
    }),

  tempo_preparo_minutos: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      'number.base': 'Tempo de preparo deve ser um número',
      'number.integer': 'Tempo de preparo deve ser um número inteiro',
      'number.positive': 'Tempo de preparo deve ser um número positivo'
    }),

  porcoes: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      'number.base': 'Porções deve ser um número',
      'number.integer': 'Porções deve ser um número inteiro',
      'number.positive': 'Porções deve ser um número positivo'
    }),

  modo_preparo: Joi.string()
    .required()
    .min(MIN_RECIPE_TEXT_LENGTH)
    .messages({
      'string.empty': 'Modo de preparo é obrigatório',
      'string.min': 'Modo de preparo deve ter no mínimo {#limit} caracteres',
      'any.required': 'Modo de preparo é obrigatório'
    }),

  ingredientes: Joi.string()
    .required()
    .min(MIN_RECIPE_TEXT_LENGTH)
    .messages({
      'string.empty': 'Ingredientes é obrigatório',
      'string.min': 'Ingredientes deve ter no mínimo {#limit} caracteres',
      'any.required': 'Ingredientes é obrigatório'
    })
});

/**
 * Validation schema for updating a recipe
 */
export const updateReceitaSchema = Joi.object({
  id_categorias: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      'number.base': 'ID da categoria deve ser um número',
      'number.integer': 'ID da categoria deve ser um número inteiro',
      'number.positive': 'ID da categoria deve ser um número positivo'
    }),

  nome: Joi.string()
    .min(MIN_RECIPE_NAME_LENGTH)
    .max(MAX_RECIPE_NAME_LENGTH)
    .messages({
      'string.min': 'Nome deve ter no mínimo {#limit} caracteres',
      'string.max': 'Nome deve ter no máximo {#limit} caracteres'
    }),

  tempo_preparo_minutos: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      'number.base': 'Tempo de preparo deve ser um número',
      'number.integer': 'Tempo de preparo deve ser um número inteiro',
      'number.positive': 'Tempo de preparo deve ser um número positivo'
    }),

  porcoes: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      'number.base': 'Porções deve ser um número',
      'number.integer': 'Porções deve ser um número inteiro',
      'number.positive': 'Porções deve ser um número positivo'
    }),

  modo_preparo: Joi.string()
    .min(MIN_RECIPE_TEXT_LENGTH)
    .messages({
      'string.min': 'Modo de preparo deve ter no mínimo {#limit} caracteres'
    }),

  ingredientes: Joi.string()
    .min(MIN_RECIPE_TEXT_LENGTH)
    .messages({
      'string.min': 'Ingredientes deve ter no mínimo {#limit} caracteres'
    })
}).min(1).messages({
  'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

/**
 * Validation schema for ID parameter
 */
export const idParamSchema = Joi.object({
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

/**
 * Validation schema for search query parameters
 */
export const searchQuerySchema = Joi.object({
  termo_busca: Joi.string()
    .allow('', null),

  id_usuarios: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      'number.base': 'ID do usuário deve ser um número',
      'number.integer': 'ID do usuário deve ser um número inteiro',
      'number.positive': 'ID do usuário deve ser um número positivo'
    }),

  id_categorias: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .messages({
      'number.base': 'ID da categoria deve ser um número',
      'number.integer': 'ID da categoria deve ser um número inteiro',
      'number.positive': 'ID da categoria deve ser um número positivo'
    }),

  page: Joi.number()
    .integer()
    .positive()
    .default(1)
    .messages({
      'number.base': 'Página deve ser um número',
      'number.integer': 'Página deve ser um número inteiro',
      'number.positive': 'Página deve ser um número positivo'
    }),

  pageSize: Joi.number()
    .integer()
    .positive()
    .default(DEFAULT_PAGE_SIZE)
    .max(MAX_PAGE_SIZE)
    .messages({
      'number.base': 'Tamanho da página deve ser um número',
      'number.integer': 'Tamanho da página deve ser um número inteiro',
      'number.positive': 'Tamanho da página deve ser um número positivo',
      'number.max': `Tamanho da página não pode ser maior que ${MAX_PAGE_SIZE}`
    })
});
