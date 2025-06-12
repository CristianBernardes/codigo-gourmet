import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import ValidationError from '../utils/errors/ValidationError';

/**
 * Middleware factory for validating request data against a Joi schema
 * @param schema The Joi schema to validate against
 * @param property The request property to validate ('body', 'query', 'params')
 * @returns A middleware function that validates the specified request property
 */
export const validate = (schema: Schema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (!error) {
      // Handle the validated and sanitized value
      if (property === 'query') {
        // For query parameters, we need to update the existing object
        // since req.query is a getter-only property
        Object.keys(req.query).forEach(key => {
          delete req.query[key];
        });
        Object.assign(req.query, value);
      } else {
        // For other properties, we can directly replace them
        req[property] = value;
      }
      return next();
    }

    // Format validation errors
    const errors: Record<string, string> = {};
    error.details.forEach((detail) => {
      const key = detail.path.join('.');
      errors[key] = detail.message;
    });

    // Pass the validation error to the next middleware
    return next(new ValidationError('Erro de validação', errors));
  };
};

/**
 * Middleware for validating request body
 * @param schema The Joi schema to validate against
 */
export const validateBody = (schema: Schema) => validate(schema, 'body');

/**
 * Middleware for validating query parameters
 * @param schema The Joi schema to validate against
 */
export const validateQuery = (schema: Schema) => validate(schema, 'query');

/**
 * Middleware for validating URL parameters
 * @param schema The Joi schema to validate against
 */
export const validateParams = (schema: Schema) => validate(schema, 'params');
