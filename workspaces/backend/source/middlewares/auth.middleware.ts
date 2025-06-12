import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';

// Extend Express Request to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        login: string;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using JWT
 * Verifies the token from the Authorization header and adds user info to the request
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }
    
    // Check if it's a Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Token mal formatado' });
    }
    
    const token = parts[1];
    
    // Verify the token
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
    
    // Add user info to the request
    req.user = {
      id: payload.id,
      login: payload.login
    };
    
    // Continue to the next middleware or route handler
    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao autenticar usuário' });
  }
};

/**
 * Optional authentication middleware
 * Tries to authenticate the user but continues even if authentication fails
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }
    
    const token = parts[1];
    const payload = verifyToken(token);
    
    if (payload) {
      req.user = {
        id: payload.id,
        login: payload.login
      };
    }
    
    return next();
  } catch (error) {
    return next();
  }
};