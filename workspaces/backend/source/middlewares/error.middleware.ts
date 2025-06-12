import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/errors/AppError';
import ValidationError from '../utils/errors/ValidationError';
import NotFoundError from '../utils/errors/NotFoundError';
import { logger } from '../utils/logger';
import { ERROR_MESSAGES, RESPONSE_STATUS, IS_PRODUCTION } from '../utils/constants';

// Unauthorized error class
export class UnauthorizedError extends AppError {
  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, 401, true);
  }
}

// Forbidden error class
export class ForbiddenError extends AppError {
  constructor(message: string = ERROR_MESSAGES.FORBIDDEN) {
    super(message, 403, true);
  }
}

/**
 * Global error handling middleware
 * Catches all errors and sends appropriate responses
 */
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log detailed error information
  const errorDetails = {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    stack: err.stack,
    name: err.name,
    message: err.message
  };

  // Add additional properties for specific error types
  if (err instanceof AppError) {
    Object.assign(errorDetails, {
      statusCode: err.statusCode,
      isOperational: err.isOperational
    });

    if (err instanceof ValidationError) {
      Object.assign(errorDetails, {
        validationErrors: err.errors
      });
    }
  }

  // If it's a database error, add more details
  if (err.name === 'SequelizeConnectionError' || 
      err.name === 'SequelizeDatabaseError' || 
      err.name === 'KnexTimeoutError' ||
      (err as any).code === 'ECONNREFUSED' ||
      (err as any).errno === 'ECONNREFUSED') {
    Object.assign(errorDetails, {
      dbErrorCode: (err as any).code,
      dbErrorNumber: (err as any).errno,
      sqlState: (err as any).sqlState,
      sqlMessage: (err as any).sqlMessage
    });
  }

  logger.error(`Error handling request: ${err.message}`, errorDetails);

  // Handle AppError instances
  if (err instanceof AppError) {
    // Handle validation errors
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json({
        status: RESPONSE_STATUS.ERROR,
        message: err.message,
        errors: err.errors
      });
    }

    // Handle other operational errors
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: RESPONSE_STATUS.ERROR,
        message: err.message
      });
    }
  }

  // Handle unexpected errors
  return res.status(500).json({
    status: RESPONSE_STATUS.ERROR,
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
  });
};
