import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { csrfProtection } from '../middleware/csrf';

const dietsRouter = Router();

const dietSchema = z.object({
  title: z.string().min(3),
  date: z.string(),
  notes: z.string().optional()
});

const mealSchema = z.object({
  name: z.string().min(2),
  foodId: z.string(),
  grams: z.number().min(1),
  timeOfDay: z.enum(['CAFE', 'ALMOCO', 'JANTA', 'LANCHE', 'PRE_TREINO', 'POS_TREINO'])
});

function calculateMacros(food: { proteinPer100g: number; carbsPer100g: number; fatPer100g: number; caloriesPer100g: number }, grams: number) {
  const factor = grams / 100;
  return {
    calories: Number((food.caloriesPer100g * factor).toFixed(2)),
    protein: Number((food.proteinPer100g * factor).toFixed(2)),
    carbs: Number((food.carbsPer100g * factor).toFixed(2)),
    fat: Number((food.fatPer100g * factor).toFixed(2))
  };
}

dietsRouter.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  const diets = await prisma.diet.findMany({
    where: { ownerId: req.user.id },
    include: { meals: { include: { food: true } } },
    orderBy: { date: 'desc' }
  });

  res.json(diets);
});

dietsRouter.post('/', authenticateToken, csrfProtection, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const data = dietSchema.parse(req.body);
    const diet = await prisma.diet.create({
      data: {
        title: data.title,
        date: new Date(data.date),
        notes: data.notes || '',
        ownerId: req.user.id
      }
    });

    res.status(201).json(diet);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message });
    }

    return res.status(500).json({ message: 'Erro ao criar dieta.' });
  }
});

dietsRouter.post('/:id/meals', authenticateToken, csrfProtection, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const data = mealSchema.parse(req.body);
    const diet = await prisma.diet.findUnique({ where: { id } });
    if (!diet || diet.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Dieta não encontrada.' });
    }

    const food = await prisma.food.findUnique({ where: { id: data.foodId } });
    if (!food) {
      return res.status(404).json({ message: 'Alimento não encontrado.' });
    }

    const macros = calculateMacros(food, data.grams);
    const meal = await prisma.meal.create({
      data: {
        dietId: id,
        foodId: data.foodId,
        name: data.name,
        timeOfDay: data.timeOfDay,
        grams: data.grams,
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat
      }
    });

    res.status(201).json(meal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message });
    }

    return res.status(500).json({ message: 'Erro ao adicionar refeição.' });
  }
});

dietsRouter.put('/:id', authenticateToken, csrfProtection, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const data = dietSchema.parse(req.body);
    const diet = await prisma.diet.findUnique({ where: { id } });
    if (!diet || diet.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Dieta não encontrada.' });
    }

    const updated = await prisma.diet.update({
      where: { id },
      data: {
        title: data.title,
        date: new Date(data.date),
        notes: data.notes || ''
      }
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message });
    }

    return res.status(500).json({ message: 'Erro ao atualizar dieta.' });
  }
});

dietsRouter.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) {
    return res.status(400).json({ message: 'ID inválido.' });
  }

  const diet = await prisma.diet.findUnique({ where: { id } });
  if (!diet || diet.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Dieta não encontrada.' });
  }

  await prisma.meal.deleteMany({ where: { dietId: id } });
  await prisma.diet.delete({ where: { id } });

  res.json({ message: 'Dieta removida.' });
});

export default dietsRouter;
