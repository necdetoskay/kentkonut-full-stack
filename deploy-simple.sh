#!/bin/bash

# KentKonut Simplified Production Deployment Script
# Optimized for host 172.41.42.51 with existing applications

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
HOST_IP="172.41.42.51"
FRONTEND_PORT="3020"
BACKEND_PORT="3021"
COMPOSE_FILE="docker-compose.production.yml"

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

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if compose file exists
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "Docker Compose file not found: $COMPOSE_FILE"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Check port availability
check_ports() {
    log_info "Checking port availability..."
    
    # Check frontend port
    if netstat -tulpn 2>/dev/null | grep -q ":$FRONTEND_PORT "; then
        log_warning "Port $FRONTEND_PORT is already in use"
        log_info "You may need to modify the frontend port in $COMPOSE_FILE"
    else
        log_success "Frontend port $FRONTEND_PORT is available"
    fi
    
    # Check backend port
    if netstat -tulpn 2>/dev/null | grep -q ":$BACKEND_PORT "; then
        log_warning "Port $BACKEND_PORT is already in use"
        log_info "You may need to modify the backend port in $COMPOSE_FILE"
    else
        log_success "Backend port $BACKEND_PORT is available"
    fi
}

# Setup environment
setup_environment() {
    log_info "Setting up environment..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.production" ]; then
            cp .env.production .env
            log_success "Created .env from template"
            log_warning "Please edit .env file with your secure passwords:"
            log_info "nano .env"
            read -p "Press Enter after editing .env file..."
        else
            log_error ".env.production template not found"
            exit 1
        fi
    else
        log_success ".env file already exists"
    fi
}

# Start services
start_services() {
    log_info "Starting KentKonut services..."
    
    # Pull latest images
    log_info "Pulling latest Docker images..."
    docker-compose -f "$COMPOSE_FILE" pull
    
    # Start services
    log_info "Starting containers..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    log_success "Services started successfully"
}

# Check service health
check_health() {
    log_info "Checking service health..."
    
    # Wait for services to start
    log_info "Waiting for services to initialize..."
    sleep 30
    
    # Check backend
    log_info "Checking backend health..."
    if curl -f -s "http://$HOST_IP:$BACKEND_PORT/api/health" > /dev/null; then
        log_success "Backend is healthy"
    else
        log_warning "Backend health check failed (may still be starting)"
    fi
    
    # Check frontend
    log_info "Checking frontend..."
    if curl -f -s "http://$HOST_IP:$FRONTEND_PORT" > /dev/null; then
        log_success "Frontend is accessible"
    else
        log_warning "Frontend check failed (may still be starting)"
    fi
    
    # Verify database is NOT externally accessible (should fail)
    log_info "Verifying database security..."
    if ! nc -z "$HOST_IP" 5432 2>/dev/null; then
        log_success "Database is properly secured (not externally accessible)"
    else
        log_error "Database is externally accessible - security issue!"
    fi
    
    # Verify Redis is NOT externally accessible (should fail)
    log_info "Verifying Redis security..."
    if ! nc -z "$HOST_IP" 6379 2>/dev/null; then
        log_success "Redis is properly secured (not externally accessible)"
    else
        log_error "Redis is externally accessible - security issue!"
    fi

    # Test NextAuth redirect (should not redirect to localhost)
    log_info "Testing NextAuth configuration..."
    auth_response=$(curl -s -I "http://$HOST_IP:$BACKEND_PORT/auth/login" | head -n 1)
    if echo "$auth_response" | grep -q "200\|302"; then
        log_success "NextAuth endpoint is accessible"
    else
        log_warning "NextAuth endpoint check failed"
    fi
}

# Show service status
show_status() {
    log_info "Service status:"
    docker-compose -f "$COMPOSE_FILE" ps
    
    echo ""
    log_info "Access URLs:"
    echo "  Frontend: http://$HOST_IP:$FRONTEND_PORT"
    echo "  Backend:  http://$HOST_IP:$BACKEND_PORT"
    echo "  API Health: http://$HOST_IP:$BACKEND_PORT/api/health"
}

# Show logs
show_logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        log_info "Showing logs for $service:"
        docker-compose -f "$COMPOSE_FILE" logs --tail=50 "$service"
    else
        log_info "Showing recent logs for all services:"
        docker-compose -f "$COMPOSE_FILE" logs --tail=20
    fi
}

# Stop services
stop_services() {
    log_info "Stopping KentKonut services..."
    docker-compose -f "$COMPOSE_FILE" down
    log_success "Services stopped"
}

# Update services
update_services() {
    log_info "Updating KentKonut services..."
    
    # Pull new images
    docker-compose -f "$COMPOSE_FILE" pull
    
    # Restart services
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Clean old images
    docker image prune -f
    
    log_success "Services updated successfully"
}

# Main function
main() {
    echo "================================================"
    echo "  KentKonut Simplified Production Deployment"
    echo "  Host: $HOST_IP"
    echo "  Frontend Port: $FRONTEND_PORT"
    echo "  Backend Port: $BACKEND_PORT"
    echo "================================================"
    echo ""
    
    case "$1" in
        "start")
            check_prerequisites
            check_ports
            setup_environment
            start_services
            check_health
            show_status
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            sleep 5
            start_services
            check_health
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$2"
            ;;
        "update")
            check_prerequisites
            update_services
            check_health
            ;;
        "health")
            check_health
            ;;
        *)
            echo "Usage: $0 {start|stop|restart|status|logs|update|health}"
            echo ""
            echo "Commands:"
            echo "  start           - Start all services"
            echo "  stop            - Stop all services"
            echo "  restart         - Restart all services"
            echo "  status          - Show service status and URLs"
            echo "  logs [service]  - Show logs (optional: specify service)"
            echo "  update          - Update to latest version"
            echo "  health          - Check service health"
            echo ""
            echo "Examples:"
            echo "  $0 start        - Deploy application"
            echo "  $0 logs backend - Show backend logs"
            echo "  $0 health       - Check if services are healthy"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
