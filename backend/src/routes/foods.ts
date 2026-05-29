import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireRole } from '../middleware/auth';
import { csrfProtection } from '../middleware/csrf';

const foodsRouter = Router();

function normalizeSearchValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

const foodSchema = z.object({
  name: z.string().min(2),
  caloriesPer100g: z.number().min(0),
  proteinPer100g: z.number().min(0),
  carbsPer100g: z.number().min(0),
  fatPer100g: z.number().min(0),
  category: z.string().optional(),
  source: z.string().optional()
});

foodsRouter.get('/', async (req, res) => {
  const query = req.query.query as string | undefined;
  const category = req.query.category as string | undefined;
  const foods = await prisma.food.findMany({
    where: {
      AND: [
        category
          ? {
              category: {
                equals: category,
                mode: 'insensitive'
              }
            }
          : {}
      ]
    },
    distinct: ['name'],
    orderBy: [{ name: 'asc' }, { createdAt: 'asc' }]
  });

  if (!query) {
    return res.json(foods);
  }

  const normalizedQuery = normalizeSearchValue(query);
  const filteredFoods = foods.filter((food) =>
    [food.name, food.category ?? '', food.source ?? ''].some((value) => normalizeSearchValue(value).includes(normalizedQuery))
  );

  res.json(filteredFoods);
});

foodsRouter.post('/', authenticateToken, requireRole(['ADMIN', 'TRAINER']), csrfProtection, async (req, res) => {
  try {
    const data = foodSchema.parse(req.body);
    const existing = await prisma.food.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: 'insensitive'
        }
      }
    });

    if (existing) {
      return res.status(409).json({ message: 'Já existe um alimento com esse nome.' });
    }

    const food = await prisma.food.create({ data });
    res.status(201).json(food);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message });
    }

    return res.status(500).json({ message: 'Erro ao criar alimento.' });
  }
});

foodsRouter.put('/:id', authenticateToken, requireRole(['ADMIN', 'TRAINER']), csrfProtection, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const data = foodSchema.parse(req.body);
    const duplicate = await prisma.food.findFirst({
      where: {
        id: { not: id },
        name: {
          equals: data.name,
          mode: 'insensitive'
        }
      }
    });

    if (duplicate) {
      return res.status(409).json({ message: 'Já existe um alimento com esse nome.' });
    }

    const food = await prisma.food.update({ where: { id }, data });
    res.json(food);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0]?.message });
    }

    return res.status(500).json({ message: 'Erro ao atualizar alimento.' });
  }
});

foodsRouter.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) {
    return res.status(400).json({ message: 'ID inválido.' });
  }

  const existing = await prisma.food.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Alimento não encontrado.' });
  }

  await prisma.food.delete({ where: { id } });
  res.json({ message: 'Alimento removido.' });
});

export default foodsRouter;
