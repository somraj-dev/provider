# ============================================
# AxioVital Backend Dockerfile
# Multi-stage build for NestJS
# ============================================

# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY apps/backend/package.json apps/backend/package-lock.json* ./
RUN npm ci

# Stage 2: Build the application
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/backend/ ./
RUN npm run build

# Stage 3: Production image
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER nestjs
EXPOSE 4000

CMD ["node", "dist/main.js"]
