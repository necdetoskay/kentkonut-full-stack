#!/bin/bash

# Docker Network Conflict Resolution Script
# Bu script Docker network subnet çakışmalarını tespit eder ve çözer

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

# Check existing Docker networks
check_existing_networks() {
    log_info "Checking existing Docker networks..."
    
    echo "=== Docker Networks ==="
    docker network ls
    echo ""
    
    echo "=== Network Details ==="
    for network in $(docker network ls --format "{{.Name}}" | grep -v "bridge\|host\|none"); do
        echo "Network: $network"
        docker network inspect "$network" | grep -E '"Subnet"|"Gateway"' || true
        echo ""
    done
}

# Check system network routes
check_system_networks() {
    log_info "Checking system network routes..."
    
    echo "=== System Routes ==="
    if command -v ip &> /dev/null; then
        ip route show
    elif command -v route &> /dev/null; then
        route -n
    else
        log_warning "Neither 'ip' nor 'route' command found"
    fi
    echo ""
    
    echo "=== Network Interfaces ==="
    if command -v ip &> /dev/null; then
        ip addr show
    elif command -v ifconfig &> /dev/null; then
        ifconfig
    else
        log_warning "Neither 'ip' nor 'ifconfig' command found"
    fi
}

# Test subnet availability
test_subnet() {
    local subnet=$1
    log_info "Testing subnet availability: $subnet"
    
    # Extract network part (remove /XX)
    local network=$(echo $subnet | cut -d'/' -f1)
    local prefix=$(echo $subnet | cut -d'/' -f2)
    
    # Check if subnet is in use by Docker networks
    if docker network ls --format "{{.Name}}" | xargs -I {} docker network inspect {} 2>/dev/null | grep -q "$network"; then
        log_error "Subnet $subnet is already in use by Docker networks"
        return 1
    fi
    
    # Check if subnet is in use by system routes
    if ip route show 2>/dev/null | grep -q "$network"; then
        log_error "Subnet $subnet is already in use by system routes"
        return 1
    fi
    
    log_success "Subnet $subnet appears to be available"
    return 0
}

# Find available subnet
find_available_subnet() {
    log_info "Finding available subnet..."
    
    # Common private IP ranges to test
    local subnets=(
        "172.25.0.0/16"
        "172.26.0.0/16"
        "172.27.0.0/16"
        "172.28.0.0/16"
        "172.29.0.0/16"
        "172.30.0.0/16"
        "172.31.0.0/16"
        "10.100.0.0/16"
        "10.101.0.0/16"
        "10.102.0.0/16"
        "192.168.100.0/24"
        "192.168.101.0/24"
        "192.168.102.0/24"
    )
    
    for subnet in "${subnets[@]}"; do
        if test_subnet "$subnet"; then
            echo "$subnet"
            return 0
        fi
    done
    
    log_error "Could not find an available subnet"
    return 1
}

# Update docker-compose file with new subnet
update_docker_compose() {
    local new_subnet=$1
    local compose_file=${2:-"docker-compose.production.yml"}
    
    log_info "Updating $compose_file with subnet: $new_subnet"
    
    # Backup original file
    cp "$compose_file" "${compose_file}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Extract gateway (first IP in subnet)
    local network=$(echo $new_subnet | cut -d'/' -f1)
    local gateway=$(echo $network | sed 's/\([0-9]*\.[0-9]*\.[0-9]*\.\)[0-9]*/\11/')
    
    # Update subnet in docker-compose file
    sed -i.tmp "s|subnet: [0-9]*\.[0-9]*\.[0-9]*\.[0-9]*/[0-9]*|subnet: $new_subnet|g" "$compose_file"
    
    # Add gateway if not present
    if ! grep -q "gateway:" "$compose_file"; then
        sed -i.tmp "/subnet: $new_subnet/a\\          gateway: $gateway" "$compose_file"
    else
        sed -i.tmp "s|gateway: [0-9]*\.[0-9]*\.[0-9]*\.[0-9]*|gateway: $gateway|g" "$compose_file"
    fi
    
    # Remove temporary file
    rm -f "${compose_file}.tmp"
    
    log_success "Updated $compose_file with new subnet configuration"
    
    echo "=== New Network Configuration ==="
    grep -A 5 "networks:" "$compose_file"
}

# Clean up conflicting networks
cleanup_networks() {
    log_info "Cleaning up unused Docker networks..."
    
    # Remove unused networks
    docker network prune -f
    
    log_success "Cleaned up unused networks"
}

# Main function
main() {
    echo "======================================"
    echo "  Docker Network Conflict Resolver"
    echo "======================================"
    echo ""
    
    case "$1" in
        "check")
            check_existing_networks
            check_system_networks
            ;;
        "test")
            if [ -z "$2" ]; then
                log_error "Please provide a subnet to test (e.g., 172.25.0.0/16)"
                exit 1
            fi
            test_subnet "$2"
            ;;
        "find")
            available_subnet=$(find_available_subnet)
            if [ $? -eq 0 ]; then
                log_success "Available subnet found: $available_subnet"
                echo "You can use this subnet in your docker-compose.yml file"
            fi
            ;;
        "fix")
            compose_file=${2:-"docker-compose.production.yml"}
            if [ ! -f "$compose_file" ]; then
                log_error "Docker compose file not found: $compose_file"
                exit 1
            fi
            
            available_subnet=$(find_available_subnet)
            if [ $? -eq 0 ]; then
                update_docker_compose "$available_subnet" "$compose_file"
                log_success "Fixed network configuration in $compose_file"
                echo ""
                echo "You can now run:"
                echo "docker-compose -f $compose_file up -d"
            fi
            ;;
        "cleanup")
            cleanup_networks
            ;;
        *)
            echo "Usage: $0 {check|test|find|fix|cleanup}"
            echo ""
            echo "Commands:"
            echo "  check                    - Check existing networks and routes"
            echo "  test <subnet>           - Test if a specific subnet is available"
            echo "  find                    - Find an available subnet"
            echo "  fix [compose-file]      - Fix network conflicts in docker-compose file"
            echo "  cleanup                 - Clean up unused Docker networks"
            echo ""
            echo "Examples:"
            echo "  $0 check                                    - Check current network status"
            echo "  $0 test 172.25.0.0/16                     - Test specific subnet"
            echo "  $0 find                                     - Find available subnet"
            echo "  $0 fix docker-compose.production.yml       - Fix network conflicts"
            echo "  $0 cleanup                                  - Clean unused networks"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
