import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireRole } from '../middleware/auth';
import { csrfProtection } from '../middleware/csrf';
import { listFitwillExercises, normalizeSearchValue } from '../data/fitwill-library';

const exercisesRouter = Router();

const exerciseSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  muscleGroup: z.enum(['PEITO', 'COSTAS', 'PERNAS', 'OMBROS', 'BICEPS', 'TRICEPS', 'ABDOMEN']),
  difficulty: z.enum(['INICIANTE', 'INTERMEDIARIO', 'AVANCADO']),
  instructions: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional()
});

exercisesRouter.get('/', async (req, res) => {
  const query = typeof req.query.query === 'string' ? req.query.query : undefined;
  const muscleGroup = typeof req.query.muscleGroup === 'string' ? req.query.muscleGroup : undefined;
  const difficulty = typeof req.query.difficulty === 'string' ? req.query.difficulty : undefined;

  const exercises = await prisma.exercise.findMany({
    where: {
      AND: [
        muscleGroup ? { muscleGroup: muscleGroup as any } : {},
        difficulty ? { difficulty: difficulty as any } : {}
      ]
    },
    distinct: ['name'],
    orderBy: [{ name: 'asc' }, { createdAt: 'asc' }]
  });

  if (!query) {
    return res.json(exercises);
  }

  const normalizedQuery = normalizeSearchValue(query);
  const filteredExercises = exercises.filter((exercise) =>
    [exercise.name, exercise.description, exercise.instructions ?? ''].some((value) => normalizeSearchValue(value).includes(normalizedQuery))
  );

  res.json(filteredExercises);
});

exercisesRouter.get('/library', async (req, res) => {
  const query = typeof req.query.query === 'string' ? req.query.query : undefined;
  const bodyPart = typeof req.query.bodyPart === 'string' ? req.query.bodyPart : undefined;
  const primaryMuscle = typeof req.query.primaryMuscle === 'string' ? req.query.primaryMuscle : undefined;
  const equipment = typeof req.query.equipment === 'string' ? req.query.equipment : undefined;
  const page = typeof req.query.page === 'string' ? Number(req.query.page) : undefined;
  const pageSize = typeof req.query.pageSize === 'string' ? Number(req.query.pageSize) : undefined;

  const response = listFitwillExercises({
    query,
    bodyPart,
    primaryMuscle,
    equipment,
    page: Number.isFinite(page) ? page : undefined,
    pageSize: Number.isFinite(pageSize) ? pageSize : undefined
  });

  res.json(response);
});

exercisesRouter.post('/', authenticateToken, requireRole(['ADMIN', 'TRAINER']), csrfProtection, async (req, res) => {
  try {
    const data = exerciseSchema.parse(req.body);
    const existing = await prisma.exercise.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: 'insensitive'
        }
      }
    });

    if (existing) {
      return res.status(409).json({ message: 'Já existe um exercício com esse nome.' });
    }

    const exercise = await prisma.exercise.create({ data });
    res.status(201).json(exercise);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message });
    }

    return res.status(500).json({ message: 'Erro ao criar exercício.' });
  }
});

exercisesRouter.put('/:id', authenticateToken, requireRole(['ADMIN', 'TRAINER']), csrfProtection, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const data = exerciseSchema.parse(req.body);
    const duplicate = await prisma.exercise.findFirst({
      where: {
        id: { not: id },
        name: {
          equals: data.name,
          mode: 'insensitive'
        }
      }
    });

    if (duplicate) {
      return res.status(409).json({ message: 'Já existe um exercício com esse nome.' });
    }

    const exercise = await prisma.exercise.update({ where: { id }, data });
    res.json(exercise);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message });
    }

    return res.status(500).json({ message: 'Erro ao atualizar exercício.' });
  }
});

exercisesRouter.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) {
    return res.status(400).json({ message: 'ID inválido.' });
  }

  await prisma.exercise.delete({ where: { id } });
  res.json({ message: 'Exercício removido.' });
});

export default exercisesRouter;
