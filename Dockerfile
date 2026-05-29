FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/
RUN npm ci
RUN npx prisma generate --schema=backend/prisma/schema.prisma
COPY backend/ ./backend/
WORKDIR /app/backend
RUN npm run build
EXPOSE 4000
CMD node dist/server.js
