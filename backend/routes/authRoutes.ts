import { Router } from 'express';
import { AuthService } from '../services/authService.js';
import { authenticateToken, type AuthRequest } from '../middlewares/auth.js';
import { loginLimiter } from '../middlewares/rateLimiter.js';
import {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} from '../middlewares/validator.js';

const router = Router();
const authService = new AuthService();

router.post(
  '/register',
  validateRegister,
  handleValidationErrors,
  async (req: any, res: any) => {
    try {
      const { email, password, name } = req.body;
      const user = await authService.register(email, password, name);
      res.status(201).json({ message: 'Usuário criado com sucesso', user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.post(
  '/login',
  loginLimiter,
  validateLogin,
  handleValidationErrors,
  async (req: any, res: any) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
);

router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token não fornecido' });
    }

    const result = await authService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie('refreshToken');
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

export default router;