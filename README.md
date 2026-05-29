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
npm --prefix backend run seed
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

- Frontend: GitHub Pages (exportação estática)
- Backend: Railway ou Render
- Banco: PostgreSQL gerenciado

Para GitHub Pages, o frontend agora gera uma build estática em `frontend/out/`.
Use o workflow em `.github/workflows/deploy-pages.yml` para publicar automaticamente.

Configure o backend em `NEXT_PUBLIC_API_URL` antes do deploy do frontend.

## API

Documentação disponível em `docs/api.md`.
