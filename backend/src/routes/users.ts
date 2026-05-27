import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { env } from '../lib/env';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest, requireRole } from '../middleware/auth';
import { csrfProtection } from '../middleware/csrf';

const usersRouter = Router();

usersRouter.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      trainerRelationships: {
        include: { trainer: { select: { id: true, name: true, email: true } } }
      }
    }
  });

  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  const { password, resetTokenHash, resetTokenExpiresAt, ...safeUser } = user;
  res.json(safeUser);
});

usersRouter.get('/', authenticateToken, requireRole(['ADMIN']), async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });

  res.json(users);
});

usersRouter.post('/', authenticateToken, requireRole(['ADMIN']), csrfProtection, async (req, res) => {
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['STUDENT', 'TRAINER', 'ADMIN']).default('STUDENT')
  });

  try {
    const data = schema.parse(req.body);
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
        role: data.role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message });
    }

    return res.status(500).json({ message: 'Erro ao criar usuário.' });
  }
});

usersRouter.patch('/:id', authenticateToken, csrfProtection, async (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    name: z.string().optional(),
    role: z.enum(['STUDENT', 'TRAINER', 'ADMIN']).optional(),
    isActive: z.boolean().optional()
  });

  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const data = schema.parse(req.body);

    if (req.user?.id !== id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Você não pode editar outro usuário.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message });
    }

    return res.status(500).json({ message: 'Erro ao atualizar usuário.' });
  }
});

usersRouter.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) {
    return res.status(400).json({ message: 'ID inválido.' });
  }

  await prisma.user.delete({ where: { id } });
  res.json({ message: 'Usuário removido com sucesso.' });
});

usersRouter.post('/relationships', authenticateToken, requireRole(['ADMIN', 'TRAINER']), csrfProtection, async (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    trainerId: z.string(),
    studentId: z.string()
  });

  try {
    const data = schema.parse(req.body);
    const relationship = await prisma.trainerRelationship.create({
      data: {
        trainerId: data.trainerId,
        studentId: data.studentId
      }
    });

    res.status(201).json(relationship);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message });
    }

    return res.status(500).json({ message: 'Erro ao criar relacionamento.' });
  }
});

usersRouter.get('/relationships', authenticateToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  const relationships = await prisma.trainerRelationship.findMany({
    where: req.user.role === 'ADMIN' ? {} : { trainerId: req.user.id },
    include: {
      student: { select: { id: true, name: true, email: true } },
      trainer: { select: { id: true, name: true, email: true } }
    }
  });

  res.json(relationships);
});

export default usersRouter;
