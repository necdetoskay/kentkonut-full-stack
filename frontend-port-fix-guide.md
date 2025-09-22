# KentKonut Frontend Port Mapping Fix Guide

## Problem Analysis

The error `nginx: [emerg] host not found in upstream "kentkonut-backend"` indicates that:

1. **Hostname Mismatch**: The nginx config references `kentkonut-backend` but your container is named `kentkonut-backend-prod`
2. **DNS Resolution Failure**: nginx can't resolve the backend hostname at startup
3. **Container Startup Order**: Frontend starts before backend is fully ready

## Root Cause

In your `kentkonut-frontend/nginx.conf` file, lines 64 and 86 reference:
```nginx
proxy_pass http://kentkonut-backend:3021/banners/;
proxy_pass http://kentkonut-backend:3021;
```

But your Docker Compose files use different container names:
- `docker-compose.production.yml`: `kentkonut-backend-prod`
- `docker-compose.hub.yml`: `kentkonut-backend`
- `docker-compose.stable.yml`: `kentkonut-backend-stable`

## Immediate Fix Options

### Option 1: Quick Fix - Update Container Names
Update your `docker-compose.production.yml` to use consistent naming:

```yaml
services:
  backend:
    image: necdetoskay/kentkonut-backend:latest
    container_name: kentkonut-backend  # Changed from kentkonut-backend-prod
    hostname: kentkonut-backend        # Add explicit hostname
    # ... rest of configuration
    networks:
      default:
        aliases:
          - kentkonut-backend
          - backend
```

### Option 2: Add Network Aliases
Keep existing container names but add network aliases:

```yaml
services:
  backend:
    image: necdetoskay/kentkonut-backend:latest
    container_name: kentkonut-backend-prod
    # ... rest of configuration
    networks:
      default:
        aliases:
          - kentkonut-backend  # This allows nginx to find it
          - backend
```

### Option 3: Use the Fixed Configuration
Use the provided `docker-compose.fixed.yml` which includes:
- Consistent hostnames
- Network aliases for compatibility
- Better startup dependencies
- Enhanced health checks

## Recommended Solution

### Step 1: Stop Current Deployment
```powershell
docker-compose -f docker-compose.production.yml down
```

### Step 2: Use Fixed Configuration
```powershell
# Copy the fixed configuration
cp docker-compose.fixed.yml docker-compose.production-fixed.yml

# Start with fixed configuration
docker-compose -f docker-compose.production-fixed.yml up -d
```

### Step 3: Verify Fix
```powershell
# Check container status
docker ps --filter "name=kentkonut"

# Check logs for errors
docker logs kentkonut-frontend-fixed

# Test connectivity
docker exec kentkonut-frontend-fixed nslookup kentkonut-backend
docker exec kentkonut-frontend-fixed nc -zv kentkonut-backend 3021
```

## Advanced Solution: Custom Frontend Image

If you want a more robust solution, create a custom frontend image with dynamic configuration:

### Step 1: Create Enhanced Dockerfile
```dockerfile
# Enhanced Dockerfile for kentkonut-frontend
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine

# Install netcat for connectivity testing
RUN apk add --no-cache netcat-openbsd gettext

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx template and entrypoint script
COPY nginx-template.conf /etc/nginx/nginx.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 3020

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3020/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
```

### Step 2: Update Docker Compose
```yaml
frontend:
  build:
    context: ./kentkonut-frontend
    dockerfile: Dockerfile.enhanced
  container_name: kentkonut-frontend-enhanced
  environment:
    - NODE_ENV=production
    - VITE_API_BASE_URL=http://172.41.42.51:3021
    - BACKEND_HOST=kentkonut-backend  # Dynamic backend hostname
  # ... rest of configuration
```

## Monitoring and Prevention

### 1. Add Health Checks
Ensure all services have proper health checks:

```yaml
frontend:
  healthcheck:
    test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3020/health"]
    interval: 30s
    timeout: 10s
    retries: 5
    start_period: 30s
```

### 2. Use Startup Dependencies
```yaml
frontend:
  depends_on:
    backend:
      condition: service_healthy
```

### 3. Monitor with Scripts
Use the provided monitoring scripts:

```powershell
# Start continuous monitoring
.\docker-port-monitor.ps1 -ContainerName "kentkonut-frontend-fixed" -ExpectedPort 3020

# Run diagnostics when issues occur
.\docker-diagnostics.ps1 -ContainerName "kentkonut-frontend-fixed" -ExpectedPort 3020
```

## Troubleshooting Commands

### Check DNS Resolution
```powershell
# Test hostname resolution inside frontend container
docker exec kentkonut-frontend-fixed nslookup kentkonut-backend

# Test port connectivity
docker exec kentkonut-frontend-fixed nc -zv kentkonut-backend 3021
```

### Check Network Configuration
```powershell
# List Docker networks
docker network ls

# Inspect network details
docker network inspect kentkonut-prod-network

# Check container network settings
docker inspect kentkonut-frontend-fixed --format '{{.NetworkSettings.Networks}}'
```

### Restart Services in Order
```powershell
# Restart backend first
docker restart kentkonut-backend-prod
Start-Sleep 30

# Then restart frontend
docker restart kentkonut-frontend-fixed
```

## Prevention Checklist

- [ ] Use consistent container names across all compose files
- [ ] Add network aliases for backward compatibility
- [ ] Implement proper health checks
- [ ] Use startup dependencies (`depends_on` with `condition: service_healthy`)
- [ ] Monitor container logs regularly
- [ ] Test hostname resolution during deployment
- [ ] Use explicit hostnames in Docker Compose
- [ ] Implement retry logic in nginx configuration
- [ ] Set up automated monitoring scripts

## Testing the Fix

After implementing the fix:

1. **Verify Container Startup**
   ```powershell
   docker-compose -f docker-compose.fixed.yml up -d
   docker ps --filter "name=kentkonut"
   ```

2. **Check Logs**
   ```powershell
   docker logs kentkonut-frontend-fixed
   # Should NOT show "host not found" errors
   ```

3. **Test Frontend Access**
   ```powershell
   curl http://172.41.42.51:3020/health
   # Should return "healthy"
   ```

4. **Test API Proxy**
   ```powershell
   curl http://172.41.42.51:3020/api/health
   # Should proxy to backend successfully
   ```

This comprehensive fix addresses the hostname resolution issue and provides better stability for your KentKonut deployment.
