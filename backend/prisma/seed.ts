import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { ensureSystemData } from '../src/lib/bootstrap';

const prisma = new PrismaClient();

async function main() {
  await ensureSystemData();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
