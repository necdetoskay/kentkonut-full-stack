# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Build-time API URL'leri için ARG ve ENV tanımları
ARG VITE_API_BASE_URL
ARG VITE_API_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_BASE_PATH="/"

COPY kentkonut-frontend/package*.json ./

RUN npm install --legacy-peer-deps

COPY kentkonut-frontend/ . 
COPY shared ./shared

RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY kentkonut-frontend/nginx.conf /etc/nginx/nginx.conf

EXPOSE 3020

# Healthcheck for nginx
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3020/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
