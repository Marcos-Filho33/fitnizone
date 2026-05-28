import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import fs from 'node:fs';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import workoutsRouter from './routes/workouts';
import exercisesRouter from './routes/exercises';
import dietsRouter from './routes/diets';
import foodsRouter from './routes/foods';
import progressRouter from './routes/progress';
import uploadsRouter from './routes/uploads';
import { env } from './lib/env';
import { ensureSystemData } from './lib/bootstrap';
import { prisma } from './lib/prisma';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

const uploadDir = path.resolve(env.uploadPath);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

app.get('/', (_req, res) => {
  res.json({ status: 'running', service: 'fitzone-backend', version: '1.0.0' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'fitzone-backend', timestamp: new Date().toISOString() });
});

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/workouts', workoutsRouter);
app.use('/exercises', exercisesRouter);
app.use('/diets', dietsRouter);
app.use('/foods', foodsRouter);
app.use('/progress', progressRouter);
app.use('/uploads', uploadsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Erro interno do servidor.' });
});

const server = app.listen(env.port, () => {
  console.log(`FITZONE backend rodando na porta ${env.port}`);
});

async function initializeDatabase() {
  try {
    await prisma.$connect();
    console.log('Database connected');
  } catch (error) {
    console.warn('Warning: Database not available, some features will be disabled:', (error as Error).message);
    return;
  }

  try {
    await prisma.$executeRawUnsafe('SELECT 1');
  } catch {
    console.warn('Warning: Database query failed');
    return;
  }

  try {
    await ensureSystemData();
    console.log('System data initialized');
  } catch (error) {
    console.warn('Warning: Failed to initialize system data:', (error as Error).message);
  }
}

initializeDatabase();

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  server.close(() => process.exit(0));
});
