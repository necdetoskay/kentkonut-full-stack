# Docker Diagnostics Script for KentKonut Port Issues
# Comprehensive diagnostic tool for troubleshooting port mapping problems

param(
    [string]$ContainerName = "kentkonut-frontend-prod",
    [int]$ExpectedPort = 3020,
    [string]$OutputFile = "docker-diagnostics-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
)

function Write-Output {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    Write-Host $logEntry
    Add-Content -Path $OutputFile -Value $logEntry
}

function Get-Section {
    param([string]$Title)
    $separator = "=" * 60
    Write-Output ""
    Write-Output $separator
    Write-Output $Title
    Write-Output $separator
}

Write-Output "KentKonut Docker Diagnostics Report"
Write-Output "Container: $ContainerName"
Write-Output "Expected Port: $ExpectedPort"

# 1. Docker System Information
Get-Section "DOCKER SYSTEM INFORMATION"
try {
    $dockerVersion = docker version --format json | ConvertFrom-Json
    Write-Output "Docker Client Version: $($dockerVersion.Client.Version)"
    Write-Output "Docker Server Version: $($dockerVersion.Server.Version)"
    
    $dockerInfo = docker system info --format json | ConvertFrom-Json
    Write-Output "Docker Root Dir: $($dockerInfo.DockerRootDir)"
    Write-Output "Storage Driver: $($dockerInfo.Driver)"
    Write-Output "Containers Running: $($dockerInfo.ContainersRunning)"
    Write-Output "Images: $($dockerInfo.Images)"
}
catch {
    Write-Output "ERROR: Cannot retrieve Docker system information - $($_.Exception.Message)"
}

# 2. Container Status and Configuration
Get-Section "CONTAINER STATUS AND CONFIGURATION"
try {
    $containerExists = docker ps -a --filter "name=$ContainerName" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    Write-Output "Container Status:"
    Write-Output $containerExists
    
    if ($containerExists -match $ContainerName) {
        $containerDetails = docker inspect $ContainerName | ConvertFrom-Json
        $container = $containerDetails[0]
        
        Write-Output ""
        Write-Output "Container Details:"
        Write-Output "  ID: $($container.Id.Substring(0,12))"
        Write-Output "  Status: $($container.State.Status)"
        Write-Output "  Started At: $($container.State.StartedAt)"
        Write-Output "  Restart Count: $($container.RestartCount)"
        Write-Output "  Exit Code: $($container.State.ExitCode)"
        
        if ($container.State.Status -ne "running") {
            Write-Output "  Error: $($container.State.Error)"
        }
        
        Write-Output ""
        Write-Output "Port Bindings:"
        if ($container.NetworkSettings.Ports) {
            $container.NetworkSettings.Ports.PSObject.Properties | ForEach-Object {
                $port = $_.Name
                $bindings = $_.Value
                if ($bindings) {
                    foreach ($binding in $bindings) {
                        Write-Output "  $port -> $($binding.HostIp):$($binding.HostPort)"
                    }
                } else {
                    Write-Output "  $port -> (not bound)"
                }
            }
        } else {
            Write-Output "  No port bindings found"
        }
        
        Write-Output ""
        Write-Output "Network Settings:"
        Write-Output "  Network Mode: $($container.HostConfig.NetworkMode)"
        if ($container.NetworkSettings.Networks) {
            $container.NetworkSettings.Networks.PSObject.Properties | ForEach-Object {
                $networkName = $_.Name
                $network = $_.Value
                Write-Output "  Network '$networkName':"
                Write-Output "    IP Address: $($network.IPAddress)"
                Write-Output "    Gateway: $($network.Gateway)"
            }
        }
    }
}
catch {
    Write-Output "ERROR: Cannot retrieve container information - $($_.Exception.Message)"
}

# 3. Port Conflicts and Network Analysis
Get-Section "PORT CONFLICTS AND NETWORK ANALYSIS"
try {
    Write-Output "Checking port $ExpectedPort for conflicts:"
    $netstatResult = netstat -an | Select-String ":$ExpectedPort"
    if ($netstatResult) {
        Write-Output "Port $ExpectedPort is in use:"
        $netstatResult | ForEach-Object { Write-Output "  $_" }
    } else {
        Write-Output "Port $ExpectedPort appears to be free"
    }
    
    Write-Output ""
    Write-Output "All Docker port mappings:"
    $allContainers = docker ps --format "table {{.Names}}\t{{.Ports}}"
    Write-Output $allContainers
}
catch {
    Write-Output "ERROR: Cannot analyze port conflicts - $($_.Exception.Message)"
}

# 4. Docker Compose Analysis
Get-Section "DOCKER COMPOSE ANALYSIS"
try {
    $composeFiles = @(
        "docker-compose.yml",
        "docker-compose.production.yml",
        "docker-compose.hub.yml",
        "portainer-stack.yml"
    )
    
    foreach ($file in $composeFiles) {
        if (Test-Path $file) {
            Write-Output "Found compose file: $file"
            $content = Get-Content $file | Select-String -Pattern "ports:|$ExpectedPort"
            if ($content) {
                Write-Output "  Port configurations in $file :"
                $content | ForEach-Object { Write-Output "    $($_.Line.Trim())" }
            }
        }
    }
}
catch {
    Write-Output "ERROR: Cannot analyze Docker Compose files - $($_.Exception.Message)"
}

# 5. Container Logs
Get-Section "CONTAINER LOGS (LAST 50 LINES)"
try {
    if (docker ps -a --filter "name=$ContainerName" --format "{{.Names}}" | Select-String $ContainerName) {
        $logs = docker logs --tail 50 $ContainerName 2>&1
        Write-Output $logs
    } else {
        Write-Output "Container $ContainerName not found for log retrieval"
    }
}
catch {
    Write-Output "ERROR: Cannot retrieve container logs - $($_.Exception.Message)"
}

# 6. Docker Events (if available)
Get-Section "RECENT DOCKER EVENTS"
try {
    Write-Output "Recent Docker events for container $ContainerName :"
    $events = docker events --filter "container=$ContainerName" --since "1h" --until "now" 2>$null
    if ($events) {
        Write-Output $events
    } else {
        Write-Output "No recent events found for container $ContainerName"
    }
}
catch {
    Write-Output "ERROR: Cannot retrieve Docker events - $($_.Exception.Message)"
}

# 7. System Resources
Get-Section "SYSTEM RESOURCES"
try {
    Write-Output "Docker system resource usage:"
    $dockerStats = docker system df
    Write-Output $dockerStats
    
    Write-Output ""
    Write-Output "System memory and disk:"
    $memory = Get-WmiObject -Class Win32_OperatingSystem
    $totalMemory = [math]::Round($memory.TotalVisibleMemorySize / 1MB, 2)
    $freeMemory = [math]::Round($memory.FreePhysicalMemory / 1MB, 2)
    Write-Output "  Total Memory: $totalMemory GB"
    Write-Output "  Free Memory: $freeMemory GB"
    
    $disk = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
    $totalDisk = [math]::Round($disk.Size / 1GB, 2)
    $freeDisk = [math]::Round($disk.FreeSpace / 1GB, 2)
    Write-Output "  Total Disk (C:): $totalDisk GB"
    Write-Output "  Free Disk (C:): $freeDisk GB"
}
catch {
    Write-Output "ERROR: Cannot retrieve system resources - $($_.Exception.Message)"
}

Write-Output ""
Write-Output "Diagnostics complete. Report saved to: $OutputFile"
