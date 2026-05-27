# FITZONE SYSTEM

Plataforma fitness SaaS completa para gestão de treinos, dietas, cálculo nutricional, progresso e dashboard inteligente.

## Visão Geral

- Frontend Next.js 15 + React + Tailwind + Shadcn/UI
- Backend Express + TypeScript + Prisma + PostgreSQL
- Autenticação JWT + Refresh Token + Bcrypt
- Rotas protegidas, rate limiting, Helmet, CORS e validação
- Dashboard interativo com Recharts e métricas reais

## Instalação

1. Clone o repositório
2. Instale as dependências

```bash
npm install
```

3. Configure variáveis de ambiente

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

4. Suba o banco PostgreSQL e gere o Prisma

```bash
docker compose up -d postgres
npm run seed --workspace backend
```

5. Rode em desenvolvimento

```bash
npm run dev
```

## Acesso administrativo

- Admin padrao: `admin@fitzone.com.br`
- Senha padrao: `Admin@123`

O backend garante esse acesso automaticamente ao iniciar e tambem atualiza o catalogo base de exercicios e alimentos.

## Deploy

- Frontend: Vercel
- Backend: Railway ou Render
- Banco: PostgreSQL gerenciado

Use os arquivos `Dockerfile`, `render.yaml` e `vercel.json` para deploy.

## API

Documentação disponível em `docs/api.md`.
