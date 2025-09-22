# 🐳 KentKonut Backend Docker Setup Guide

**⚠️ DEPRECATED: Docker configuration has been moved to the root directory.**

Please use the Docker setup from the root `kentkonut-full-stack/` directory instead.

See: `../DOCKER_SETUP.md` for the current Docker configuration.

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0+
- Git Bash or WSL (for running shell scripts on Windows)
- Minimum 4GB RAM available for containers
- 10GB free disk space

## 🚀 Quick Start

### 1. **Backup Existing Data**
```bash
# Create backup of current data
./scripts/backup-data.sh
```

### 2. **Migrate to Containers**
```bash
# Run complete migration
./scripts/migrate-to-containers.sh
```

### 3. **Start Development Environment**
```bash
# Start development containers
./scripts/start-dev.sh
```

### 4. **Verify Setup**
```bash
# Verify everything is working
./scripts/verify-containerized-setup.sh
```

## 📁 What's Included

### **Docker Configuration**
- `Dockerfile` - Production backend container
- `Dockerfile.dev` - Development backend container  
- `docker-compose.yml` - Main services configuration
- `docker-compose.dev.yml` - Development overrides
- `docker-compose.prod.yml` - Production overrides

### **Services**
- **PostgreSQL** - Database with persistent volume
- **Backend** - Next.js application container
- **Redis** - Caching service
- **PgAdmin** - Database administration (optional)

### **Data Preservation**
All existing data is preserved in Docker volumes:
- `uploads_data` - User uploaded files
- `media_data` - Media files
- `banners_data` - Banner images
- `haberler_data` - News images
- `hafriyat_data` - Excavation images
- `kurumsal_data` - Corporate images
- `services_data` - Service images
- `proje_data` - Project images
- `postgres_data` - Database data
- `redis_data` - Cache data

## 🛠️ Manual Setup Steps

### **Step 1: Prepare Environment**
```bash
# Navigate to backend directory
cd kentkonut-backend

# Create backup
./scripts/backup-data.sh

# Update environment for containers
# DATABASE_URL will be automatically updated
```

### **Step 2: Build Images**
```bash
# Build development images
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build

# Or build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
```

### **Step 3: Start Services**
```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### **Step 4: Initialize Data**
```bash
# Run migrations
docker exec kentkonut-backend npx prisma migrate deploy

# Generate Prisma client
docker exec kentkonut-backend npx prisma generate
```

## 🔧 Development Workflow

### **Daily Commands**
```bash
# Start development environment
./scripts/start-dev.sh

# View logs
docker-compose logs -f backend

# Access backend container
docker exec -it kentkonut-backend sh

# Stop services
docker-compose down
```

### **Database Operations**
```bash
# Access database
docker exec -it kentkonut-postgres psql -U postgres -d kentkonutdb

# Run migrations
docker exec kentkonut-backend npx prisma migrate dev

# Reset database
docker exec kentkonut-backend npx prisma migrate reset
```

### **File Changes**
- Backend code changes are automatically reflected (hot reload)
- For dependency changes: `docker-compose restart backend`
- For schema changes: Run Prisma commands in container

## 🌐 Access Points

- **Backend API**: http://localhost:3010
- **Database**: localhost:5432
- **Redis**: localhost:6379
- **PgAdmin**: http://localhost:8080 (with `--profile tools`)

## 📊 Verification

### **Health Checks**
```bash
# Backend health
curl http://localhost:3010/api/health

# Database health
docker exec kentkonut-postgres pg_isready -U postgres -d kentkonutdb

# Redis health
docker exec kentkonut-redis redis-cli ping
```

### **Data Integrity**
```bash
# Check database data
docker exec kentkonut-postgres psql -U postgres -d kentkonutdb -c "SELECT COUNT(*) FROM \"Page\";"

# Check media files
docker exec kentkonut-backend find /app/public -name "*.jpg" | wc -l
```

## 🚨 Troubleshooting

### **Container Won't Start**
```bash
# Check logs
docker-compose logs [service-name]

# Check container status
docker ps -a

# Restart services
docker-compose restart [service-name]
```

### **Database Connection Issues**
```bash
# Verify database container
docker exec kentkonut-postgres pg_isready -U postgres -d kentkonutdb

# Check network connectivity
docker exec kentkonut-backend ping postgresql

# Verify environment variables
docker exec kentkonut-backend env | grep DATABASE_URL
```

### **Hot Reload Not Working**
```bash
# Check volume mounts
docker inspect kentkonut-backend | grep -A 10 Mounts

# Restart with fresh volumes
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## 💾 Backup & Restore

### **Create Backup**
```bash
./scripts/backup-data.sh
```

### **Restore from Backup**
```bash
# List backups
ls -la backups/

# Restore database
BACKUP_DIR="backups/YYYYMMDD_HHMMSS"
docker exec -i kentkonut-postgres psql -U postgres -d kentkonutdb < $BACKUP_DIR/kentkonutdb_backup.sql

# Restore files
cp -r $BACKUP_DIR/uploads public/uploads
cp -r $BACKUP_DIR/media public/media
# ... restore other directories as needed
```

## 🔄 Rollback to Host-based Development

If you need to rollback to host-based development:

```bash
# Stop containers
docker-compose down

# Restore original environment
cp .env.host-backup .env

# Start host-based development
npm run dev
```

## 📈 Performance Optimization

### **Resource Limits**
Production containers have resource limits configured:
- Backend: 1GB memory, 1 CPU
- PostgreSQL: 512MB memory, 0.5 CPU  
- Redis: 256MB memory, 0.25 CPU

### **Monitoring**
```bash
# Check resource usage
docker stats

# Monitor logs
docker-compose logs -f --tail=100
```

## ✅ Success Criteria

- ✅ All containers start successfully
- ✅ Backend API responds at http://localhost:3010/api/health
- ✅ Database contains existing data
- ✅ Media files are accessible
- ✅ Hot reload works in development
- ✅ All existing functionality preserved

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Run the verification script: `./scripts/verify-containerized-setup.sh`
3. Check container logs: `docker-compose logs [service]`
4. Ensure Docker Desktop is running and has sufficient resources
