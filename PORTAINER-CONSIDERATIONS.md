# Portainer-Specific Considerations for KentKonut

Important considerations and best practices when deploying KentKonut through Portainer.

## 🌐 **Network Configuration**

### **Bridge Network Benefits**
- ✅ **Isolation**: Services are isolated from host network
- ✅ **Security**: Database and Redis not exposed externally
- ✅ **Simplicity**: No complex subnet configurations
- ✅ **Compatibility**: Works with existing applications on host

### **Named Network**
```yaml
networks:
  kentkonut-network:
    driver: bridge
    name: kentkonut-prod-network
```
- **Explicit naming** prevents Portainer auto-generated names
- **Consistent** across stack updates
- **Easier management** in Portainer UI

## 💾 **Volume Management**

### **Named Volumes Strategy**
```yaml
volumes:
  postgres_data:
    driver: local
    name: kentkonut_postgres_data
  redis_data:
    driver: local
    name: kentkonut_redis_data
  banner_uploads:
    driver: local
    name: kentkonut_banner_uploads
```

### **Benefits of Named Volumes**
- ✅ **Persistent**: Data survives container restarts
- ✅ **Portable**: Can be backed up and restored
- ✅ **Visible**: Easy to manage in Portainer UI
- ✅ **Consistent**: Same names across deployments

### **Volume Backup in Portainer**
1. Go to **"Volumes"** section
2. Select volume (e.g., `kentkonut_postgres_data`)
3. Use **"Browse"** to explore contents
4. Use **"Export"** for backup (if available)

## 🔧 **Environment Variables Best Practices**

### **Portainer Environment Variable Format**
```
Name: VARIABLE_NAME
Value: variable_value
```

### **Security Considerations**
- ✅ **No quotes needed** in Portainer UI (unlike command line)
- ✅ **Masked values** for sensitive data
- ✅ **Stack-scoped** variables
- ⚠️ **Visible in UI** to authorized users

### **Required vs Optional Variables**

**REQUIRED (Must be set):**
- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- `API_BASE_URL`
- `VITE_API_BASE_URL`
- `CORS_ORIGIN`

**OPTIONAL (Can be empty):**
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

## 🔄 **Stack Update Strategies**

### **Method 1: Editor Update**
1. Go to stack in Portainer
2. Click **"Editor"** tab
3. Modify YAML configuration
4. Click **"Update the stack"**

### **Method 2: Git Repository**
1. Store stack YAML in Git repository
2. Use Portainer's **"Git repository"** option
3. Automatic updates when repository changes

### **Method 3: Template**
1. Create custom template in Portainer
2. Deploy from template
3. Consistent deployments across environments

## 📊 **Monitoring in Portainer**

### **Container Health Monitoring**
- **Health checks** visible in container list
- **Resource usage** graphs available
- **Log streaming** in real-time
- **Event history** for troubleshooting

### **Stack-Level Monitoring**
- **Service status** overview
- **Network connectivity** visualization
- **Volume usage** statistics
- **Port mapping** verification

## 🚨 **Common Portainer Issues & Solutions**

### **Issue 1: Stack Deployment Fails**
**Symptoms:**
- Red error message in Portainer
- Containers not starting

**Solutions:**
1. **Check YAML syntax** - Use online YAML validator
2. **Verify environment variables** - Ensure all required vars are set
3. **Check port conflicts** - Ensure ports 3020/3021 are available
4. **Review logs** - Check Portainer logs and container logs

### **Issue 2: Environment Variables Not Working**
**Symptoms:**
- Containers start but application doesn't work
- Authentication redirects to localhost

**Solutions:**
1. **Verify variable names** - Check for typos
2. **Check variable values** - Ensure correct URLs and passwords
3. **Restart stack** - Sometimes variables need container restart
4. **Use container console** - Check env vars inside container

### **Issue 3: Network Connectivity Issues**
**Symptoms:**
- Backend can't connect to database
- Frontend can't reach backend

**Solutions:**
1. **Check network configuration** - Verify all services in same network
2. **Verify service names** - Use container names for internal communication
3. **Check depends_on** - Ensure proper startup order
4. **Review health checks** - Ensure services are healthy

### **Issue 4: Volume Permissions**
**Symptoms:**
- Database won't start
- File upload errors

**Solutions:**
1. **Check volume mounts** - Verify correct paths
2. **Container permissions** - May need to adjust user/group
3. **Host permissions** - Check Docker daemon permissions
4. **SELinux/AppArmor** - May need security context adjustments

## 🔒 **Security Best Practices**

### **Portainer Access Control**
- ✅ **Role-based access** - Limit who can deploy stacks
- ✅ **Environment isolation** - Separate dev/prod environments
- ✅ **Audit logging** - Track deployment changes
- ✅ **Secret management** - Use Portainer secrets for sensitive data

### **Container Security**
- ✅ **Non-root users** - Run containers as non-root when possible
- ✅ **Read-only filesystems** - Where applicable
- ✅ **Resource limits** - Prevent resource exhaustion
- ✅ **Network policies** - Restrict unnecessary communication

### **Data Protection**
- ✅ **Volume encryption** - Encrypt sensitive data volumes
- ✅ **Regular backups** - Automated backup procedures
- ✅ **Access logging** - Monitor data access
- ✅ **Retention policies** - Define data retention rules

## 📈 **Performance Optimization**

### **Resource Allocation**
```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

### **Health Check Optimization**
- **Reasonable intervals** - Not too frequent
- **Appropriate timeouts** - Allow for slow starts
- **Proper retry counts** - Balance reliability vs speed

### **Image Management**
- ✅ **Use specific tags** - Avoid `latest` in production
- ✅ **Regular updates** - Keep images current
- ✅ **Image cleanup** - Remove unused images
- ✅ **Registry caching** - Use local registry if possible

## 🔄 **Backup & Recovery**

### **Automated Backup Strategy**
1. **Database backups** - Daily automated dumps
2. **Volume snapshots** - Weekly volume backups
3. **Configuration backup** - Stack YAML and env vars
4. **Testing restores** - Regular recovery testing

### **Disaster Recovery**
1. **Documentation** - Keep deployment docs updated
2. **Recovery procedures** - Tested step-by-step guides
3. **Monitoring** - Automated failure detection
4. **Rollback plans** - Quick rollback procedures

---

These considerations ensure a robust, secure, and maintainable KentKonut deployment through Portainer.
