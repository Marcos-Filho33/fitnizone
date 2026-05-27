import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
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

const app = express();
const allowedOrigins = new Set([
  env.frontendUrl,
  'https://marcos-filho33.github.io',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002'
]);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, origin || env.frontendUrl || 'https://marcos-filho33.github.io');
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'fitzone-backend' });
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

async function start() {
  await ensureSystemData();

  app.listen(env.port, () => {
    console.log(`FITZONE backend rodando na porta ${env.port}`);
  });
}

start().catch((error) => {
  console.error('Falha ao iniciar o FITZONE backend:', error);
  process.exit(1);
});
