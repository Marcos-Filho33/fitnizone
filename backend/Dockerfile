FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/

RUN npm ci

RUN npx prisma generate --schema=backend/prisma/schema.prisma

COPY backend/ ./backend/

WORKDIR /app/backend

RUN npx tsc -p tsconfig.json
RUN node scripts/copy-fitwill-catalog.mjs

EXPOSE 4000

CMD npx prisma migrate deploy --schema=prisma/schema.prisma && node dist/server.js
