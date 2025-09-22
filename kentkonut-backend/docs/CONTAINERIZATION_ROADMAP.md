# 🐳 KentKonut Full-Stack Containerization Roadmap

**Document Version:** 1.0  
**Created:** January 30, 2025  
**Estimated Duration:** 1-2 days  
**Complexity:** Intermediate  

## 📋 Table of Contents

1. [Prerequisites and Dependencies](#prerequisites-and-dependencies)
2. [Current State Analysis](#current-state-analysis)
3. [Implementation Checklist](#implementation-checklist)
4. [File Structure Overview](#file-structure-overview)
5. [Code Implementations](#code-implementations)
6. [Step-by-Step Migration](#step-by-step-migration)
7. [Verification Procedures](#verification-procedures)
8. [Development Workflow](#development-workflow)
9. [Troubleshooting](#troubleshooting)
10. [Post-Migration Optimization](#post-migration-optimization)

---

## 🔧 Prerequisites and Dependencies

### **System Requirements**
- Docker Engine 20.10+ installed
- Docker Compose 2.0+ installed
- Node.js 18+ (for local development)
- Git (for version control)
- Minimum 4GB RAM available for containers
- 10GB free disk space

### **Current Application Requirements**
- PostgreSQL database with existing data
- Next.js backend application (port 3010)
- Vite React frontend application (port 3000)
- Environment variables configured

### **Pre-Migration Verification**
```bash
# Verify Docker installation
docker --version
docker-compose --version

# Check current application status
curl http://localhost:3010/api/health
curl http://localhost:3000

# Verify database connectivity
docker exec kentkonut-postgres pg_isready -U postgres -d kentkonutdb
```

---

## 🔍 Current State Analysis

### ✅ **Already Containerized**
- **PostgreSQL Database**: Running on port 5432 with persistent volume
- **PgAdmin**: Optional administration tool on port 8080
- **Docker Network**: `kentkonut-network` configured and operational

### 🔄 **Needs Containerization**
- **Backend Application**: Next.js app currently running on host port 3010
- **Frontend Application**: Vite React app currently running on host port 3000
- **Development Environment**: Hot reload and debugging capabilities
- **Production Environment**: Optimized builds and deployment

### 📊 **Data Preservation Requirements**
- PostgreSQL database with existing content, users, and configurations
- Uploaded media files and assets
- Environment configurations and secrets
- Development database seeds and test data

---

## ✅ Implementation Checklist

### **Phase 1: Preparation (30 minutes)**
- [ ] Create backup of existing data
- [ ] Verify current application functionality
- [ ] Create necessary directories and files
- [ ] Update `.gitignore` files
- [ ] Document current environment variables

### **Phase 2: Backend Containerization (45 minutes)**
- [ ] Create `kentkonut-backend/Dockerfile`
- [ ] Create `kentkonut-backend/Dockerfile.dev`
- [ ] Update `kentkonut-backend/.dockerignore`
- [ ] Configure Next.js for containerization
- [ ] Update environment variables for container networking

### **Phase 3: Frontend Containerization (30 minutes)**
- [ ] Create `kentkonut-frontend/Dockerfile`
- [ ] Create `kentkonut-frontend/Dockerfile.dev`
- [ ] Update `kentkonut-frontend/.dockerignore`
- [ ] Configure Vite for container deployment
- [ ] Update API endpoint configurations

### **Phase 4: Docker Compose Configuration (45 minutes)**
- [ ] Update main `docker-compose.yml`
- [ ] Create `docker-compose.dev.yml` for development
- [ ] Create `docker-compose.prod.yml` for production
- [ ] Configure service dependencies and health checks
- [ ] Set up volume mounts for development

### **Phase 5: Scripts and Automation (30 minutes)**
- [ ] Create data backup script
- [ ] Create verification script
- [ ] Create development startup script
- [ ] Create production deployment script
- [ ] Create cleanup and reset scripts

### **Phase 6: Migration and Testing (60 minutes)**
- [ ] Execute data backup
- [ ] Build Docker images
- [ ] Start containerized services
- [ ] Verify data integrity
- [ ] Test all application functionality
- [ ] Validate development workflow

### **Phase 7: Documentation and Cleanup (15 minutes)**
- [ ] Update README files
- [ ] Document new development workflow
- [ ] Clean up temporary files
- [ ] Commit changes to version control

---

## 📁 File Structure Overview

```
kentkonut-full-stack/
├── kentkonut-backend/
│   ├── docs/
│   │   └── CONTAINERIZATION_ROADMAP.md          # This file
│   ├── scripts/
│   │   ├── backup-data.sh                       # Data backup script
│   │   ├── verify-containerized-setup.sh        # Verification script
│   │   ├── start-dev.sh                         # Development startup
│   │   ├── start-prod.sh                        # Production startup
│   │   └── cleanup.sh                           # Cleanup script
│   ├── Dockerfile                               # Production backend image
│   ├── Dockerfile.dev                           # Development backend image
│   ├── .dockerignore                            # Docker ignore rules
│   ├── docker-compose.yml                       # Main compose file
│   ├── docker-compose.dev.yml                   # Development overrides
│   ├── docker-compose.prod.yml                  # Production overrides
│   ├── next.config.js                           # Updated Next.js config
│   └── .env                                     # Updated environment vars
├── kentkonut-frontend/
│   ├── Dockerfile                               # Production frontend image
│   ├── Dockerfile.dev                           # Development frontend image
│   ├── .dockerignore                            # Docker ignore rules
│   ├── nginx.conf                               # Nginx configuration
│   ├── vite.config.ts                           # Updated Vite config
│   └── .env                                     # Updated environment vars
└── backups/                                     # Backup directory (created)
    └── YYYYMMDD_HHMMSS/                         # Timestamped backups
        ├── kentkonutdb_backup.sql               # Database backup
        └── uploads/                             # File uploads backup
```

---

## 💻 Code Implementations

### **Backend Containerization**

#### **Production Dockerfile**
```dockerfile
# kentkonut-backend/Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create system user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=deps /app/node_modules ./node_modules

# Set correct permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3010

ENV PORT 3010
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3010/api/health || exit 1

CMD ["node", "server.js"]
```

#### **Development Dockerfile**
```dockerfile
# kentkonut-backend/Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3010/api/health || exit 1

# Start development server
CMD ["npm", "run", "dev"]
```

#### **Backend .dockerignore**
```
# kentkonut-backend/.dockerignore
node_modules
npm-debug.log
.next
.git
.gitignore
README.md
.env.local
.env.development.local
.env.test.local
.env.production.local
.nyc_output
coverage
.DS_Store
*.log
backups
docs
scripts/*.sh
```

#### **Updated Next.js Configuration**
```javascript
// kentkonut-backend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Configure for container networking
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
  
  // Image optimization for container
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Disable telemetry in containers
  telemetry: false,
}

module.exports = nextConfig
```

### **Frontend Containerization**

#### **Production Dockerfile**
```dockerfile
# kentkonut-frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Add health check
RUN apk add --no-cache curl
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80 || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### **Development Dockerfile**
```dockerfile
# kentkonut-frontend/Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5173 || exit 1

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
```

#### **Nginx Configuration**
```nginx
# kentkonut-frontend/nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    sendfile        on;
    keepalive_timeout  65;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    server {
        listen       80;
        server_name  localhost;
        
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        
        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # API proxy to backend
        location /api/ {
            proxy_pass http://backend:3010;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        # Static assets caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
}
```

#### **Frontend .dockerignore**
```
# kentkonut-frontend/.dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env.local
.env.development.local
.env.test.local
.env.production.local
dist
coverage
.DS_Store
*.log
```

#### **Updated Vite Configuration**
```typescript
// kentkonut-frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3010',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  },
})
```

### **Docker Compose Configurations**

#### **Main Docker Compose**
```yaml
# kentkonut-backend/docker-compose.yml
version: '3.8'

services:
  postgresql:
    image: postgres:15-alpine
    container_name: kentkonut-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: P@ssw0rd
      POSTGRES_DB: kentkonutdb
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=C"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d kentkonutdb"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    networks:
      - kentkonut-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: kentkonut-backend
    environment:
      - DATABASE_URL=postgresql://postgres:P@ssw0rd@postgresql:5432/kentkonutdb
      - NEXTAUTH_URL=http://localhost:3010
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-your-secret-token}
      - NODE_ENV=production
    ports:
      - "3010:3010"
    depends_on:
      postgresql:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - kentkonut-network
    volumes:
      - uploads_data:/app/public/uploads

  frontend:
    build:
      context: ../kentkonut-frontend
      dockerfile: Dockerfile
    container_name: kentkonut-frontend
    environment:
      - VITE_API_URL=http://localhost:3010
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - kentkonut-network

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: kentkonut-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@kentkonut.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "8080:80"
    depends_on:
      - postgresql
    restart: unless-stopped
    networks:
      - kentkonut-network
    profiles:
      - tools

volumes:
  postgres_data:
    driver: local
  uploads_data:
    driver: local

networks:
  kentkonut-network:
    driver: bridge
```

#### **Development Override**
```yaml
# kentkonut-backend/docker-compose.dev.yml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.dev
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:P@ssw0rd@postgresql:5432/kentkonutdb
      - NEXTAUTH_URL=http://localhost:3010
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-dev-secret-token}
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    command: npm run dev

  frontend:
    build:
      context: ../kentkonut-frontend
      dockerfile: Dockerfile.dev
    environment:
      - NODE_ENV=development
      - VITE_API_URL=http://localhost:3010
    volumes:
      - ../kentkonut-frontend:/app
      - /app/node_modules
    ports:
      - "3000:5173"
    command: npm run dev -- --host 0.0.0.0 --port 5173
```

#### **Production Override**
```yaml
# kentkonut-backend/docker-compose.prod.yml
version: '3.8'

services:
  backend:
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:P@ssw0rd@postgresql:5432/kentkonutdb
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  frontend:
    restart: always
    deploy:
      resources:
        limits:
          memory: 128M
        reservations:
          memory: 64M

  postgresql:
    restart: always
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M
```

### **Automation Scripts**

#### **Data Backup Script**
```bash
#!/bin/bash
# kentkonut-backend/scripts/backup-data.sh

set -e

# Configuration
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
CONTAINER_NAME="kentkonut-postgres"
DB_NAME="kentkonutdb"
DB_USER="postgres"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Starting backup process...${NC}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check if PostgreSQL container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}❌ PostgreSQL container is not running!${NC}"
    exit 1
fi

# Backup PostgreSQL data
echo -e "${YELLOW}📊 Backing up PostgreSQL database...${NC}"
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/kentkonutdb_backup.sql"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database backup completed${NC}"
else
    echo -e "${RED}❌ Database backup failed${NC}"
    exit 1
fi

# Backup uploaded files (if directory exists)
if [ -d "public/uploads" ]; then
    echo -e "${YELLOW}📁 Backing up uploaded files...${NC}"
    cp -r public/uploads "$BACKUP_DIR/uploads"
    echo -e "${GREEN}✅ Files backup completed${NC}"
else
    echo -e "${YELLOW}⚠️ No uploads directory found, skipping file backup${NC}"
fi

# Backup environment files
echo -e "${YELLOW}⚙️ Backing up environment configuration...${NC}"
cp .env "$BACKUP_DIR/.env.backup" 2>/dev/null || echo -e "${YELLOW}⚠️ No .env file found${NC}"
cp ../kentkonut-frontend/.env "$BACKUP_DIR/.env.frontend.backup" 2>/dev/null || echo -e "${YELLOW}⚠️ No frontend .env file found${NC}"

# Create backup info file
cat > "$BACKUP_DIR/backup_info.txt" << EOF
Backup Information
==================
Date: $(date)
Database: $DB_NAME
Container: $CONTAINER_NAME
Backup Directory: $BACKUP_DIR

Files Included:
- kentkonutdb_backup.sql (PostgreSQL database dump)
- uploads/ (uploaded files, if exists)
- .env.backup (backend environment variables)
- .env.frontend.backup (frontend environment variables)

Restore Instructions:
1. Start PostgreSQL container
2. Run: docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < kentkonutdb_backup.sql
3. Copy uploads/ back to public/uploads if needed
4. Restore environment files if needed
EOF

echo -e "${GREEN}✅ Backup completed successfully!${NC}"
echo -e "${GREEN}📁 Backup location: $BACKUP_DIR${NC}"
echo -e "${YELLOW}💡 Backup size: $(du -sh "$BACKUP_DIR" | cut -f1)${NC}"
```

#### **Verification Script**
```bash
#!/bin/bash
# kentkonut-backend/scripts/verify-containerized-setup.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Verifying Containerized Setup...${NC}"
echo "=================================="

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -e "${YELLOW}🔍 Checking $service_name...${NC}"
    
    # Wait for service to be ready
    for i in {1..30}; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
            echo -e "${GREEN}✅ $service_name is healthy${NC}"
            return 0
        fi
        echo -e "${YELLOW}⏳ Waiting for $service_name... (attempt $i/30)${NC}"
        sleep 2
    done
    
    echo -e "${RED}❌ $service_name health check failed${NC}"
    return 1
}

# Check Docker and Docker Compose
echo -e "${YELLOW}🐳 Checking Docker...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker is installed: $(docker --version)${NC}"
else
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✅ Docker Compose is installed: $(docker-compose --version)${NC}"
else
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

# Check container status
echo -e "\n${YELLOW}📦 Container Status:${NC}"
docker-compose ps

# Check if all required containers are running
required_containers=("kentkonut-postgres" "kentkonut-backend" "kentkonut-frontend")
for container in "${required_containers[@]}"; do
    if docker ps --format "table {{.Names}}" | grep -q "$container"; then
        echo -e "${GREEN}✅ $container is running${NC}"
    else
        echo -e "${RED}❌ $container is not running${NC}"
        exit 1
    fi
done

# Check database health
echo -e "\n${YELLOW}🗄️ Database Health:${NC}"
if docker exec kentkonut-postgres pg_isready -U postgres -d kentkonutdb; then
    echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not ready${NC}"
    exit 1
fi

# Check backend API
echo -e "\n${YELLOW}🔧 Backend API Health:${NC}"
check_service "Backend API" "http://localhost:3010/api/health"

# Check frontend
echo -e "\n${YELLOW}🎨 Frontend Health:${NC}"
check_service "Frontend" "http://localhost:3000"

# Check data integrity
echo -e "\n${YELLOW}📊 Data Integrity Check:${NC}"
page_count=$(docker exec kentkonut-postgres psql -U postgres -d kentkonutdb -t -c "SELECT COUNT(*) FROM \"Page\";" 2>/dev/null | xargs)
if [ "$page_count" -ge 0 ] 2>/dev/null; then
    echo -e "${GREEN}✅ Database contains $page_count pages${NC}"
else
    echo -e "${RED}❌ Unable to verify database data${NC}"
fi

# Check volumes
echo -e "\n${YELLOW}💾 Volume Status:${NC}"
docker volume ls | grep kentkonut
if docker volume inspect postgres_data &>/dev/null; then
    echo -e "${GREEN}✅ PostgreSQL data volume exists${NC}"
else
    echo -e "${RED}❌ PostgreSQL data volume missing${NC}"
fi

# Check network
echo -e "\n${YELLOW}🌐 Network Status:${NC}"
if docker network inspect kentkonut-network &>/dev/null; then
    echo -e "${GREEN}✅ kentkonut-network exists${NC}"
else
    echo -e "${RED}❌ kentkonut-network missing${NC}"
fi

# Performance check
echo -e "\n${YELLOW}⚡ Performance Check:${NC}"
backend_response_time=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:3010/api/health)
frontend_response_time=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:3000)

echo -e "${GREEN}📊 Backend response time: ${backend_response_time}s${NC}"
echo -e "${GREEN}📊 Frontend response time: ${frontend_response_time}s${NC}"

# Resource usage
echo -e "\n${YELLOW}💻 Resource Usage:${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" kentkonut-postgres kentkonut-backend kentkonut-frontend

echo -e "\n${GREEN}🎉 Verification completed successfully!${NC}"
echo -e "${BLUE}📱 Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}🔧 Backend: http://localhost:3010${NC}"
echo -e "${BLUE}🗄️ PgAdmin: http://localhost:8080 (start with --profile tools)${NC}"
```

#### **Development Startup Script**
```bash
#!/bin/bash
# kentkonut-backend/scripts/start-dev.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting KentKonut Development Environment...${NC}"
echo "================================================"

# Check if Docker is running
if ! docker info &>/dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Stop any existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down --remove-orphans

# Build images if they don't exist or if --build flag is passed
if [ "$1" = "--build" ] || [ "$1" = "-b" ]; then
    echo -e "${YELLOW}🔨 Building Docker images...${NC}"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache
fi

# Start services
echo -e "${YELLOW}🚀 Starting development services...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 15

# Run database migrations if needed
echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
docker exec kentkonut-backend npx prisma migrate deploy || echo -e "${YELLOW}⚠️ Migration failed or not needed${NC}"

# Generate Prisma client
echo -e "${YELLOW}🔧 Generating Prisma client...${NC}"
docker exec kentkonut-backend npx prisma generate || echo -e "${YELLOW}⚠️ Prisma generate failed${NC}"

# Run verification
echo -e "${YELLOW}🔍 Running verification...${NC}"
./scripts/verify-containerized-setup.sh

echo -e "\n${GREEN}🎉 Development environment is ready!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${BLUE}📱 Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}🔧 Backend: http://localhost:3010${NC}"
echo -e "${BLUE}🗄️ Database: localhost:5432${NC}"
echo -e "${BLUE}🛠️ PgAdmin: docker-compose --profile tools up -d pgadmin${NC}"
echo -e "\n${YELLOW}💡 Useful commands:${NC}"
echo -e "   View logs: docker-compose logs -f [service]"
echo -e "   Stop: docker-compose down"
echo -e "   Restart: docker-compose restart [service]"
echo -e "   Shell access: docker exec -it kentkonut-[service] sh"
```

#### **Production Startup Script**
```bash
#!/bin/bash
# kentkonut-backend/scripts/start-prod.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting KentKonut Production Environment...${NC}"
echo "==============================================="

# Check if required environment variables are set
required_vars=("NEXTAUTH_SECRET" "NEXTAUTH_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Required environment variable $var is not set${NC}"
        exit 1
    fi
done

# Check if Docker is running
if ! docker info &>/dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Create backup before deployment
echo -e "${YELLOW}💾 Creating backup before deployment...${NC}"
./scripts/backup-data.sh

# Build production images
echo -e "${YELLOW}🔨 Building production images...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down

# Start production services
echo -e "${YELLOW}🚀 Starting production services...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Wait for services
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Run database migrations
echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
docker exec kentkonut-backend npx prisma migrate deploy

# Run verification
echo -e "${YELLOW}🔍 Running verification...${NC}"
./scripts/verify-containerized-setup.sh

echo -e "\n${GREEN}🎉 Production environment is ready!${NC}"
echo -e "${GREEN}===================================${NC}"
echo -e "${BLUE}📱 Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}🔧 Backend: http://localhost:3010${NC}"
echo -e "\n${YELLOW}💡 Monitor with:${NC}"
echo -e "   docker-compose logs -f"
echo -e "   docker stats"
```

#### **Cleanup Script**
```bash
#!/bin/bash
# kentkonut-backend/scripts/cleanup.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧹 KentKonut Docker Cleanup Utility${NC}"
echo "==================================="

# Function to confirm action
confirm() {
    read -p "$(echo -e ${YELLOW}$1 ${NC}[y/N]: )" -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

# Stop all containers
if confirm "Stop all KentKonut containers?"; then
    echo -e "${YELLOW}🛑 Stopping containers...${NC}"
    docker-compose down --remove-orphans
    echo -e "${GREEN}✅ Containers stopped${NC}"
fi

# Remove containers
if confirm "Remove KentKonut containers?"; then
    echo -e "${YELLOW}🗑️ Removing containers...${NC}"
    docker-compose down --remove-orphans --rmi local
    echo -e "${GREEN}✅ Containers removed${NC}"
fi

# Remove volumes (WARNING: This will delete all data!)
if confirm "⚠️ DANGER: Remove volumes (THIS WILL DELETE ALL DATA)?"; then
    echo -e "${RED}🗑️ Removing volumes...${NC}"
    docker-compose down -v
    docker volume rm postgres_data uploads_data 2>/dev/null || true
    echo -e "${GREEN}✅ Volumes removed${NC}"
fi

# Remove images
if confirm "Remove KentKonut Docker images?"; then
    echo -e "${YELLOW}🗑️ Removing images...${NC}"
    docker rmi kentkonut-backend kentkonut-frontend 2>/dev/null || true
    echo -e "${GREEN}✅ Images removed${NC}"
fi

# Remove network
if confirm "Remove KentKonut network?"; then
    echo -e "${YELLOW}🗑️ Removing network...${NC}"
    docker network rm kentkonut-network 2>/dev/null || true
    echo -e "${GREEN}✅ Network removed${NC}"
fi

# Clean up Docker system
if confirm "Run Docker system cleanup?"; then
    echo -e "${YELLOW}🧹 Running Docker system cleanup...${NC}"
    docker system prune -f
    echo -e "${GREEN}✅ Docker system cleaned${NC}"
fi

echo -e "\n${GREEN}🎉 Cleanup completed!${NC}"
```

### **Environment Configuration Updates**

#### **Backend Environment Variables**
```env
# kentkonut-backend/.env
# Database Configuration
DATABASE_URL="postgresql://postgres:P@ssw0rd@postgresql:5432/kentkonutdb"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3010
NEXTAUTH_SECRET=your-super-secret-token-change-this-in-production

# Application Configuration
NODE_ENV=development
PORT=3010

# File Upload Configuration
UPLOAD_DIR=/app/public/uploads
MAX_FILE_SIZE=10485760

# Security Configuration
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Analytics Configuration
ANALYTICS_ENABLED=true
ANALYTICS_CONSENT_REQUIRED=false
```

#### **Frontend Environment Variables**
```env
# kentkonut-frontend/.env
# API Configuration
VITE_API_URL=http://localhost:3010

# Application Configuration
VITE_APP_NAME=KentKonut CMS
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEV_MODE=true
VITE_DEBUG=true
```

---

## 🚀 Step-by-Step Migration

### **Phase 1: Preparation (30 minutes)**

#### **Step 1.1: Create Backup**
```bash
# Navigate to backend directory
cd kentkonut-backend

# Make backup script executable
chmod +x scripts/backup-data.sh

# Create backup
./scripts/backup-data.sh
```

#### **Step 1.2: Verify Current State**
```bash
# Check current application status
curl http://localhost:3010/api/health
curl http://localhost:3000

# Check database
docker exec kentkonut-postgres pg_isready -U postgres -d kentkonutdb

# Document current environment
cp .env .env.backup
cp ../kentkonut-frontend/.env ../kentkonut-frontend/.env.backup
```

#### **Step 1.3: Create Required Directories**
```bash
# Create scripts directory if it doesn't exist
mkdir -p scripts

# Create backup directory
mkdir -p backups

# Ensure proper permissions
chmod +x scripts/*.sh
```

### **Phase 2: Backend Containerization (45 minutes)**

#### **Step 2.1: Create Backend Dockerfiles**
```bash
# Create production Dockerfile
cat > Dockerfile << 'EOF'
[Content from Backend Production Dockerfile above]
EOF

# Create development Dockerfile
cat > Dockerfile.dev << 'EOF'
[Content from Backend Development Dockerfile above]
EOF

# Create .dockerignore
cat > .dockerignore << 'EOF'
[Content from Backend .dockerignore above]
EOF
```

#### **Step 2.2: Update Next.js Configuration**
```bash
# Update next.config.js
cat > next.config.js << 'EOF'
[Content from Updated Next.js Configuration above]
EOF
```

#### **Step 2.3: Update Environment Variables**
```bash
# Update .env for container networking
cat > .env << 'EOF'
[Content from Backend Environment Variables above]
EOF
```

### **Phase 3: Frontend Containerization (30 minutes)**

#### **Step 3.1: Create Frontend Dockerfiles**
```bash
# Navigate to frontend directory
cd ../kentkonut-frontend

# Create production Dockerfile
cat > Dockerfile << 'EOF'
[Content from Frontend Production Dockerfile above]
EOF

# Create development Dockerfile
cat > Dockerfile.dev << 'EOF'
[Content from Frontend Development Dockerfile above]
EOF

# Create nginx configuration
cat > nginx.conf << 'EOF'
[Content from Nginx Configuration above]
EOF

# Create .dockerignore
cat > .dockerignore << 'EOF'
[Content from Frontend .dockerignore above]
EOF
```

#### **Step 3.2: Update Vite Configuration**
```bash
# Update vite.config.ts
cat > vite.config.ts << 'EOF'
[Content from Updated Vite Configuration above]
EOF
```

#### **Step 3.3: Update Frontend Environment**
```bash
# Update .env
cat > .env << 'EOF'
[Content from Frontend Environment Variables above]
EOF
```

### **Phase 4: Docker Compose Configuration (45 minutes)**

#### **Step 4.1: Update Main Compose File**
```bash
# Navigate back to backend directory
cd ../kentkonut-backend

# Update docker-compose.yml
cat > docker-compose.yml << 'EOF'
[Content from Main Docker Compose above]
EOF
```

#### **Step 4.2: Create Development Override**
```bash
# Create development override
cat > docker-compose.dev.yml << 'EOF'
[Content from Development Override above]
EOF
```

#### **Step 4.3: Create Production Override**
```bash
# Create production override
cat > docker-compose.prod.yml << 'EOF'
[Content from Production Override above]
EOF
```

### **Phase 5: Create Automation Scripts (30 minutes)**

#### **Step 5.1: Create All Scripts**
```bash
# Create backup script
cat > scripts/backup-data.sh << 'EOF'
[Content from Data Backup Script above]
EOF

# Create verification script
cat > scripts/verify-containerized-setup.sh << 'EOF'
[Content from Verification Script above]
EOF

# Create development startup script
cat > scripts/start-dev.sh << 'EOF'
[Content from Development Startup Script above]
EOF

# Create production startup script
cat > scripts/start-prod.sh << 'EOF'
[Content from Production Startup Script above]
EOF

# Create cleanup script
cat > scripts/cleanup.sh << 'EOF'
[Content from Cleanup Script above]
EOF

# Make all scripts executable
chmod +x scripts/*.sh
```

### **Phase 6: Migration Execution (60 minutes)**

#### **Step 6.1: Stop Current Services**
```bash
# Stop any running development servers
# Press Ctrl+C in terminals running npm run dev

# Stop only non-essential containers (keep database running)
docker-compose stop pgadmin 2>/dev/null || true
```

#### **Step 6.2: Build Docker Images**
```bash
# Build development images
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build

# Verify images were created
docker images | grep kentkonut
```

#### **Step 6.3: Start Containerized Services**
```bash
# Start development environment
./scripts/start-dev.sh

# Or start manually
# docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

#### **Step 6.4: Verify Migration**
```bash
# Run comprehensive verification
./scripts/verify-containerized-setup.sh

# Manual verification
curl http://localhost:3010/api/health
curl http://localhost:3000
```

#### **Step 6.5: Test Application Functionality**
```bash
# Test database connectivity
docker exec kentkonut-backend npx prisma db push

# Test file uploads (if applicable)
# Test authentication
# Test all major features
```

### **Phase 7: Documentation and Cleanup (15 minutes)**

#### **Step 7.1: Update Documentation**
```bash
# Update main README
# Document new development workflow
# Update deployment instructions
```

#### **Step 7.2: Commit Changes**
```bash
# Add all new files
git add .

# Commit containerization changes
git commit -m "feat: containerize full-stack application with Docker

- Add production and development Dockerfiles for backend and frontend
- Update docker-compose.yml with multi-service configuration
- Add automation scripts for backup, verification, and deployment
- Update environment configurations for container networking
- Preserve all existing data and functionality
- Maintain development workflow with hot reload"

# Push changes
git push origin main
```

---

## ✅ Verification Procedures

### **Automated Verification**
```bash
# Run comprehensive verification script
./scripts/verify-containerized-setup.sh

# Expected output:
# ✅ All containers running
# ✅ Database healthy
# ✅ Backend API responding
# ✅ Frontend accessible
# ✅ Data integrity confirmed
```

### **Manual Verification Checklist**

#### **Container Health**
- [ ] PostgreSQL container running and healthy
- [ ] Backend container running and responding
- [ ] Frontend container running and serving content
- [ ] All containers connected to kentkonut-network

#### **Application Functionality**
- [ ] Frontend loads at http://localhost:3000
- [ ] Backend API responds at http://localhost:3010/api/health
- [ ] Database queries work correctly
- [ ] Authentication system functional
- [ ] File uploads work (if applicable)
- [ ] All existing features operational

#### **Data Integrity**
- [ ] All existing pages/content preserved
- [ ] User accounts and permissions intact
- [ ] Uploaded files accessible
- [ ] Database relationships maintained

#### **Development Workflow**
- [ ] Hot reload works for backend changes
- [ ] Hot reload works for frontend changes
- [ ] Database changes reflect immediately
- [ ] Debugging capabilities maintained

### **Performance Verification**
```bash
# Check response times
time curl http://localhost:3010/api/health
time curl http://localhost:3000

# Check resource usage
docker stats --no-stream

# Check memory usage
docker exec kentkonut-backend node -e "console.log(process.memoryUsage())"
```

---

## 🛠️ Development Workflow

### **Daily Development Commands**

#### **Starting Development Environment**
```bash
# Quick start (if containers exist)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Full start with verification
./scripts/start-dev.sh

# Start with fresh build
./scripts/start-dev.sh --build
```

#### **Viewing Logs**
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgresql

# View last 100 lines
docker-compose logs --tail=100 backend
```

#### **Accessing Containers**
```bash
# Access backend container
docker exec -it kentkonut-backend sh

# Access frontend container
docker exec -it kentkonut-frontend sh

# Access database
docker exec -it kentkonut-postgres psql -U postgres -d kentkonutdb
```

#### **Database Operations**
```bash
# Run Prisma migrations
docker exec kentkonut-backend npx prisma migrate dev

# Generate Prisma client
docker exec kentkonut-backend npx prisma generate

# Reset database
docker exec kentkonut-backend npx prisma migrate reset

# View database
docker exec kentkonut-backend npx prisma studio
```

#### **Stopping Services**
```bash
# Stop all services
docker-compose down

# Stop specific service
docker-compose stop backend

# Restart specific service
docker-compose restart backend
```

### **Code Changes Workflow**

#### **Backend Changes**
1. Edit files in `kentkonut-backend/` directory
2. Changes are automatically reflected (hot reload)
3. For dependency changes: `docker-compose restart backend`
4. For schema changes: Run Prisma commands in container

#### **Frontend Changes**
1. Edit files in `kentkonut-frontend/` directory
2. Changes are automatically reflected (hot reload)
3. For dependency changes: `docker-compose restart frontend`
4. For build configuration changes: Rebuild container

#### **Database Schema Changes**
```bash
# Create new migration
docker exec kentkonut-backend npx prisma migrate dev --name your_migration_name

# Apply migrations
docker exec kentkonut-backend npx prisma migrate deploy

# Reset and reseed
docker exec kentkonut-backend npx prisma migrate reset
```

### **Debugging Workflow**

#### **Backend Debugging**
```bash
# View backend logs
docker-compose logs -f backend

# Access backend shell
docker exec -it kentkonut-backend sh

# Check environment variables
docker exec kentkonut-backend env

# Test API endpoints
docker exec kentkonut-backend curl http://localhost:3010/api/health
```

#### **Frontend Debugging**
```bash
# View frontend logs
docker-compose logs -f frontend

# Access frontend shell
docker exec -it kentkonut-frontend sh

# Check build output
docker exec kentkonut-frontend ls -la /usr/share/nginx/html
```

#### **Database Debugging**
```bash
# Check database status
docker exec kentkonut-postgres pg_isready -U postgres -d kentkonutdb

# View database logs
docker-compose logs postgresql

# Connect to database
docker exec -it kentkonut-postgres psql -U postgres -d kentkonutdb

# Check database size
docker exec kentkonut-postgres psql -U postgres -d kentkonutdb -c "\l+"
```

### **Testing Workflow**

#### **Running Tests**
```bash
# Backend tests
docker exec kentkonut-backend npm test

# Frontend tests
docker exec kentkonut-frontend npm test

# E2E tests (if configured)
docker exec kentkonut-backend npm run test:e2e
```

#### **Performance Testing**
```bash
# Load testing
docker exec kentkonut-backend npm run test:load

# Memory leak testing
docker stats --no-stream kentkonut-backend kentkonut-frontend
```

---

## 🚨 Troubleshooting

### **Common Issues and Solutions**

#### **Container Won't Start**

**Problem**: Container fails to start or exits immediately
```bash
# Check container logs
docker-compose logs [service-name]

# Check container status
docker ps -a

# Common solutions:
# 1. Port already in use
sudo lsof -i :3010  # Check what's using the port
docker-compose down  # Stop all containers

# 2. Permission issues
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh

# 3. Out of disk space
docker system df
docker system prune -f
```

#### **Database Connection Issues**

**Problem**: Backend can't connect to PostgreSQL
```bash
# Check database container
docker exec kentkonut-postgres pg_isready -U postgres -d kentkonutdb

# Check network connectivity
docker exec kentkonut-backend ping postgresql

# Check environment variables
docker exec kentkonut-backend env | grep DATABASE_URL

# Solution: Verify DATABASE_URL format
# Correct: postgresql://postgres:P@ssw0rd@postgresql:5432/kentkonutdb
# Note: Use 'postgresql' (service name) not 'localhost'
```

#### **Hot Reload Not Working**

**Problem**: Changes not reflected in development
```bash
# Check volume mounts
docker inspect kentkonut-backend | grep -A 10 Mounts

# Restart with fresh volumes
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# For Windows/WSL2 users:
# Ensure files are in WSL2 filesystem, not Windows filesystem
```

#### **Build Failures**

**Problem**: Docker build fails
```bash
# Clear build cache
docker builder prune -f

# Build with no cache
docker-compose build --no-cache

# Check Dockerfile syntax
docker build -t test-build .

# Common issues:
# 1. Node modules cache issues
# Solution: Add /app/node_modules to .dockerignore

# 2. Prisma generation fails
# Solution: Ensure DATABASE_URL is available during build
```

#### **Performance Issues**

**Problem**: Slow response times or high memory usage
```bash
# Check resource usage
docker stats

# Check container limits
docker inspect kentkonut-backend | grep -A 5 Memory

# Solutions:
# 1. Increase memory limits in docker-compose.yml
# 2. Optimize Docker images
# 3. Use multi-stage builds
# 4. Enable BuildKit for faster builds
export DOCKER_BUILDKIT=1
```

#### **Data Loss Issues**

**Problem**: Database data disappears
```bash
# Check volume status
docker volume ls
docker volume inspect postgres_data

# Restore from backup
./scripts/backup-data.sh  # Create new backup first
docker exec -i kentkonut-postgres psql -U postgres -d kentkonutdb < backups/YYYYMMDD_HHMMSS/kentkonutdb_backup.sql

# Prevention:
# 1. Regular backups
# 2. Never use 'docker-compose down -v' in production
# 3. Use named volumes instead of bind mounts for data
```

#### **Network Issues**

**Problem**: Services can't communicate
```bash
# Check network
docker network ls
docker network inspect kentkonut-network

# Check service discovery
docker exec kentkonut-backend nslookup postgresql
docker exec kentkonut-frontend nslookup backend

# Solution: Ensure all services are on same network
# Verify docker-compose.yml network configuration
```

#### **Environment Variable Issues**

**Problem**: Environment variables not loaded
```bash
# Check loaded variables
docker exec kentkonut-backend env

# Check .env file
cat .env

# Solutions:
# 1. Ensure .env file is in correct location
# 2. Restart containers after .env changes
# 3. Use docker-compose config to verify configuration
docker-compose config
```

### **Emergency Procedures**

#### **Complete Reset**
```bash
# DANGER: This will delete all data
./scripts/cleanup.sh

# Restore from backup
./scripts/backup-data.sh  # If you have a recent backup
# Then follow migration steps again
```

#### **Rollback to Host-based Development**
```bash
# Stop containers
docker-compose down

# Restore original environment files
cp .env.backup .env
cp ../kentkonut-frontend/.env.backup ../kentkonut-frontend/.env

# Start host-based development
npm run dev  # In backend directory
npm run dev  # In frontend directory (separate terminal)
```

#### **Data Recovery**
```bash
# List available backups
ls -la backups/

# Restore specific backup
BACKUP_DIR="backups/YYYYMMDD_HHMMSS"
docker exec -i kentkonut-postgres psql -U postgres -d kentkonutdb < $BACKUP_DIR/kentkonutdb_backup.sql

# Restore uploaded files
cp -r $BACKUP_DIR/uploads public/uploads
```

### **Performance Optimization**

#### **Docker Image Optimization**
```bash
# Analyze image size
docker images | grep kentkonut

# Use dive to analyze layers
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  wagoodman/dive:latest kentkonut-backend

# Optimization tips:
# 1. Use alpine images
# 2. Multi-stage builds
# 3. Minimize layers
# 4. Use .dockerignore effectively
```

#### **Memory Optimization**
```bash
# Set memory limits
# Add to docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M

# Monitor memory usage
docker stats --no-stream
```

#### **Build Speed Optimization**
```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1

# Use build cache
docker-compose build --parallel

# Cache node_modules
# Use bind mounts for node_modules in development
```

---

## 🚀 Post-Migration Optimization

### **Production Readiness Checklist**

#### **Security Hardening**
- [ ] Update default passwords
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Enable security headers
- [ ] Configure firewall rules
- [ ] Set up log monitoring

#### **Performance Optimization**
- [ ] Configure resource limits
- [ ] Set up caching strategies
- [ ] Optimize Docker images
- [ ] Configure load balancing
- [ ] Set up CDN for static assets
- [ ] Monitor performance metrics

#### **Monitoring and Logging**
- [ ] Set up centralized logging
- [ ] Configure health checks
- [ ] Set up alerting
- [ ] Monitor resource usage
- [ ] Track application metrics
- [ ] Set up backup automation

### **Scaling Considerations**

#### **Horizontal Scaling**
```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  backend:
    deploy:
      replicas: 3
  frontend:
    deploy:
      replicas: 2
```

#### **Load Balancing**
```yaml
# Add nginx load balancer
nginx-lb:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - ./nginx-lb.conf:/etc/nginx/nginx.conf
  depends_on:
    - backend
```

### **Backup Strategy**

#### **Automated Backups**
```bash
# Add to crontab
0 2 * * * /path/to/kentkonut-backend/scripts/backup-data.sh

# Backup retention script
find backups/ -type d -mtime +30 -exec rm -rf {} \;
```

#### **Disaster Recovery**
```bash
# Create disaster recovery plan
# 1. Regular offsite backups
# 2. Infrastructure as code
# 3. Documented recovery procedures
# 4. Regular recovery testing
```

---

## 📚 Additional Resources

### **Docker Best Practices**
- Use multi-stage builds for smaller images
- Leverage build cache effectively
- Use specific image tags, not 'latest'
- Run containers as non-root users
- Use health checks for all services
- Implement proper logging strategies

### **Development Best Practices**
- Use development-specific configurations
- Implement hot reload for faster development
- Use volume mounts for source code
- Separate development and production environments
- Implement proper error handling
- Use environment-specific secrets

### **Monitoring and Maintenance**
- Regular security updates
- Performance monitoring
- Log analysis
- Backup verification
- Disaster recovery testing
- Documentation updates

---

## 🎯 Success Criteria

### **Migration Success Indicators**
- [ ] All containers start successfully
- [ ] Application functionality preserved
- [ ] Data integrity maintained
- [ ] Performance meets expectations
- [ ] Development workflow functional
- [ ] Production deployment ready

### **Quality Metrics**
- **Startup Time**: < 60 seconds for full stack
- **Response Time**: < 500ms for API endpoints
- **Memory Usage**: < 1GB total for all containers
- **Build Time**: < 5 minutes for full rebuild
- **Hot Reload**: < 3 seconds for code changes

### **Operational Metrics**
- **Uptime**: 99.9% availability
- **Recovery Time**: < 5 minutes from backup
- **Deployment Time**: < 10 minutes for updates
- **Rollback Time**: < 2 minutes if needed

---

**🎉 Congratulations! You have successfully containerized the KentKonut full-stack application while preserving all data and maintaining development productivity.**

For questions or issues, refer to the troubleshooting section or create an issue in the project repository.