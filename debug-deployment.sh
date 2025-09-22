#!/bin/bash

# KentKonut Deployment Debug Script
# Backend health check sorunlarını tespit eder ve çözer

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check container status
check_containers() {
    log_info "Checking container status..."
    
    echo "=== Container Status ==="
    docker ps -a --filter "name=kentkonut"
    echo ""
}

# Check container logs
check_logs() {
    local service=$1
    log_info "Checking logs for $service..."
    
    echo "=== $service Logs (last 20 lines) ==="
    docker logs --tail=20 "kentkonut-$service-prod" 2>/dev/null || log_error "Container kentkonut-$service-prod not found"
    echo ""
}

# Check health endpoints
check_health() {
    log_info "Checking health endpoints..."
    
    echo "=== Backend Health Check ==="
    if curl -f -s http://localhost:3021/api/health; then
        log_success "Backend is healthy"
    else
        log_error "Backend health check failed"
    fi
    echo ""
    
    echo "=== Frontend Health Check ==="
    if curl -f -s http://localhost:3000/health; then
        log_success "Frontend is healthy"
    else
        log_warning "Frontend health check failed (may be normal if backend is down)"
    fi
    echo ""
}

# Check database connection
check_database() {
    log_info "Checking database connection..."
    
    echo "=== PostgreSQL Connection Test ==="
    if docker exec kentkonut-postgres-prod psql -U postgres -d kentkonutdb -c "SELECT 1;" >/dev/null 2>&1; then
        log_success "Database connection successful"
    else
        log_error "Database connection failed"
    fi
    echo ""
}

# Check redis connection
check_redis() {
    log_info "Checking Redis connection..."
    
    echo "=== Redis Connection Test ==="
    if docker exec kentkonut-redis-prod redis-cli ping >/dev/null 2>&1; then
        log_success "Redis connection successful"
    else
        log_error "Redis connection failed"
    fi
    echo ""
}

# Check environment variables
check_env() {
    log_info "Checking environment variables..."
    
    echo "=== Environment Variables ==="
    if [ -f ".env" ]; then
        log_success ".env file exists"
        echo "Key variables:"
        grep -E "^(POSTGRES_PASSWORD|REDIS_PASSWORD|JWT_SECRET|NODE_ENV)" .env || log_warning "Some key variables may be missing"
    else
        log_error ".env file not found"
    fi
    echo ""
}

# Clean deployment
clean_deployment() {
    log_info "Cleaning existing deployment..."
    
    # Stop all services
    docker-compose -f docker-compose.production.yml down -v 2>/dev/null || true
    docker-compose -f docker-compose.production-debug.yml down -v 2>/dev/null || true
    
    # Remove containers
    docker container rm -f kentkonut-backend-prod kentkonut-frontend-prod kentkonut-postgres-prod kentkonut-redis-prod 2>/dev/null || true
    
    # Clean networks
    docker network rm kentkonut_full_stack_kentkonut-network 2>/dev/null || true
    
    log_success "Deployment cleaned"
}

# Start debug deployment
start_debug() {
    log_info "Starting debug deployment (without health checks)..."
    
    # Start services
    docker-compose -f docker-compose.production-debug.yml up -d
    
    log_info "Waiting for services to start..."
    sleep 30
    
    # Check status
    check_containers
    check_logs "postgres"
    check_logs "redis"
    check_logs "backend"
    
    # Test connections
    check_database
    check_redis
    check_health
}

# Start normal deployment
start_normal() {
    log_info "Starting normal deployment (with health checks)..."
    
    # Start services
    docker-compose -f docker-compose.production.yml up -d
    
    log_info "Waiting for services to start..."
    sleep 60
    
    # Check status
    check_containers
    check_health
}

# Main function
main() {
    echo "======================================"
    echo "  KentKonut Deployment Debugger"
    echo "======================================"
    echo ""
    
    case "$1" in
        "check")
            check_env
            check_containers
            check_logs "postgres"
            check_logs "redis"
            check_logs "backend"
            check_logs "frontend"
            check_database
            check_redis
            check_health
            ;;
        "clean")
            clean_deployment
            ;;
        "debug")
            clean_deployment
            start_debug
            ;;
        "normal")
            clean_deployment
            start_normal
            ;;
        "logs")
            service=${2:-"backend"}
            docker logs -f "kentkonut-$service-prod"
            ;;
        "restart")
            service=${2:-"backend"}
            log_info "Restarting $service..."
            docker restart "kentkonut-$service-prod"
            sleep 10
            check_logs "$service"
            ;;
        *)
            echo "Usage: $0 {check|clean|debug|normal|logs|restart}"
            echo ""
            echo "Commands:"
            echo "  check                 - Check all services and connections"
            echo "  clean                 - Clean existing deployment"
            echo "  debug                 - Start debug deployment (no health checks)"
            echo "  normal                - Start normal deployment (with health checks)"
            echo "  logs [service]        - Show logs for service (default: backend)"
            echo "  restart [service]     - Restart service (default: backend)"
            echo ""
            echo "Examples:"
            echo "  $0 check              - Check current status"
            echo "  $0 debug              - Start debug deployment"
            echo "  $0 logs backend       - Show backend logs"
            echo "  $0 restart frontend   - Restart frontend"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
