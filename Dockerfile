FROM node:22-slim AS frontend

WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---

FROM node:22-slim

WORKDIR /app

# Install openssl for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npx tsc

# Copy frontend build
COPY --from=frontend /frontend/dist ./public

EXPOSE 47700 47701

CMD ["node", "dist/index.js"]
