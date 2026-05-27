# FITZONE SYSTEM API

## Visão geral

A API REST do FITZONE SYSTEM fornece autenticação, gerenciamento de usuários, treinos, dietas, alimentos, progresso e uploads.

## Autenticação

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

## Recursos principais

- `/users`
- `/exercises`
- `/workouts`
- `/diets`
- `/foods`
- `/progress`
- `/uploads`

## Segurança

- JWT access token em cookie httpOnly
- Refresh token em cookie httpOnly
- Rate limit global
- Helmet, CORS e CSRF

## Exemplo de variáveis

```
DATABASE_URL=postgresql://user:password@localhost:5432/fitzone
JWT_SECRET=replace-me
REFRESH_SECRET=replace-me
FRONTEND_URL=http://localhost:3000
PORT=4000
```

## Deploy

- Backend: Render ou qualquer host Node.js
- Frontend: Vercel ou qualquer ambiente Next.js
- Banco: PostgreSQL
