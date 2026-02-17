import bcryptjs from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../config/database.js";
import crypto from "crypto";

const SALT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5");
const LOCK_TIME = parseInt(process.env.LOCK_TIME || "900000");

interface TokenPayload {
  userId: string;
  email: string;
}

export class AuthService {
  async register(email: string, password: string, name: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("Email já cadastrado");
    }

    const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return user;
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Credenciais inválidas");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const timeLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new Error(
        `Conta bloqueada. Tente novamente em ${timeLeft} minutos`,
      );
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      const attempts = user.loginAttempts + 1;
      const updateData: any = { loginAttempts: attempts };

      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCK_TIME);
        updateData.loginAttempts = 0;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      throw new Error("Credenciais inválidas");
    }

    if (user.loginAttempts > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: 0, lockedUntil: null },
      });
    }

    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
      refreshToken,
    };
  }

  generateAccessToken(userId: string, email: string): string {
    const payload: TokenPayload = { userId, email };
    const signInOptions: SignOptions = {
      expiresIn: (process.env.JWT_ACCESS_EXPIRATION as string || "15m") as any,
      algorithm: "HS256",
    };

    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, signInOptions);
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(64).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  async refreshAccessToken(refreshToken: string) {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new Error("Refresh token inválido ou expirado");
    }

    const accessToken = this.generateAccessToken(
      storedToken.user.id,
      storedToken.user.email,
    );

    return { accessToken };
  }

  async logout(refreshToken: string) {
    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload;
    } catch (error) {
      throw new Error("Token inválido");
    }
  }
}
