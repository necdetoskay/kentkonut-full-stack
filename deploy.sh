#!/bin/bash

# KentKonut Production Deployment Script
# Bu script remote host'ta production deployment'ı kolaylaştırır

set -e  # Exit on any error

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

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_success "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f ".env" ]; then
        log_warning ".env file not found. Creating from template..."
        if [ -f ".env.production" ]; then
            cp .env.production .env
            log_info "Please edit .env file with your production settings:"
            log_info "nano .env"
            read -p "Press Enter after editing .env file..."
        else
            log_error ".env.production template not found!"
            exit 1
        fi
    fi
    log_success ".env file exists"
}

# Pull latest images
pull_images() {
    log_info "Pulling latest Docker images..."
    docker-compose -f docker-compose.production.yml pull
    log_success "Images pulled successfully"
}

# Start services
start_services() {
    log_info "Starting KentKonut services..."
    
    if [ "$1" = "--with-nginx" ]; then
        log_info "Starting with Nginx reverse proxy..."
        docker-compose -f docker-compose.production.yml --profile nginx up -d
    else
        docker-compose -f docker-compose.production.yml up -d
    fi
    
    log_success "Services started successfully"
}

# Check service health
check_health() {
    log_info "Checking service health..."
    
    # Wait for services to start
    sleep 10
    
    # Check backend health
    if curl -f http://localhost:3021/api/health &> /dev/null; then
        log_success "Backend is healthy"
    else
        log_warning "Backend health check failed"
    fi
    
    # Check frontend health
    if curl -f http://localhost:3000/health &> /dev/null; then
        log_success "Frontend is healthy"
    else
        log_warning "Frontend health check failed"
    fi
}

# Show service status
show_status() {
    log_info "Service status:"
    docker-compose -f docker-compose.production.yml ps
}

# Show logs
show_logs() {
    log_info "Recent logs:"
    docker-compose -f docker-compose.production.yml logs --tail=20
}

# Backup database
backup_database() {
    log_info "Creating database backup..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker exec kentkonut-postgres-prod pg_dump -U postgres kentkonutdb > "$BACKUP_FILE"
    log_success "Database backup created: $BACKUP_FILE"
}

# Update services
update_services() {
    log_info "Updating KentKonut services..."
    
    # Create backup first
    backup_database
    
    # Pull new images
    pull_images
    
    # Restart services
    docker-compose -f docker-compose.production.yml up -d
    
    # Clean old images
    docker image prune -f
    
    log_success "Services updated successfully"
}

# Stop services
stop_services() {
    log_info "Stopping KentKonut services..."
    docker-compose -f docker-compose.production.yml down
    log_success "Services stopped"
}

# Main script
main() {
    echo "======================================"
    echo "  KentKonut Production Deployment"
    echo "======================================"
    echo ""
    
    case "$1" in
        "start")
            check_docker
            check_env_file
            pull_images
            start_services "$2"
            check_health
            show_status
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            start_services "$2"
            check_health
            ;;
        "update")
            check_docker
            update_services
            check_health
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "backup")
            backup_database
            ;;
        "health")
            check_health
            ;;
        *)
            echo "Usage: $0 {start|stop|restart|update|status|logs|backup|health}"
            echo ""
            echo "Commands:"
            echo "  start [--with-nginx]  - Start all services"
            echo "  stop                  - Stop all services"
            echo "  restart [--with-nginx]- Restart all services"
            echo "  update                - Update to latest version"
            echo "  status                - Show service status"
            echo "  logs                  - Show recent logs"
            echo "  backup                - Create database backup"
            echo "  health                - Check service health"
            echo ""
            echo "Examples:"
            echo "  $0 start              - Start without nginx"
            echo "  $0 start --with-nginx - Start with nginx reverse proxy"
            echo "  $0 update             - Update to latest version"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
