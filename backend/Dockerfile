FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/
RUN npm --prefix backend install --no-package-lock
RUN npm --prefix backend run prisma:generate
COPY backend/ ./backend/
WORKDIR /app/backend
RUN npm run build
EXPOSE 4000
CMD node dist/server.js
