# KentKonut Frontend Port Mapping Debugging Guide

## Quick Diagnostic Commands

### 1. Immediate Status Check
```powershell
# Check if container is running and port is mapped
docker ps --filter "name=kentkonut-frontend-prod"

# Check specific port mapping
docker port kentkonut-frontend-prod

# Check container status and restart count
docker inspect kentkonut-frontend-prod --format '{{.State.Status}} - Restarts: {{.RestartCount}}'
```

### 2. Port Conflict Detection
```powershell
# Check what's using port 3020
netstat -an | findstr ":3020"

# Check all Docker port mappings
docker ps --format "table {{.Names}}\t{{.Ports}}"

# Check for port conflicts with other services
Get-Process | Where-Object {$_.ProcessName -like "*docker*" -or $_.ProcessName -like "*nginx*" -or $_.ProcessName -like "*apache*"}
```

### 3. Container Health Analysis
```powershell
# Check container logs for errors
docker logs --tail 50 kentkonut-frontend-prod

# Check container resource usage
docker stats kentkonut-frontend-prod --no-stream

# Check container configuration
docker inspect kentkonut-frontend-prod | ConvertFrom-Json | Select-Object -ExpandProperty Config
```

## Step-by-Step Debugging Procedure

### Phase 1: Initial Assessment
1. **Verify Container Status**
   ```powershell
   docker ps -a --filter "name=kentkonut-frontend-prod"
   ```
   - If not running: Check why it stopped
   - If running but no ports: Port mapping issue

2. **Check Port Mapping**
   ```powershell
   docker port kentkonut-frontend-prod 3020
   ```
   - Should return: `0.0.0.0:3020`
   - If empty: Port mapping lost

3. **Verify Docker Compose Configuration**
   ```powershell
   # Check which compose file is being used
   docker-compose -f docker-compose.production.yml config | findstr -A5 -B5 "3020"
   ```

### Phase 2: Root Cause Analysis

#### A. Container Restart Investigation
```powershell
# Check restart count and last restart time
docker inspect kentkonut-frontend-prod --format '{{.RestartCount}} - {{.State.StartedAt}}'

# Check Docker events for restart reasons
docker events --filter container=kentkonut-frontend-prod --since 24h
```

#### B. Network Conflicts
```powershell
# Check Docker networks
docker network ls
docker network inspect kentkonut-prod-network

# Check for IP conflicts
docker inspect kentkonut-frontend-prod --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'
```

#### C. Resource Constraints
```powershell
# Check system resources
docker system df
docker system events --filter type=container --since 1h

# Check memory usage
docker stats --no-stream
```

### Phase 3: Advanced Diagnostics

#### A. Docker Daemon Issues
```powershell
# Check Docker daemon status
Get-Service docker
docker version

# Check Docker daemon logs (Windows)
Get-EventLog -LogName Application -Source Docker -Newest 50
```

#### B. Port Binding Analysis
```powershell
# Check what process is binding to port 3020
netstat -ano | findstr ":3020"

# If port is bound, find the process
Get-Process -Id <PID_FROM_NETSTAT>
```

#### C. Container Internal Issues
```powershell
# Execute shell inside container (if running)
docker exec -it kentkonut-frontend-prod sh

# Inside container, check if nginx is running on port 3020
# netstat -tlnp | grep 3020
# ps aux | grep nginx
```

## Common Issues and Solutions

### Issue 1: Container Keeps Restarting
**Symptoms:** High restart count, container status cycling
**Debugging:**
```powershell
docker logs kentkonut-frontend-prod --since 1h
docker inspect kentkonut-frontend-prod --format '{{.State.ExitCode}}'
```
**Common Causes:**
- Application crash inside container
- Health check failures
- Resource limits exceeded

### Issue 2: Port Already in Use
**Symptoms:** Port mapping fails, "port already allocated" error
**Debugging:**
```powershell
netstat -ano | findstr ":3020"
Get-Process -Id <PID> | Select-Object ProcessName, Path
```
**Solutions:**
- Kill conflicting process
- Change port mapping
- Restart Docker daemon

### Issue 3: Network Configuration Issues
**Symptoms:** Container runs but port not accessible externally
**Debugging:**
```powershell
docker network inspect kentkonut-prod-network
docker exec kentkonut-frontend-prod netstat -tlnp
```

### Issue 4: Docker Daemon Problems
**Symptoms:** Intermittent container failures, port mappings disappearing
**Debugging:**
```powershell
Get-Service docker
docker system info
Get-EventLog -LogName Application -Source Docker -Newest 20
```

## Emergency Recovery Commands

### Quick Container Restart
```powershell
# Stop and remove container
docker stop kentkonut-frontend-prod
docker rm kentkonut-frontend-prod

# Recreate from compose
docker-compose -f docker-compose.production.yml up -d frontend
```

### Force Port Release
```powershell
# Find process using port 3020
$process = netstat -ano | findstr ":3020" | ForEach-Object { ($_ -split '\s+')[4] }
if ($process) {
    Stop-Process -Id $process -Force
}
```

### Docker Daemon Restart (Last Resort)
```powershell
# Restart Docker service
Restart-Service docker
Start-Sleep 30
docker-compose -f docker-compose.production.yml up -d
```

## Monitoring Commands for Real-Time Tracking

### Continuous Port Monitoring
```powershell
# Monitor port status every 10 seconds
while ($true) {
    $timestamp = Get-Date -Format "HH:mm:ss"
    $port = docker port kentkonut-frontend-prod 3020 2>$null
    Write-Host "[$timestamp] Port 3020: $port"
    Start-Sleep 10
}
```

### Container Status Monitoring
```powershell
# Monitor container status and restart count
while ($true) {
    $status = docker inspect kentkonut-frontend-prod --format '{{.State.Status}} (Restarts: {{.RestartCount}})' 2>$null
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] Container: $status"
    Start-Sleep 30
}
```

## Log Analysis Tips

### Important Log Patterns to Watch For
- `bind: address already in use`
- `nginx: [emerg]`
- `Error: listen EADDRINUSE`
- `container killed`
- `OOMKilled`
- `network not found`

### Log Commands
```powershell
# Follow logs in real-time
docker logs -f kentkonut-frontend-prod

# Search for specific errors
docker logs kentkonut-frontend-prod 2>&1 | Select-String "error|fail|bind|address"

# Export logs for analysis
docker logs kentkonut-frontend-prod > frontend-logs-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt
```
