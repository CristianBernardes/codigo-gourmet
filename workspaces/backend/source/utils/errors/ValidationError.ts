import { ERROR_MESSAGES } from '../constants';
import AppError from './AppError';

/**
 * Error class for validation errors
 * Extends AppError with additional validation error details
 */
export class ValidationError extends AppError {
  /**
   * Validation errors for specific fields
   */
  public readonly errors: Record<string, string>;

  /**
   * Create a new ValidationError
   * @param message Error message
   * @param errors Validation errors for specific fields
   */
  constructor(
    message: string = ERROR_MESSAGES.VALIDATION_ERROR,
    errors: Record<string, string> = {}
  ) {
    // Validation errors always use 400 Bad Request status code
    super(message, 400, true);
    this.errors = errors;
  }

  /**
   * Create a ValidationError from a Joi validation error
   * @param joiError Joi validation error
   * @returns ValidationError instance
   */
  static fromJoiError(joiError: any): ValidationError {
    const errors: Record<string, string> = {};
    
    if (joiError && joiError.details && Array.isArray(joiError.details)) {
      joiError.details.forEach((detail: any) => {
        const key = detail.path.join('.');
        errors[key] = detail.message;
      });
    }
    
    return new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR, errors);
  }

  /**
   * Create a ValidationError for a single field
   * @param field Field name
   * @param message Error message for the field
   * @returns ValidationError instance
   */
  static forField(field: string, message: string): ValidationError {
    const errors: Record<string, string> = {};
    errors[field] = message;
    return new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR, errors);
  }
}

export default ValidationError;