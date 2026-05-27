import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../lib/env';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { csrfProtection, generateCsrfToken } from '../middleware/csrf';

const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const resetRequestSchema = z.object({
  email: z.string().email()
});

const resetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
  password: z.string().min(6)
});

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax' as const,
  path: '/'
};

const csrfCookieOptions = {
  httpOnly: false,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax' as const,
  path: '/'
};

function signAccessToken(user: { id: string; email: string; role: string }) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.jwtSecret, {
    expiresIn: '15m'
  });
}

function signRefreshToken(user: { id: string; email: string; role: string }) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role, type: 'refresh' }, env.refreshSecret, {
    expiresIn: '7d'
  });
}

function setTokens(res: any, user: { id: string; email: string; role: string }) {
  const csrfToken = generateCsrfToken();
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  res.cookie('refreshToken', refreshToken, cookieOptions);
  res.cookie('csrfToken', csrfToken, csrfCookieOptions);

  return { accessToken, csrfToken };
}

authRouter.get('/csrf', (_req, res) => {
  const csrfToken = generateCsrfToken();
  res.cookie('csrfToken', csrfToken, csrfCookieOptions);
  res.json({ csrfToken });
});

authRouter.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(409).json({ message: 'E-mail já cadastrado.' });
    }

    const password = await bcrypt.hash(data.password, env.bcryptRounds);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password,
        role: 'STUDENT'
      }
    });

    const tokens = setTokens(res, { id: user.id, email: user.email, role: user.role });

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken: tokens.accessToken,
      csrfToken: tokens.csrfToken
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message });
    }

    return res.status(500).json({ message: 'Erro ao registrar usuário.' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const tokens = setTokens(res, { id: user.id, email: user.email, role: user.role });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken: tokens.accessToken,
      csrfToken: tokens.csrfToken
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message });
    }

    return res.status(500).json({ message: 'Erro ao autenticar usuário.' });
  }
});

authRouter.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      age: true,
      weight: true,
      height: true,
      goal: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  res.json(user);
});

authRouter.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token ausente.' });
  }

  try {
    const payload = jwt.verify(refreshToken, env.refreshSecret) as { sub: string; email: string; role: string };
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Sessão inválida.' });
    }

    const tokens = setTokens(res, { id: user.id, email: user.email, role: user.role });

    res.json({
      accessToken: tokens.accessToken,
      csrfToken: tokens.csrfToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch {
    res.clearCookie('refreshToken');
    return res.status(401).json({ message: 'Refresh token inválido.' });
  }
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('refreshToken');
  res.clearCookie('csrfToken');
  res.json({ message: 'Logout realizado com sucesso.' });
});

authRouter.post('/forgot-password', async (req, res) => {
  try {
    const data = resetRequestSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return res.status(200).json({ message: 'Se o e-mail existir, enviaremos instruções.' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60)
      }
    });

    return res.json({
      message: 'Token de redefinição gerado com sucesso.',
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message });
    }

    return res.status(500).json({ message: 'Erro ao solicitar redefinição.' });
  }
});

authRouter.post('/reset-password', async (req, res) => {
  try {
    const data = resetSchema.parse(req.body);
    const tokenHash = crypto.createHash('sha256').update(data.token).digest('hex');
    const user = await prisma.user.findFirst({
      where: {
        email: data.email,
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }

    const hashedPassword = await bcrypt.hash(data.password, env.bcryptRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetTokenHash: null,
        resetTokenExpiresAt: null
      }
    });

    res.json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message });
    }

    return res.status(500).json({ message: 'Erro ao redefinir senha.' });
  }
});

authRouter.patch('/profile', authenticateToken, csrfProtection, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  const schema = z.object({
    name: z.string().optional(),
    goal: z.string().optional(),
    bio: z.string().optional(),
    age: z.number().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
    avatarUrl: z.string().optional()
  });

  try {
    const data = schema.parse(req.body);
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        age: true,
        weight: true,
        height: true,
        goal: true,
        bio: true,
        avatarUrl: true
      }
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message });
    }

    return res.status(500).json({ message: 'Erro ao atualizar perfil.' });
  }
});

export default authRouter;
