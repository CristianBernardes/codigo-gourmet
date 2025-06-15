import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../utils/constants';

export interface JwtPayload {
  id: number;
  login: string;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};

export default {
  secret: JWT_SECRET,
  expiresIn: JWT_EXPIRES_IN,
  generateToken,
  verifyToken,
};
