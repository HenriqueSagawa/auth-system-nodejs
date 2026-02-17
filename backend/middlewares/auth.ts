import { type Request, type Response, type NextFunction } from 'express';
import { AuthService } from '../services/authService.js';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

const authService = new AuthService();

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const payload = authService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};