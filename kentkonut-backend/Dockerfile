# Multi-stage Docker build for kentkonut-backend production
# Includes automatic admin user creation and latest fixes

# Stage 1: Dependencies
FROM node:20-slim AS deps
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy package files for dependency installation
COPY kentkonut-backend/package.json kentkonut-backend/package-lock.json* ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --include=optional

# Stage 2: Builder
FROM node:18-slim AS builder
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./

# Copy configuration files
COPY kentkonut-backend/package.json kentkonut-backend/package-lock.json* ./
COPY kentkonut-backend/tailwind.config.ts ./
COPY kentkonut-backend/postcss.config.js ./
COPY kentkonut-backend/next.config.js ./
COPY kentkonut-backend/tsconfig.json ./
COPY kentkonut-backend/prisma ./prisma

# Copy source code
COPY kentkonut-backend/ . 
COPY shared ./shared

# Install dependencies for shared types
WORKDIR /app/shared/types
RUN npm ci
WORKDIR /app

# Set build environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"

# Install prisma
RUN npm install prisma

# Install tsx globally
RUN npm install -g tsx

# Generate Prisma client
RUN npx prisma generate



# Build the application
RUN npm run build

# Stage 3: Production Runner
FROM node:18-slim AS runner
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=${PORT:-3021}
# Ensure npm/npx can run under non-root user
ENV HOME=/home/nextjs
ENV NPM_CONFIG_CACHE=/app/.npm

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application from builder stage
COPY --from=builder /app/public ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma files and admin creation scripts
COPY --from=builder /app/prisma ./prisma
# create-admin.js kaldırıldı; admin seed prisma/admin-user-seed.js ile çalıştırılacak

# Copy package files and install production dependencies needed for startup scripts
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./
RUN npm ci --omit=dev --include=optional && npm cache clean --force

# Copy startup script
COPY kentkonut-backend/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Prepare directories and permissions for npm cache and home
RUN mkdir -p /app/.npm && chown -R nextjs:nodejs /app && mkdir -p /home/nextjs && chown -R nextjs:nodejs /home/nextjs

# Switch to non-root user
USER nextjs

# Expose the application port
EXPOSE 3021

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:$PORT/api/health || exit 1

# Start the application
CMD ["/app/start.sh"]
