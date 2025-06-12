import { Response } from 'express';
import { RESPONSE_STATUS } from './constants';

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  status: string;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
  meta?: {
    page?: number;
    pageSize?: number;
    totalItems?: number;
    totalPages?: number;
  };
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Response utility functions for standardizing API responses
 */
export class ResponseUtil {
  /**
   * Send a success response
   * @param res Express response object
   * @param data Response data
   * @param message Success message
   * @param statusCode HTTP status code (default: 200)
   * @param meta Pagination metadata
   */
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200,
    meta?: PaginationMeta
  ): Response {
    const response: ApiResponse<T> = {
      status: RESPONSE_STATUS.SUCCESS
    };

    if (message) {
      response.message = message;
    }

    if (data !== undefined) {
      response.data = data;
    }

    if (meta) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send an error response
   * @param res Express response object
   * @param message Error message
   * @param statusCode HTTP status code (default: 500)
   * @param errors Validation errors
   */
  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errors?: Record<string, string>
  ): Response {
    const response: ApiResponse = {
      status: RESPONSE_STATUS.ERROR,
      message
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send a created response (201 Created)
   * @param res Express response object
   * @param data Created resource data
   * @param message Success message
   */
  static created<T>(
    res: Response,
    data: T,
    message?: string
  ): Response {
    return ResponseUtil.success(res, data, message, 201);
  }

  /**
   * Send a no content response (204 No Content)
   * @param res Express response object
   */
  static noContent(res: Response): Response {
    return res.status(204).end();
  }

  /**
   * Send a paginated response
   * @param res Express response object
   * @param data Response data (array of items)
   * @param page Current page number
   * @param pageSize Page size
   * @param totalItems Total number of items
   * @param message Success message
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    pageSize: number,
    totalItems: number,
    message?: string
  ): Response {
    const totalPages = Math.ceil(totalItems / pageSize);
    
    const meta: PaginationMeta = {
      page,
      pageSize,
      totalItems,
      totalPages
    };

    return ResponseUtil.success(res, data, message, 200, meta);
  }
}

export default ResponseUtil;