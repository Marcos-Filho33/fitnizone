import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { csrfProtection } from '../middleware/csrf';

const workoutsRouter = Router();

const workoutSchema = z.object({
  title: z.string().min(3),
  goal: z.string().optional(),
  duration: z.number().min(5),
  difficulty: z.enum(['INICIANTE', 'INTERMEDIARIO', 'AVANCADO']),
  category: z.string().optional(),
  exercises: z.array(
    z.object({
      exerciseId: z.string().min(1),
      sets: z.number().min(1),
      reps: z.string().min(1),
      restSeconds: z.number().min(0),
      notes: z.string().optional()
    })
  ).min(1)
});

workoutsRouter.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  const workouts = await prisma.workout.findMany({
    where: { ownerId: req.user.id },
    include: { workoutExercises: { include: { exercise: true } } },
    orderBy: { createdAt: 'desc' }
  });

  res.json(workouts);
});

workoutsRouter.post('/', authenticateToken, csrfProtection, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const data = workoutSchema.parse(req.body);
    const workout = await prisma.workout.create({
      data: {
        title: data.title,
        goal: data.goal || 'Manutenção',
        duration: data.duration,
        difficulty: data.difficulty,
        category: data.category || 'General',
        ownerId: req.user.id,
        workoutExercises: {
          create: data.exercises.map((exercise) => ({
            exerciseId: exercise.exerciseId,
            sets: exercise.sets,
            reps: exercise.reps,
            restSeconds: exercise.restSeconds,
            notes: exercise.notes || ''
          }))
        }
      },
      include: { workoutExercises: { include: { exercise: true } } }
    });

    res.status(201).json(workout);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message });
    }

    return res.status(500).json({ message: 'Erro ao criar treino.' });
  }
});

workoutsRouter.put('/:id', authenticateToken, csrfProtection, async (req: AuthenticatedRequest, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const workout = await prisma.workout.findUnique({ where: { id } });
    if (!workout || workout.ownerId !== req.user?.id) {
      return res.status(403).json({ message: 'Treino não encontrado ou sem permissão.' });
    }

    const data = workoutSchema.parse(req.body);
    await prisma.$transaction(async (transaction) => {
      await transaction.workout.update({
        where: { id },
        data: {
          title: data.title,
          goal: data.goal || 'Manutenção',
          duration: data.duration,
          difficulty: data.difficulty,
          category: data.category || 'General'
        }
      });

      await transaction.workoutExercise.deleteMany({ where: { workoutId: id } });
      await transaction.workoutExercise.createMany({
        data: data.exercises.map((exercise) => ({
          workoutId: id,
          exerciseId: exercise.exerciseId,
          sets: exercise.sets,
          reps: exercise.reps,
          restSeconds: exercise.restSeconds,
          notes: exercise.notes || ''
        }))
      });
    });

    const updated = await prisma.workout.findUnique({
      where: { id },
      include: { workoutExercises: { include: { exercise: true } } }
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message });
    }

    return res.status(500).json({ message: 'Erro ao atualizar treino.' });
  }
});

workoutsRouter.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) {
    return res.status(400).json({ message: 'ID inválido.' });
  }

  const workout = await prisma.workout.findUnique({ where: { id } });
  if (!workout || workout.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Treino não encontrado ou sem permissão.' });
  }

  await prisma.workoutExercise.deleteMany({ where: { workoutId: id } });
  await prisma.workout.delete({ where: { id } });

  res.json({ message: 'Treino removido com sucesso.' });
});

workoutsRouter.post('/:id/favorite', authenticateToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) {
    return res.status(400).json({ message: 'ID inválido.' });
  }

  const workout = await prisma.workout.findUnique({ where: { id } });
  if (!workout || workout.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Treino não encontrado ou sem permissão.' });
  }

  const updated = await prisma.workout.update({
    where: { id },
    data: { favorite: !workout.favorite }
  });

  res.json(updated);
});

export default workoutsRouter;
