import { ERROR_MESSAGES } from '../constants';
import { logger } from '../logger';

/**
 * Base error class for application-specific errors
 * Extends the standard Error class with additional properties
 */
export class AppError extends Error {
  /**
   * HTTP status code to return to the client
   */
  public readonly statusCode: number;

  /**
   * Indicates if this is an operational error (expected error)
   * Operational errors are handled differently from programming errors
   */
  public readonly isOperational: boolean;

  /**
   * Create a new AppError
   * @param message Error message
   * @param statusCode HTTP status code (default: 500)
   * @param isOperational Whether this is an operational error (default: true)
   */
  constructor(
    message: string = ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);

    // Log the error
    this.logError();
  }

  /**
   * Log the error with appropriate level based on status code
   */
  private logError(): void {
    const errorContext = {
      name: this.constructor.name,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      stack: this.stack
    };

    // Log as error for 5xx status codes, warn for others
    if (this.statusCode >= 500) {
      logger.error(`[${this.constructor.name}] ${this.message}`, errorContext);
    } else if (this.statusCode >= 400) {
      logger.warn(`[${this.constructor.name}] ${this.message}`, errorContext);
    } else {
      logger.info(`[${this.constructor.name}] ${this.message}`, errorContext);
    }
  }
}

export default AppError;