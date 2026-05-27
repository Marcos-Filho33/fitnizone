import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { csrfProtection } from '../middleware/csrf';

const progressRouter = Router();

const progressSchema = z.object({
  date: z.string(),
  weight: z.number().min(1),
  bodyFat: z.number().min(0).optional(),
  notes: z.string().optional()
});

const measurementsSchema = z.object({
  date: z.string(),
  weight: z.number().min(1),
  chest: z.number().optional(),
  waist: z.number().optional(),
  hips: z.number().optional(),
  neck: z.number().optional(),
  arm: z.number().optional(),
  thigh: z.number().optional(),
  notes: z.string().optional()
});

progressRouter.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  const [progress, measurements] = await Promise.all([
    prisma.progress.findMany({ where: { userId: req.user.id }, orderBy: { date: 'desc' } }),
    prisma.bodyMeasurement.findMany({ where: { userId: req.user.id }, orderBy: { date: 'desc' } })
  ]);

  res.json({ progress, measurements });
});

progressRouter.post('/', authenticateToken, csrfProtection, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const data = progressSchema.parse(req.body);
    const entry = await prisma.progress.create({
      data: {
        userId: req.user.id,
        date: new Date(data.date),
        weight: data.weight,
        bodyFat: data.bodyFat || 0,
        notes: data.notes || ''
      }
    });

    res.status(201).json(entry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message });
    }

    return res.status(500).json({ message: 'Erro ao registrar progresso.' });
  }
});

progressRouter.post('/measurements', authenticateToken, csrfProtection, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const data = measurementsSchema.parse(req.body);
    const entry = await prisma.bodyMeasurement.create({
      data: {
        userId: req.user.id,
        date: new Date(data.date),
        weight: data.weight,
        chest: data.chest || 0,
        waist: data.waist || 0,
        hips: data.hips || 0,
        neck: data.neck || 0,
        arm: data.arm || 0,
        thigh: data.thigh || 0,
        notes: data.notes || ''
      }
    });

    res.status(201).json(entry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message });
    }

    return res.status(500).json({ message: 'Erro ao registrar medidas.' });
  }
});

export default progressRouter;
