import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS, AUTH_RATE_LIMIT_MAX_REQUESTS, SEARCH_RATE_LIMIT_WINDOW_MS, SEARCH_RATE_LIMIT_MAX_REQUESTS } from '../utils/constants';

/**
 * Default rate limiter for general API endpoints
 * Limits to 100 requests per 15 minutes per IP
 */
export const defaultRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: RATE_LIMIT_MAX_REQUESTS, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Muitas requisições, por favor tente novamente mais tarde.'
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      status: 'error',
      message: 'Muitas requisições, por favor tente novamente mais tarde.'
    });
  }
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits to 10 requests per 15 minutes per IP
 * This helps prevent brute force attacks
 */
export const authRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: AUTH_RATE_LIMIT_MAX_REQUESTS, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Muitas tentativas de login, por favor tente novamente mais tarde.'
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      status: 'error',
      message: 'Muitas tentativas de login, por favor tente novamente mais tarde.'
    });
  }
});

/**
 * Rate limiter for search endpoints
 * Limits to 30 requests per minute per IP
 */
export const searchRateLimiter = rateLimit({
  windowMs: SEARCH_RATE_LIMIT_WINDOW_MS, // 1 minute
  max: SEARCH_RATE_LIMIT_MAX_REQUESTS, // limit each IP to 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Muitas buscas, por favor tente novamente mais tarde.'
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      status: 'error',
      message: 'Muitas buscas, por favor tente novamente mais tarde.'
    });
  }
});
