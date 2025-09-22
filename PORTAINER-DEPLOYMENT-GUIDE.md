# KentKonut Portainer Deployment Guide

Complete step-by-step guide for deploying KentKonut through Portainer's web interface.

## 🎯 **Deployment Overview**

- **Host**: 172.41.42.51
- **Frontend**: Port 3020 (External Access)
- **Backend**: Port 3021 (External Access)
- **PostgreSQL**: Internal only (Secure)
- **Redis**: Internal only (Secure)

## 📋 **Prerequisites**

1. ✅ Portainer installed and accessible
2. ✅ Docker Engine running on host 172.41.42.51
3. ✅ Ports 3020 and 3021 available on host
4. ✅ Internet access for pulling Docker images

## 🚀 **Step-by-Step Deployment**

### **Step 1: Access Portainer**

1. Open your web browser
2. Navigate to your Portainer instance (e.g., `http://172.41.42.51:9000`)
3. Log in with your Portainer credentials

### **Step 2: Create New Stack**

1. In Portainer dashboard, click **"Stacks"** in the left sidebar
2. Click **"+ Add stack"** button
3. Enter stack name: `kentkonut-production`
4. Select **"Web editor"** option

### **Step 3: Configure Docker Compose**

1. **Copy the entire content** from `portainer-stack.yml` file
2. **Paste it** into the Web editor text area
3. **Verify** the YAML formatting is correct (no extra spaces/tabs)

### **Step 4: Configure Environment Variables**

1. Scroll down to **"Environment variables"** section
2. Click **"+ Add an environment variable"** for each variable
3. **Add the following variables** (replace with your secure values):

```
Name: POSTGRES_PASSWORD
Value: YourSecurePostgresPassword123!

Name: REDIS_PASSWORD  
Value: YourSecureRedisPassword456!

Name: NEXTAUTH_URL
Value: http://172.41.42.51:3021

Name: NEXTAUTH_SECRET
Value: your-super-secure-nextauth-secret-key-minimum-32-characters-long

Name: JWT_SECRET
Value: your-super-secure-jwt-secret-key-minimum-32-characters-long

Name: API_BASE_URL
Value: http://172.41.42.51:3021

Name: VITE_API_BASE_URL
Value: http://172.41.42.51:3021

Name: CORS_ORIGIN
Value: http://172.41.42.51:3020,http://localhost:3020
```

**Optional Email Variables** (if you want email functionality):
```
Name: SMTP_HOST
Value: smtp.gmail.com

Name: SMTP_PORT
Value: 587

Name: SMTP_USER
Value: your-email@gmail.com

Name: SMTP_PASS
Value: your-app-password
```

### **Step 5: Deploy Stack**

1. **Review** all configurations
2. Click **"Deploy the stack"** button
3. **Wait** for deployment to complete (2-5 minutes)
4. **Monitor** the deployment progress in Portainer

### **Step 6: Verify Deployment**

1. Go to **"Containers"** section in Portainer
2. **Check** that all 4 containers are running:
   - ✅ `kentkonut-postgres` (Running)
   - ✅ `kentkonut-redis` (Running)
   - ✅ `kentkonut-backend` (Running)
   - ✅ `kentkonut-frontend` (Running)

3. **Test access URLs**:
   - Frontend: `http://172.41.42.51:3020`
   - Backend: `http://172.41.42.51:3021`
   - API Health: `http://172.41.42.51:3021/api/health`

## 🔧 **Portainer-Specific Configurations**

### **Network Management**

- **Network Name**: `kentkonut-prod-network`
- **Driver**: Bridge (default)
- **Scope**: Local to this stack
- **Isolation**: Database and Redis are isolated from external access

### **Volume Management**

Portainer will create these named volumes:
- `kentkonut_postgres_data` - Database storage
- `kentkonut_redis_data` - Redis cache storage  
- `kentkonut_banner_uploads` - Banner image storage

### **Container Health Monitoring**

Portainer will show health status for:
- **PostgreSQL**: Database connection health
- **Redis**: Cache service health
- **Backend**: Application health (if health endpoint works)

## 🛠️ **Troubleshooting in Portainer**

### **API Connection Issues**

If you see "Failed to fetch" or "net::ERR_BLOCKED_BY_CLIENT" errors:

1. **Check Environment Variables**:
   - Go to stack `kentkonut-production`
   - Click **"Editor"** tab
   - Verify `VITE_API_BASE_URL=http://172.41.42.51:3021`

2. **Test API Connection**:
   - Open `debug-api-connection.html` in browser
   - Run connection tests to verify backend accessibility
   - Check which URLs are working

3. **Verify Container Environment**:
   - Go to `kentkonut-frontend` container
   - Click **"Inspect"** tab
   - Check environment variables are correctly set

### **Check Container Logs**

1. Go to **"Containers"** section
2. Click on container name (e.g., `kentkonut-backend`)
3. Click **"Logs"** tab
4. Review error messages

### **Check Container Stats**

1. In container details, click **"Stats"** tab
2. Monitor CPU, Memory, Network usage
3. Look for resource constraints

### **Restart Services**

1. Select problematic container
2. Click **"Restart"** button
3. Monitor logs for startup issues

### **Update Stack**

1. Go to **"Stacks"** section
2. Click on `kentkonut-production` stack
3. Click **"Editor"** tab
4. Make changes and click **"Update the stack"**

## 🔒 **Security Verification**

### **Verify Internal Services**

These should **NOT** be accessible externally:
- ❌ `http://172.41.42.51:5432` (PostgreSQL - should fail)
- ❌ `http://172.41.42.51:6379` (Redis - should fail)

### **Verify External Services**

These should be accessible:
- ✅ `http://172.41.42.51:3020` (Frontend)
- ✅ `http://172.41.42.51:3021` (Backend)

## 📊 **Monitoring & Maintenance**

### **Regular Checks**

1. **Weekly**: Check container health in Portainer
2. **Monthly**: Review logs for errors
3. **Quarterly**: Update Docker images

### **Backup Procedures**

1. **Database Backup**:
   - Go to container `kentkonut-postgres`
   - Use **"Console"** to run: `pg_dump -U postgres kentkonutdb > backup.sql`

2. **Volume Backup**:
   - Use Portainer's volume export feature
   - Download volume data for safekeeping

### **Update Procedures**

1. **Pull Latest Images**:
   - Go to **"Images"** section
   - Pull `necdetoskay/kentkonut-frontend:latest`
   - Pull `necdetoskay/kentkonut-backend:latest`

2. **Update Stack**:
   - Go to stack editor
   - Click **"Pull and redeploy"**

## 🚨 **Emergency Procedures**

### **Quick Restart**
1. Go to stack `kentkonut-production`
2. Click **"Stop"** then **"Start"**

### **Emergency Stop**
1. Go to **"Containers"** section
2. Select all KentKonut containers
3. Click **"Stop"** button

### **Complete Reset**
1. Stop and remove stack
2. Delete volumes (⚠️ **WARNING**: This deletes all data)
3. Redeploy from scratch

---

## ✅ **Success Indicators**

After successful deployment, you should see:

- ✅ All 4 containers running in Portainer
- ✅ Frontend accessible at `http://172.41.42.51:3020`
- ✅ Backend accessible at `http://172.41.42.51:3021`
- ✅ Database and Redis NOT accessible externally
- ✅ No error logs in container logs
- ✅ Application functioning normally

**Deployment Complete!** 🎉
