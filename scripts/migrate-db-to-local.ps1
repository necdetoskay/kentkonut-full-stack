# scripts/migrate-db-to-local.ps1
# PowerShell version of PostgreSQL migration script

param(
    [switch]$Force
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Configuration
$ContainerName = "kentkonut-postgres"
$DbName = "kentkonutdb"
$DbUser = "postgres"
$VolumeName = "kentkonut-full-stack_postgres_data"
$LocalDbDir = "kentkonut_db_data"
$BackupDir = "kentkonut-backend/backups/migration_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

Write-Host "🗄️ PostgreSQL Data Migration to Local Directory" -ForegroundColor $Blue
Write-Host "==================================================" -ForegroundColor $Blue

# Function to check if container is running
function Test-Container {
    $containerStatus = docker ps --filter "name=$ContainerName" --format "{{.Names}}"
    if (-not $containerStatus) {
        Write-Host "❌ PostgreSQL container is not running!" -ForegroundColor $Red
        Write-Host "💡 Please start containers first: docker-compose up -d" -ForegroundColor $Yellow
        exit 1
    }
    Write-Host "✅ PostgreSQL container is running" -ForegroundColor $Green
}

# Function to create backup
function New-Backup {
    Write-Host "💾 Creating comprehensive backup..." -ForegroundColor $Yellow
    
    # Create backup directory
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    
    # 1. SQL Dump backup
    Write-Host "📊 Creating SQL dump backup..." -ForegroundColor $Yellow
    $sqlBackupPath = "$BackupDir/kentkonutdb_backup.sql"
    docker exec $ContainerName pg_dump -U $DbUser $DbName | Out-File -FilePath $sqlBackupPath -Encoding UTF8
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SQL dump backup completed" -ForegroundColor $Green
    } else {
        Write-Host "❌ SQL dump backup failed" -ForegroundColor $Red
        exit 1
    }
    
    # 2. Volume data backup
    Write-Host "📁 Creating volume data backup..." -ForegroundColor $Yellow
    $volumeBackupDir = "$BackupDir/volume_backup"
    New-Item -ItemType Directory -Path $volumeBackupDir -Force | Out-Null
    
    docker run --rm -v "${VolumeName}:/source" -v "$(Get-Location)/$volumeBackupDir:/backup" alpine sh -c "cp -r /source/* /backup/ 2>/dev/null || true"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Volume data backup completed" -ForegroundColor $Green
    } else {
        Write-Host "❌ Volume data backup failed" -ForegroundColor $Red
        exit 1
    }
    
    # 3. Create backup info
    $backupInfo = @"
PostgreSQL Migration Backup
===========================
Date: $(Get-Date)
Container: $ContainerName
Database: $DbName
Volume: $VolumeName
Target Directory: $LocalDbDir

Backup Contents:
- kentkonutdb_backup.sql (SQL dump)
- volume_backup/ (raw PostgreSQL data files)

Migration Steps:
1. Stop containers
2. Create local directory
3. Copy volume data to local directory
4. Update docker-compose.yml
5. Start containers with new configuration
6. Verify data integrity
"@
    
    $backupInfo | Out-File -FilePath "$BackupDir/backup_info.txt" -Encoding UTF8
    
    Write-Host "✅ Comprehensive backup completed" -ForegroundColor $Green
    Write-Host "📁 Backup location: $BackupDir" -ForegroundColor $Green
}

# Function to create local directory
function New-LocalDirectory {
    Write-Host "📁 Creating local database directory..." -ForegroundColor $Yellow
    
    if (Test-Path $LocalDbDir) {
        Write-Host "⚠️ Directory $LocalDbDir already exists" -ForegroundColor $Yellow
        if (-not $Force) {
            $response = Read-Host "Do you want to remove it and continue? (y/N)"
            if ($response -ne "y" -and $response -ne "Y") {
                Write-Host "❌ Migration cancelled" -ForegroundColor $Red
                exit 1
            }
        }
        Remove-Item -Path $LocalDbDir -Recurse -Force
        Write-Host "🗑️ Removed existing directory" -ForegroundColor $Yellow
    }
    
    New-Item -ItemType Directory -Path $LocalDbDir -Force | Out-Null
    Write-Host "✅ Created directory: $LocalDbDir" -ForegroundColor $Green
}

# Function to migrate data
function Copy-DatabaseData {
    Write-Host "🔄 Migrating data from Docker volume to local directory..." -ForegroundColor $Yellow
    
    # Stop the backend container first (but keep postgres running for now)
    Write-Host "🛑 Stopping backend container..." -ForegroundColor $Yellow
    docker-compose stop backend
    
    # Copy data from volume to local directory
    Write-Host "📋 Copying PostgreSQL data..." -ForegroundColor $Yellow
    docker run --rm -v "${VolumeName}:/source" -v "$(Get-Location)/$LocalDbDir:/target" alpine sh -c "cp -r /source/* /target/"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Data migration completed" -ForegroundColor $Green
    } else {
        Write-Host "❌ Data migration failed" -ForegroundColor $Red
        exit 1
    }
    
    Write-Host "✅ Data migration completed successfully" -ForegroundColor $Green
}

# Function to update docker-compose
function Update-DockerCompose {
    Write-Host "⚙️ Updating docker-compose.yml configuration..." -ForegroundColor $Yellow
    
    # Create backup of current docker-compose.yml
    Copy-Item "docker-compose.yml" "docker-compose.yml.backup"
    Write-Host "✅ Created backup: docker-compose.yml.backup" -ForegroundColor $Green
    
    # Read the current docker-compose.yml
    $content = Get-Content "docker-compose.yml" -Raw
    
    # Update the postgresql service volume mount
    $content = $content -replace "postgres_data:/var/lib/postgresql/data", "./kentkonut_db_data:/var/lib/postgresql/data"
    
    # Remove the postgres_data volume definition
    $content = $content -replace "volumes:\s*\r?\n\s*postgres_data:\s*\r?\n\s*driver:\s*local\s*\r?\n?", ""
    
    # Write the updated content
    $content | Out-File -FilePath "docker-compose.yml" -Encoding UTF8 -NoNewline
    
    Write-Host "✅ Updated docker-compose.yml configuration" -ForegroundColor $Green
}

# Function to test migration
function Test-Migration {
    Write-Host "🧪 Testing migration..." -ForegroundColor $Yellow
    
    # Stop all containers
    Write-Host "🛑 Stopping all containers..." -ForegroundColor $Yellow
    docker-compose down
    
    # Start with new configuration
    Write-Host "🚀 Starting containers with new configuration..." -ForegroundColor $Yellow
    docker-compose up -d
    
    # Wait for database to be ready
    Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor $Yellow
    for ($i = 1; $i -le 30; $i++) {
        $dbReady = docker exec $ContainerName pg_isready -U $DbUser -d $DbName 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database is ready" -ForegroundColor $Green
            break
        }
        Write-Host "⏳ Waiting for database... (attempt $i/30)" -ForegroundColor $Yellow
        Start-Sleep -Seconds 2
    }
    
    # Test database connectivity
    Write-Host "🔍 Testing database connectivity..." -ForegroundColor $Yellow
    $pageCount = docker exec $ContainerName psql -U $DbUser -d $DbName -t -c "SELECT COUNT(*) FROM `"Page`";" 2>$null
    if ($LASTEXITCODE -eq 0) {
        $pageCount = $pageCount.Trim()
        Write-Host "✅ Database contains $pageCount pages" -ForegroundColor $Green
    } else {
        Write-Host "❌ Database connectivity test failed" -ForegroundColor $Red
        return $false
    }
    
    # Test backend API
    Write-Host "🔍 Testing backend API..." -ForegroundColor $Yellow
    Start-Sleep -Seconds 10  # Give backend time to start
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3010/api/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend API is responding" -ForegroundColor $Green
        } else {
            Write-Host "❌ Backend API test failed" -ForegroundColor $Red
            return $false
        }
    } catch {
        Write-Host "❌ Backend API test failed: $_" -ForegroundColor $Red
        return $false
    }
    
    Write-Host "✅ Migration test completed successfully" -ForegroundColor $Green
    return $true
}

# Main execution
function Start-Migration {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor $Yellow
    Test-Container
    
    Write-Host "📋 Migration Summary:" -ForegroundColor $Yellow
    Write-Host "  Source: Docker volume ($VolumeName)" -ForegroundColor White
    Write-Host "  Target: Local directory ($LocalDbDir)" -ForegroundColor White
    Write-Host "  Backup: $BackupDir" -ForegroundColor White
    Write-Host ""
    
    if (-not $Force) {
        $response = Read-Host "Do you want to proceed with the migration? (y/N)"
        if ($response -ne "y" -and $response -ne "Y") {
            Write-Host "Migration cancelled" -ForegroundColor $Yellow
            exit 0
        }
    }
    
    New-Backup
    New-LocalDirectory
    Copy-DatabaseData
    Update-DockerCompose
    $testResult = Test-Migration
    
    if ($testResult) {
        Write-Host ""
        Write-Host "🎉 Migration completed successfully!" -ForegroundColor $Green
        Write-Host "================================" -ForegroundColor $Green
        Write-Host "📁 Database data is now stored in: $LocalDbDir" -ForegroundColor $Blue
        Write-Host "💾 Backup available at: $BackupDir" -ForegroundColor $Blue
        Write-Host "🔧 Backend: http://localhost:3010" -ForegroundColor $Blue
        Write-Host ""
        Write-Host "💡 Next steps:" -ForegroundColor $Yellow
        Write-Host "   1. Verify all functionality works correctly" -ForegroundColor White
        Write-Host "   2. Test database operations" -ForegroundColor White
        Write-Host "   3. Remove backup files when satisfied" -ForegroundColor White
        Write-Host "   4. Consider adding $LocalDbDir to .gitignore" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Migration completed but tests failed!" -ForegroundColor $Red
        Write-Host "Please check the logs and consider using the rollback script" -ForegroundColor $Yellow
    }
}

# Run main function
Start-Migration
