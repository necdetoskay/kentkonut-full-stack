# KentKonut Backend Docker Setup Guide

This guide provides step-by-step instructions for building and running the KentKonut Backend application using Docker with automatic admin user creation and all latest fixes.

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Docker Compose installed (usually comes with Docker Desktop)
- At least 4GB of available RAM
- Ports 3010, 5433, and 6379 available on your system

### Option 1: Automated Setup (Recommended)

#### For Windows Users:
```bash
# Run the automated build script
./build-docker.bat
```

#### For Linux/Mac Users:
```bash
# Make the script executable
chmod +x build-docker.sh

# Run the automated build script
./build-docker.sh
```

### Option 2: Manual Setup

#### Step 1: Create Persistent Data Directories
```bash
# Create directories for persistent data
mkdir -p kentkonut_db_data/postgres
mkdir -p kentkonut_db_data/kentkonut_backend/{uploads,media,banners,haberler,hafriyat,kurumsal,services,proje,logs,backups}
```

#### Step 2: Build the Docker Image
```bash
# Navigate to the backend directory
cd kentkonut-backend

# Build the Docker image
docker build -t kentkonut-backend:latest -f Dockerfile .

# Return to the root directory
cd ..
```

#### Step 3: Start the Services
```bash
# Start all services using docker-compose
docker-compose up -d
```

#### Step 4: Wait for Services to Start
```bash
# Wait for services to be healthy (usually takes 1-2 minutes)
docker-compose logs -f backend
```

## 🔧 Docker Image Features

### Automatic Admin User Creation
- **Email**: `admin@example.com`
- **Password**: `Admin123!`
- **Role**: `ADMIN`
- The admin user is created automatically during container startup
- The creation process is idempotent (safe to run multiple times)

### Latest Fixes Included
- ✅ Fixed root page routing logic (redirects based on authentication)
- ✅ Fixed settings page API endpoints (`/api/admin/seed`)
- ✅ Fixed port configuration (3010)
- ✅ Enhanced health check endpoint
- ✅ Production-ready environment configuration

### Multi-Stage Docker Build
- Optimized for production use
- Minimal image size with security best practices
- Non-root user execution
- Comprehensive startup script with database initialization

## 🌐 Application URLs

Once the services are running, you can access:

- **Backend Application**: http://localhost:3010
- **Login Page**: http://localhost:3010/auth/login
- **Dashboard**: http://localhost:3010/dashboard
- **Settings Page**: http://localhost:3010/dashboard/settings
- **Health Check**: http://localhost:3010/api/health

## 👤 Admin Login

Use these credentials to log in:
- **Email**: `admin@example.com`
- **Password**: `Admin123!`

## 🔍 Verification Steps

### 1. Test Root Page Routing
1. Visit http://localhost:3010/
2. Should redirect to login page if not authenticated
3. After login, should redirect to dashboard

### 2. Test Admin Login
1. Go to http://localhost:3010/auth/login
2. Enter admin credentials
3. Should successfully log in and redirect to dashboard

### 3. Test Settings Page
1. After logging in, visit http://localhost:3010/dashboard/settings
2. Should load without 404 errors
3. Database status should be displayed

### 4. Test Health Check
1. Visit http://localhost:3010/api/health
2. Should return JSON with status information
3. Database and admin user status should be "connected" and "exists"

## 🛠️ Useful Docker Commands

### View Logs
```bash
# View backend logs
docker-compose logs -f backend

# View all service logs
docker-compose logs -f

# View PostgreSQL logs
docker-compose logs -f postgresql
```

### Manage Services
```bash
# Stop all services
docker-compose down

# Restart services
docker-compose restart

# View running containers
docker-compose ps

# View service status
docker-compose top
```

### Database Management
```bash
# Access PostgreSQL directly
docker-compose exec postgresql psql -U postgres -d kentkonutdb

# Create database backup
docker-compose exec postgresql pg_dump -U postgres kentkonutdb > backup.sql

# View database tables
docker-compose exec postgresql psql -U postgres -d kentkonutdb -c "\dt"
```

### Debugging
```bash
# Access backend container shell
docker-compose exec backend sh

# Check backend environment variables
docker-compose exec backend env

# Test database connection from backend
docker-compose exec backend npx prisma db push
```

## 📁 Persistent Data

The following directories are mounted for persistent data:

- `kentkonut_db_data/postgres/` - PostgreSQL database files
- `kentkonut_db_data/kentkonut_backend/uploads/` - User uploaded files
- `kentkonut_db_data/kentkonut_backend/media/` - Media files
- `kentkonut_db_data/kentkonut_backend/logs/` - Application logs
- `kentkonut_db_data/kentkonut_backend/backups/` - Database backups

## 🔒 Security Features

- Non-root user execution in containers
- Secure environment variable handling
- Health checks for all services
- Production-ready configuration
- CORS protection enabled
- Rate limiting configured

## 🚨 Troubleshooting

### Container Won't Start
```bash
# Check container logs
docker-compose logs backend

# Check if ports are available
netstat -tulpn | grep :3010
```

### Database Connection Issues
```bash
# Check PostgreSQL health
docker-compose exec postgresql pg_isready -U postgres

# Restart PostgreSQL
docker-compose restart postgresql
```

### Admin User Not Created
```bash
# Check backend logs for admin creation
docker-compose logs backend | grep -i admin

# Manually create admin user
docker-compose exec backend node create-admin.js
```

### Settings Page 404 Error
```bash
# Check if API endpoint exists
curl http://localhost:3010/api/admin/seed

# Check backend logs
docker-compose logs backend | grep -i "api/admin"
```

## 📞 Support

If you encounter any issues:

1. Check the logs using the commands above
2. Ensure all prerequisites are met
3. Verify that ports 3010, 5433, and 6379 are not in use by other applications
4. Try rebuilding the image: `docker-compose down && docker-compose up --build -d`

## 🎯 Next Steps

After successful setup:

1. Log in with admin credentials
2. Configure application settings in the dashboard
3. Test all functionality including file uploads
4. Set up regular database backups
5. Configure production environment variables as needed
