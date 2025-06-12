import Joi from 'joi';
import { MIN_LOGIN_LENGTH, MAX_LOGIN_LENGTH, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH, MIN_NAME_LENGTH, MAX_NAME_LENGTH } from '../utils/constants';

/**
 * Validation schema for login requests
 */
export const loginSchema = Joi.object({
  login: Joi.string()
    .required()
    .min(MIN_LOGIN_LENGTH)
    .max(MAX_LOGIN_LENGTH)
    .messages({
      'string.empty': 'Login é obrigatório',
      'string.min': 'Login deve ter no mínimo {#limit} caracteres',
      'string.max': 'Login deve ter no máximo {#limit} caracteres',
      'any.required': 'Login é obrigatório'
    }),

  senha: Joi.string()
    .required()
    .min(MIN_PASSWORD_LENGTH)
    .max(MAX_PASSWORD_LENGTH)
    .messages({
      'string.empty': 'Senha é obrigatória',
      'string.min': 'Senha deve ter no mínimo {#limit} caracteres',
      'string.max': 'Senha deve ter no máximo {#limit} caracteres',
      'any.required': 'Senha é obrigatória'
    })
});

/**
 * Validation schema for registration requests
 */
export const registerSchema = Joi.object({
  nome: Joi.string()
    .required()
    .min(MIN_NAME_LENGTH)
    .max(MAX_NAME_LENGTH)
    .messages({
      'string.empty': 'Nome é obrigatório',
      'string.min': 'Nome deve ter no mínimo {#limit} caracteres',
      'string.max': 'Nome deve ter no máximo {#limit} caracteres',
      'any.required': 'Nome é obrigatório'
    }),

  login: Joi.string()
    .required()
    .min(MIN_LOGIN_LENGTH)
    .max(MAX_LOGIN_LENGTH)
    .messages({
      'string.empty': 'Login é obrigatório',
      'string.min': 'Login deve ter no mínimo {#limit} caracteres',
      'string.max': 'Login deve ter no máximo {#limit} caracteres',
      'any.required': 'Login é obrigatório'
    }),

  senha: Joi.string()
    .required()
    .min(MIN_PASSWORD_LENGTH)
    .max(MAX_PASSWORD_LENGTH)
    .pattern(new RegExp(`^[a-zA-Z0-9]{${MIN_PASSWORD_LENGTH},${MAX_PASSWORD_LENGTH}}$`))
    .messages({
      'string.empty': 'Senha é obrigatória',
      'string.min': 'Senha deve ter no mínimo {#limit} caracteres',
      'string.max': 'Senha deve ter no máximo {#limit} caracteres',
      'string.pattern.base': 'Senha deve conter apenas letras e números',
      'any.required': 'Senha é obrigatória'
    })
});
