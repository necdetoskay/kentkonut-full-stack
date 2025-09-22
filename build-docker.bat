@echo off
setlocal enabledelayedexpansion

REM KentKonut Backend Docker Build Script for Windows
REM This script builds the Docker image and sets up the complete environment

echo.
echo ================================================
echo 🚀 Building KentKonut Backend Docker Image...
echo ================================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

echo [SUCCESS] Docker is running
echo.

REM Create necessary directories for persistent data
echo [INFO] Creating persistent data directories...
if not exist "kentkonut_db_data\postgres" mkdir "kentkonut_db_data\postgres"
if not exist "kentkonut_db_data\kentkonut_backend\uploads" mkdir "kentkonut_db_data\kentkonut_backend\uploads"
if not exist "kentkonut_db_data\kentkonut_backend\media" mkdir "kentkonut_db_data\kentkonut_backend\media"
if not exist "kentkonut_db_data\kentkonut_backend\banners" mkdir "kentkonut_db_data\kentkonut_backend\banners"
if not exist "kentkonut_db_data\kentkonut_backend\haberler" mkdir "kentkonut_db_data\kentkonut_backend\haberler"
if not exist "kentkonut_db_data\kentkonut_backend\hafriyat" mkdir "kentkonut_db_data\kentkonut_backend\hafriyat"
if not exist "kentkonut_db_data\kentkonut_backend\kurumsal" mkdir "kentkonut_db_data\kentkonut_backend\kurumsal"
if not exist "kentkonut_db_data\kentkonut_backend\services" mkdir "kentkonut_db_data\kentkonut_backend\services"
if not exist "kentkonut_db_data\kentkonut_backend\proje" mkdir "kentkonut_db_data\kentkonut_backend\proje"
if not exist "kentkonut_db_data\kentkonut_backend\logs" mkdir "kentkonut_db_data\kentkonut_backend\logs"
if not exist "kentkonut_db_data\kentkonut_backend\backups" mkdir "kentkonut_db_data\kentkonut_backend\backups"

echo [SUCCESS] Persistent data directories created
echo.

REM Stop and remove existing containers if they exist
echo [INFO] Stopping existing containers...
docker-compose down --remove-orphans 2>nul

REM Remove existing image to ensure fresh build
echo [INFO] Removing existing Docker image...
docker rmi kentkonut-backend:latest 2>nul

REM Build the Docker image
echo [INFO] Building Docker image...
cd kentkonut-backend
docker build -t kentkonut-backend:latest -f Dockerfile .
if errorlevel 1 (
    echo [ERROR] Docker build failed
    cd ..
    pause
    exit /b 1
)
cd ..

echo [SUCCESS] Docker image built successfully
echo.

REM Start the services
echo [INFO] Starting services with docker-compose...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)

echo [SUCCESS] Services started successfully
echo.

REM Wait for services to be healthy
echo [INFO] Waiting for services to be healthy...
timeout /t 10 /nobreak >nul

echo [INFO] Checking service health...

REM Check PostgreSQL
docker-compose exec postgresql pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    echo [WARNING] PostgreSQL is not ready yet
) else (
    echo [SUCCESS] PostgreSQL is healthy
)

REM Check Redis
docker-compose exec redis redis-cli ping >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Redis is not ready yet
) else (
    echo [SUCCESS] Redis is healthy
)

REM Wait a bit more for backend to start
echo [INFO] Waiting for backend to start...
timeout /t 20 /nobreak >nul

REM Check backend health
set PORT_VAR=%PORT%
if "%PORT_VAR%"=="" set PORT_VAR=3010
curl -f http://localhost:%PORT_VAR%/api/health >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Backend is not ready yet, it may take a few more moments
) else (
    echo [SUCCESS] Backend is healthy
)

echo.
echo ================================================
echo [SUCCESS] KentKonut Backend Docker setup completed!
echo.
echo 🌐 Application URLs:
echo    - Backend: http://localhost:%PORT_VAR%
echo    - Login: http://localhost:%PORT_VAR%/auth/login
echo    - Dashboard: http://localhost:%PORT_VAR%/dashboard
echo    - Settings: http://localhost:%PORT_VAR%/dashboard/settings
echo    - Health Check: http://localhost:%PORT_VAR%/api/health
echo.
echo 👤 Admin Credentials:
echo    - Email: admin@example.com
echo    - Password: Admin123!
echo.
echo 🔧 Useful Commands:
echo    - View logs: docker-compose logs -f backend
echo    - Stop services: docker-compose down
echo    - Restart services: docker-compose restart
echo    - View all containers: docker-compose ps
echo.
echo [INFO] Setup complete! You can now access the application.
echo.
pause
