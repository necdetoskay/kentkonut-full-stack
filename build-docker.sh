#!/bin/bash

# KentKonut Backend Docker Build Script
# This script builds the Docker image and sets up the complete environment

set -e

echo "🚀 Building KentKonut Backend Docker Image..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_success "Docker is running"

# Create necessary directories for persistent data
print_status "Creating persistent data directories..."
mkdir -p kentkonut_db_data/postgres
mkdir -p kentkonut_db_data/kentkonut_backend/{uploads,media,banners,haberler,hafriyat,kurumsal,services,proje,logs,backups}

print_success "Persistent data directories created"

# Stop and remove existing containers if they exist
print_status "Stopping existing containers..."
docker-compose down --remove-orphans || true

# Remove existing image to ensure fresh build
print_status "Removing existing Docker image..."
docker rmi kentkonut-backend:latest || true

# Build the Docker image
print_status "Building Docker image..."
cd kentkonut-backend
docker build -t kentkonut-backend:latest -f Dockerfile .
cd ..

print_success "Docker image built successfully"

# Start the services
print_status "Starting services with docker-compose..."
docker-compose up -d

print_success "Services started successfully"

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 10

# Check service health
print_status "Checking service health..."

# Check PostgreSQL
if docker-compose exec postgresql pg_isready -U postgres > /dev/null 2>&1; then
    print_success "PostgreSQL is healthy"
else
    print_warning "PostgreSQL is not ready yet"
fi

# Check Redis
if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
    print_success "Redis is healthy"
else
    print_warning "Redis is not ready yet"
fi

# Wait a bit more for backend to start
print_status "Waiting for backend to start..."
sleep 20

# Check backend health
BACKEND_PORT=${PORT:-3010}
if curl -f http://localhost:${BACKEND_PORT}/api/health > /dev/null 2>&1; then
    print_success "Backend is healthy"
else
    print_warning "Backend is not ready yet, it may take a few more moments"
fi

echo ""
echo "================================================"
print_success "KentKonut Backend Docker setup completed!"
echo ""
echo "🌐 Application URLs:"
echo "   - Backend: http://localhost:${BACKEND_PORT}"
echo "   - Login: http://localhost:${BACKEND_PORT}/auth/login"
echo "   - Dashboard: http://localhost:${BACKEND_PORT}/dashboard"
echo "   - Settings: http://localhost:${BACKEND_PORT}/dashboard/settings"
echo "   - Health Check: http://localhost:${BACKEND_PORT}/api/health"
echo ""
echo "👤 Admin Credentials:"
echo "   - Email: admin@example.com"
echo "   - Password: Admin123!"
echo ""
echo "🔧 Useful Commands:"
echo "   - View logs: docker-compose logs -f backend"
echo "   - Stop services: docker-compose down"
echo "   - Restart services: docker-compose restart"
echo "   - View all containers: docker-compose ps"
echo ""
print_status "Setup complete! You can now access the application."
