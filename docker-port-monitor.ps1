# Docker Port Monitoring Script for KentKonut Frontend
# Monitors port mappings and logs when they disappear

param(
    [string]$ContainerName = "kentkonut-frontend-prod",
    [int]$ExpectedPort = 3020,
    [int]$CheckInterval = 30,
    [string]$LogFile = "port-monitor.log"
)

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    Write-Host $logEntry
    Add-Content -Path $LogFile -Value $logEntry
}

function Get-ContainerPortMapping {
    param([string]$Container)
    try {
        $portInfo = docker port $Container 2>$null
        return $portInfo
    }
    catch {
        return $null
    }
}

function Get-ContainerStatus {
    param([string]$Container)
    try {
        $status = docker inspect $Container --format '{{.State.Status}}' 2>$null
        return $status
    }
    catch {
        return "not_found"
    }
}

function Get-ContainerRestartCount {
    param([string]$Container)
    try {
        $restarts = docker inspect $Container --format '{{.RestartCount}}' 2>$null
        return [int]$restarts
    }
    catch {
        return -1
    }
}

function Check-PortConflicts {
    param([int]$Port)
    try {
        $netstat = netstat -an | Select-String ":$Port "
        return $netstat
    }
    catch {
        return $null
    }
}

Write-Log "Starting Docker Port Monitor for container: $ContainerName"
Write-Log "Expected port mapping: $ExpectedPort"
Write-Log "Check interval: $CheckInterval seconds"

$lastRestartCount = -1
$consecutiveFailures = 0

while ($true) {
    $containerStatus = Get-ContainerStatus -Container $ContainerName
    $portMapping = Get-ContainerPortMapping -Container $ContainerName
    $restartCount = Get-ContainerRestartCount -Container $ContainerName
    
    # Check if container exists and is running
    if ($containerStatus -eq "not_found") {
        Write-Log "ERROR: Container '$ContainerName' not found!"
        $consecutiveFailures++
    }
    elseif ($containerStatus -ne "running") {
        Write-Log "WARNING: Container '$ContainerName' status: $containerStatus"
        $consecutiveFailures++
    }
    else {
        # Container is running, check port mapping
        if ($portMapping -and $portMapping -match "$ExpectedPort/tcp") {
            Write-Log "OK: Port mapping active - $portMapping"
            $consecutiveFailures = 0
        }
        else {
            Write-Log "ERROR: Port mapping missing! Expected port $ExpectedPort not found"
            Write-Log "Current port mappings: $portMapping"
            
            # Check for port conflicts
            $conflicts = Check-PortConflicts -Port $ExpectedPort
            if ($conflicts) {
                Write-Log "Port conflict detected on $ExpectedPort : $conflicts"
            }
            
            $consecutiveFailures++
        }
    }
    
    # Check for container restarts
    if ($lastRestartCount -ne -1 -and $restartCount -gt $lastRestartCount) {
        Write-Log "ALERT: Container restarted! Restart count: $restartCount (was $lastRestartCount)"
    }
    $lastRestartCount = $restartCount
    
    # Alert on consecutive failures
    if ($consecutiveFailures -ge 3) {
        Write-Log "CRITICAL: $consecutiveFailures consecutive failures detected!"
        
        # Collect additional diagnostic info
        Write-Log "=== DIAGNOSTIC INFO ==="
        Write-Log "Docker daemon status:"
        try {
            $dockerInfo = docker info --format "{{.ServerVersion}}" 2>$null
            Write-Log "Docker version: $dockerInfo"
        }
        catch {
            Write-Log "ERROR: Cannot connect to Docker daemon"
        }
        
        Write-Log "Container logs (last 10 lines):"
        try {
            $logs = docker logs --tail 10 $ContainerName 2>$null
            Write-Log $logs
        }
        catch {
            Write-Log "ERROR: Cannot retrieve container logs"
        }
        
        Write-Log "Network information:"
        try {
            $networks = docker network ls
            Write-Log $networks
        }
        catch {
            Write-Log "ERROR: Cannot retrieve network information"
        }
        
        Write-Log "=== END DIAGNOSTIC INFO ==="
    }
    
    Start-Sleep -Seconds $CheckInterval
}
