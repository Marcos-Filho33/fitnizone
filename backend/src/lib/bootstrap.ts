import bcrypt from 'bcryptjs';
import { exerciseCatalog, foodCatalog, defaultAdminAccount, ExerciseCatalogItem, FoodCatalogItem } from '../data/catalog';
import { env } from './env';
import { prisma } from './prisma';

async function upsertFoodByName(food: FoodCatalogItem) {
  const existing = await prisma.food.findFirst({
    where: { name: food.name },
    orderBy: { createdAt: 'asc' }
  });

  if (existing) {
    return prisma.food.update({
      where: { id: existing.id },
      data: food
    });
  }

  return prisma.food.create({ data: food });
}

async function upsertExerciseByName(exercise: ExerciseCatalogItem) {
  const existing = await prisma.exercise.findFirst({
    where: { name: exercise.name },
    orderBy: { createdAt: 'asc' }
  });

  if (existing) {
    return prisma.exercise.update({
      where: { id: existing.id },
      data: exercise
    });
  }

  return prisma.exercise.create({ data: exercise });
}

export async function ensureSystemData() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: env.systemAdminEmail }
  });

  if (!existingAdmin) {
    const password = await bcrypt.hash(env.systemAdminPassword, env.bcryptRounds);

    await prisma.user.create({
      data: {
        name: defaultAdminAccount.name,
        email: env.systemAdminEmail,
        password,
        role: 'ADMIN'
      }
    });
  } else {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        name: defaultAdminAccount.name,
        role: 'ADMIN',
        isActive: true
      }
    });
  }

  for (const food of foodCatalog) {
    await upsertFoodByName(food);
  }

  for (const exercise of exerciseCatalog) {
    await upsertExerciseByName(exercise);
  }
}
