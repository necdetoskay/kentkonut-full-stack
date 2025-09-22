# KentKonut API Connection Fix Guide

Complete guide to fix "Failed to fetch" and "net::ERR_BLOCKED_BY_CLIENT" errors in KentKonut frontend.

## 🔍 **Problem Analysis**

### **Root Causes Identified:**

1. **Incorrect API Base URL**: Frontend trying to connect to `localhost:3010` instead of `172.41.42.51:3021`
2. **Environment Variables**: Not properly set in Portainer deployment
3. **Frontend Configuration**: ports.json using wrong URLs for production
4. **Docker Image**: Built with wrong API URLs

## 🛠️ **Solution Steps**

### **Step 1: Update Frontend Configuration**

The `kentkonut-frontend/src/config/ports.json` has been updated:

```json
{
  "production": {
    "backend": {
      "port": "3021",
      "url": "http://172.41.42.51:3021"
    },
    "frontend": {
      "port": "3020", 
      "url": "http://172.41.42.51:3020"
    }
  }
}
```

### **Step 2: Rebuild Docker Images**

**Option A: Use the rebuild script**
```bash
chmod +x rebuild-and-push-images.sh
./rebuild-and-push-images.sh all
```

**Option B: Manual rebuild**
```bash
# Frontend with correct API URL
cd kentkonut-frontend
docker build \
  --build-arg VITE_API_BASE_URL=http://172.41.42.51:3021 \
  -t necdetoskay/kentkonut-frontend:latest .

# Push to Docker Hub
docker push necdetoskay/kentkonut-frontend:latest
```

### **Step 3: Update Portainer Stack**

1. **Go to Portainer** → Stacks → `kentkonut-production`
2. **Click "Editor"** tab
3. **Verify Environment Variables**:
   ```yaml
   environment:
     - VITE_API_BASE_URL=http://172.41.42.51:3021
     - FRONTEND_PORT=3020
     - BACKEND_PORT=3021
     - VITE_NODE_ENV=production
   ```
4. **Click "Update the stack"**
5. **Check "Pull and redeploy"** to get latest images

### **Step 4: Verify Environment Variables in Portainer**

Ensure these variables are set in Portainer's Environment Variables section:

```
VITE_API_BASE_URL=http://172.41.42.51:3021
API_BASE_URL=http://172.41.42.51:3021
CORS_ORIGIN=http://172.41.42.51:3020,http://localhost:3020
FRONTEND_PORT=3020
BACKEND_PORT=3021
```

### **Step 5: Test API Connection**

1. **Open the debug tool**: `debug-api-connection.html`
2. **Run connection tests**
3. **Verify all endpoints return 200 OK**

## 🔧 **Troubleshooting Steps**

### **If Frontend Still Uses Wrong URL:**

1. **Check Container Environment**:
   ```bash
   # In Portainer, go to kentkonut-frontend container
   # Click "Console" → "Connect"
   # Run: env | grep VITE
   ```

2. **Verify Build Args**:
   ```bash
   # Check if image was built with correct args
   docker inspect necdetoskay/kentkonut-frontend:latest
   ```

3. **Force Container Restart**:
   ```bash
   # In Portainer: Containers → kentkonut-frontend → Restart
   ```

### **If Backend is Not Accessible:**

1. **Check Backend Container**:
   ```bash
   # Test backend directly
   curl http://172.41.42.51:3021/api/health
   ```

2. **Check Backend Logs**:
   ```bash
   # In Portainer: Containers → kentkonut-backend → Logs
   ```

3. **Verify CORS Configuration**:
   ```bash
   # Check backend environment variables
   # CORS_ORIGIN should include frontend URL
   ```

### **If Browser Blocks Requests:**

1. **Check Browser Console** for specific error messages
2. **Disable Ad Blockers** temporarily
3. **Try Different Browser** to isolate browser-specific issues
4. **Check Network Tab** in DevTools for failed requests

## 🧪 **Testing Checklist**

### **✅ Pre-Deployment Tests**
- [ ] Frontend image built with correct `VITE_API_BASE_URL`
- [ ] Backend container accessible on port 3021
- [ ] Environment variables set in Portainer
- [ ] CORS configuration includes frontend URL

### **✅ Post-Deployment Tests**
- [ ] Frontend loads without console errors
- [ ] API health check returns 200 OK
- [ ] Banner carousel loads images
- [ ] Projects section shows data
- [ ] Services section shows data
- [ ] News section shows data

### **✅ Network Tests**
- [ ] `curl http://172.41.42.51:3021/api/health` works
- [ ] `curl http://172.41.42.51:3020` serves frontend
- [ ] No CORS errors in browser console
- [ ] No "Failed to fetch" errors

## 🔄 **Quick Fix Commands**

### **Immediate Fix (if images are already updated):**
```bash
# In Portainer:
# 1. Go to Stacks → kentkonut-production
# 2. Click "Editor"
# 3. Click "Pull and redeploy"
# 4. Wait for deployment to complete
```

### **Force Frontend Restart:**
```bash
# In Portainer:
# 1. Go to Containers
# 2. Select kentkonut-frontend
# 3. Click "Restart"
```

### **Check API Connection:**
```bash
# Test from host machine
curl -v http://172.41.42.51:3021/api/health
curl -v http://172.41.42.51:3021/api/public/banners/position/1
```

## 📊 **Expected Results**

After applying these fixes:

1. **Frontend Console**: No "Failed to fetch" errors
2. **API Requests**: All return 200 OK status
3. **Data Loading**: Banners, projects, services, news load correctly
4. **Network Tab**: Shows successful API calls to `172.41.42.51:3021`

## 🚨 **Emergency Rollback**

If issues persist:

1. **Revert to Previous Version**:
   ```yaml
   # In Portainer stack editor, change:
   image: necdetoskay/kentkonut-frontend:1.9.0
   ```

2. **Use Debug Mode**:
   ```yaml
   # Add debug environment variable:
   - VITE_DEBUG=true
   ```

3. **Check Logs**:
   ```bash
   # Monitor all container logs in Portainer
   ```

---

## ✅ **Success Indicators**

- ✅ No console errors in browser
- ✅ All API endpoints return data
- ✅ Frontend shows dynamic content
- ✅ No network request failures
- ✅ CORS headers present in responses

This guide should resolve all API connection issues between the KentKonut frontend and backend.
