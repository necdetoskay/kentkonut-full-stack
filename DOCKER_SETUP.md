# 🐳 KentKonut Full-Stack Docker Setup Guide

This guide provides step-by-step instructions for running the kentkonut-full-stack project using Docker from the root directory.

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0+
- Git Bash or WSL (for running shell scripts on Windows)
- Minimum 4GB RAM available for containers
- 10GB free disk space

## 🚀 Quick Start

### 1. **Start Development Environment**
```bash
# From the root directory
./scripts/start-dev.sh
```

### 2. **Verify Setup**
```bash
# Verify everything is working
./scripts/verify-containerized-setup.sh
```

### 3. **Create Backup**
```bash
# Create backup of current data
./scripts/backup-data.sh
```

## 📁 Project Structure

```
kentkonut-full-stack/
├── docker-compose.yml          # Main services configuration
├── docker-compose.dev.yml      # Development overrides
├── docker-compose.prod.yml     # Production overrides
├── Dockerfile                  # Production backend container
├── Dockerfile.dev              # Development backend container
├── .dockerignore               # Docker build exclusions
├── scripts/                    # Management scripts
│   ├── start-dev.sh           # Start development environment
│   ├── verify-containerized-setup.sh  # Verify setup
│   └── backup-data.sh         # Backup data
├── kentkonut-backend/          # Backend application
├── kentkonut-frontend/         # Frontend application
└── kentkonut-data/            # Data directory
```

## 🛠️ Services

### **Backend Service**
- **Container**: `kentkonut-backend`
- **Port**: 3010
- **Health Check**: http://localhost:3010/api/health
- **Hot Reload**: Enabled in development mode

### **PostgreSQL Database**
- **Container**: `kentkonut-postgres`
- **Port**: 5433 (external), 5432 (internal)
- **Database**: `kentkonutdb`
- **User**: `postgres`
- **Password**: `P@ssw0rd`

### **Redis Cache**
- **Container**: `kentkonut-redis`
- **Port**: 6379
- **Persistence**: Configurable per environment

### **PgAdmin (Optional)**
- **Container**: `kentkonut-pgadmin`
- **Port**: 8080
- **Email**: admin@kentkonut.com
- **Password**: admin123

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

# Generate Prisma client
docker exec kentkonut-backend npx prisma generate
```

### **Environment Modes**

#### **Development Mode**
```bash
# Start with development configuration
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

#### **Production Mode**
```bash
# Start with production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

#### **With PgAdmin**
```bash
# Start with database administration tool
docker-compose --profile tools up -d pgadmin
```

## 🌐 Access Points

- **Backend API**: http://localhost:3010
- **Database**: localhost:5433
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

### **Port Conflicts**
If you encounter port conflicts:
1. Check what's using the ports: `netstat -tulpn | grep :5433`
2. Stop conflicting services
3. Or modify ports in `docker-compose.yml`

## 💾 Backup & Restore

### **Create Backup**
```bash
./scripts/backup-data.sh
```

### **Restore from Backup**
```bash
# List backups
ls -la kentkonut-backend/backups/

# Restore database
BACKUP_DIR="kentkonut-backend/backups/YYYYMMDD_HHMMSS"
docker exec -i kentkonut-postgres psql -U postgres -d kentkonutdb < $BACKUP_DIR/kentkonutdb_backup.sql

# Restore files
cp -r $BACKUP_DIR/uploads kentkonut-backend/public/uploads
cp -r $BACKUP_DIR/media kentkonut-backend/public/media
# ... restore other directories as needed
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

## 🔄 Migration from Backend Directory

If you previously had Docker setup in `kentkonut-backend/`:

1. **Stop old containers**:
   ```bash
   cd kentkonut-backend
   docker-compose down
   ```

2. **Start from root**:
   ```bash
   cd ..
   ./scripts/start-dev.sh
   ```

3. **Clean up old files** (optional):
   ```bash
   rm kentkonut-backend/docker-compose*.yml
   rm kentkonut-backend/Dockerfile*
   rm kentkonut-backend/.dockerignore
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

## 🎯 Future Enhancements

This centralized Docker setup enables:
- **Frontend containerization** - Add kentkonut-frontend service
- **Load balancing** - Add nginx reverse proxy
- **Monitoring** - Add Prometheus/Grafana stack
- **CI/CD integration** - Automated deployments
- **Multi-environment** - Staging, production configurations
