# Dockerfile for kentkonut-backend
FROM node:18-alpine AS base

# Install OpenSSL and other dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY kentkonut-backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy package files and install all dependencies
COPY kentkonut-backend/package*.json ./
RUN npm ci

# Copy source code
COPY kentkonut-backend/ .

# Generate Prisma client with binary targets for Alpine
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl
RUN npx prisma generate

# Build application (skip during build to avoid database connection issues)
ENV NEXT_TELEMETRY_DISABLED 1
ENV SKIP_BUILD_STATIC_GENERATION=true
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create system user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=deps /app/node_modules ./node_modules

# Create media directories with proper permissions
RUN mkdir -p /app/public/uploads /app/public/media /app/public/banners \
    /app/public/haberler /app/public/hafriyat /app/public/kurumsal \
    /app/public/services /app/public/proje && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3010

ENV PORT 3010
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3010/api/health || exit 1

CMD ["node", "server.js"]
