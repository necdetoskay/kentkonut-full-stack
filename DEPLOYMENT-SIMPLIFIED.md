# KentKonut Simplified Production Deployment

This guide provides a simplified deployment approach for host **172.41.42.51** with existing applications.

## 🎯 Configuration Overview

### Port Configuration
- **Frontend**: External port `3020` (accessible from outside)
- **Backend**: External port `3021` (accessible from outside)
- **PostgreSQL**: Internal only (no external access)
- **Redis**: Internal only (no external access)

### Security Features
- Database and Redis are isolated within Docker network
- Only frontend and backend are exposed to host network
- Simplified networking to avoid conflicts with existing applications

## 🚀 Quick Deployment

### 1. Prepare Environment

```bash
# Clone repository
git clone https://github.com/your-username/kentkonut-full-stack.git
cd kentkonut-full-stack

# Copy and configure environment
cp .env.production .env
nano .env
```

### 2. Configure Environment Variables

Edit `.env` file with your secure values:

```bash
# Database (Internal Only)
POSTGRES_PASSWORD=your_very_secure_password_123

# Redis (Internal Only)  
REDIS_PASSWORD=your_very_secure_redis_password_456

# JWT Security
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters_long

# Application URLs (Host IP: 172.41.42.51)
API_BASE_URL=http://172.41.42.51:3021
VITE_API_BASE_URL=http://172.41.42.51:3021
CORS_ORIGIN=http://172.41.42.51:3020,http://localhost:3020
```

### 3. Deploy Application

```bash
# Start all services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

### 4. Verify Deployment

```bash
# Check backend health
curl http://172.41.42.51:3021/api/health

# Check frontend
curl http://172.41.42.51:3020

# Check internal services (should fail - this is correct)
curl http://172.41.42.51:5432  # Should fail - PostgreSQL not exposed
curl http://172.41.42.51:6379  # Should fail - Redis not exposed
```

## 🔧 Troubleshooting

### Check Container Status
```bash
# View all containers
docker ps -a

# Check specific container logs
docker logs kentkonut-backend-prod
docker logs kentkonut-frontend-prod
docker logs kentkonut-postgres-prod
docker logs kentkonut-redis-prod
```

### Test Internal Connectivity
```bash
# Test database connection from backend container
docker exec kentkonut-backend-prod nc -zv postgres 5432

# Test Redis connection from backend container
docker exec kentkonut-backend-prod nc -zv redis 6379
```

### Port Conflicts
If you encounter port conflicts on the host:

```bash
# Check what's using the ports
netstat -tulpn | grep :3020
netstat -tulpn | grep :3021

# If ports are in use, modify docker-compose.production.yml:
# Change "3020:3020" to "3022:3020" for frontend
# Change "3021:3021" to "3023:3021" for backend
```

## 🔄 Management Commands

### Update Application
```bash
# Pull latest images
docker-compose -f docker-compose.production.yml pull

# Restart services
docker-compose -f docker-compose.production.yml up -d

# Clean old images
docker image prune -f
```

### Backup Database
```bash
# Create backup
docker exec kentkonut-postgres-prod pg_dump -U postgres kentkonutdb > backup_$(date +%Y%m%d).sql

# Restore backup
docker exec -i kentkonut-postgres-prod psql -U postgres kentkonutdb < backup_20250122.sql
```

### Stop Services
```bash
# Stop all services
docker-compose -f docker-compose.production.yml down

# Stop and remove volumes (WARNING: This deletes data)
docker-compose -f docker-compose.production.yml down -v
```

## 🌐 Access URLs

After successful deployment:

- **Frontend Application**: http://172.41.42.51:3020
- **Backend API**: http://172.41.42.51:3021
- **API Health Check**: http://172.41.42.51:3021/api/health

## 🔒 Security Notes

1. **Database Security**: PostgreSQL is only accessible within Docker network
2. **Redis Security**: Redis is only accessible within Docker network  
3. **Network Isolation**: Uses Docker's default networking for simplicity
4. **Password Security**: Ensure strong passwords in `.env` file
5. **Firewall**: Consider configuring host firewall for ports 3020 and 3021

## 📊 Monitoring

### Check Resource Usage
```bash
# Container resource usage
docker stats

# Disk usage
docker system df

# Network usage
docker network ls
```

### Log Management
```bash
# View recent logs
docker-compose -f docker-compose.production.yml logs --tail=100

# Follow logs in real-time
docker-compose -f docker-compose.production.yml logs -f

# View specific service logs
docker-compose -f docker-compose.production.yml logs backend
```

## 🚨 Emergency Procedures

### Quick Restart
```bash
# Restart all services
docker-compose -f docker-compose.production.yml restart

# Restart specific service
docker-compose -f docker-compose.production.yml restart backend
```

### Emergency Stop
```bash
# Stop all services immediately
docker-compose -f docker-compose.production.yml kill

# Clean up
docker-compose -f docker-compose.production.yml down
```

This simplified configuration minimizes conflicts with existing applications while maintaining security and functionality.
