#!/bin/bash
# scripts/verify-containerized-setup.sh - Verify setup from root

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Verifying Containerized Setup...${NC}"
echo "=================================="

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -e "${YELLOW}🔍 Checking $service_name...${NC}"
    
    # Wait for service to be ready
    for i in {1..30}; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
            echo -e "${GREEN}✅ $service_name is healthy${NC}"
            return 0
        fi
        echo -e "${YELLOW}⏳ Waiting for $service_name... (attempt $i/30)${NC}"
        sleep 2
    done
    
    echo -e "${RED}❌ $service_name health check failed${NC}"
    return 1
}

# Check Docker and Docker Compose
echo -e "${YELLOW}🐳 Checking Docker...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker is installed: $(docker --version)${NC}"
else
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✅ Docker Compose is installed: $(docker-compose --version)${NC}"
else
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

# Check container status
echo -e "\n${YELLOW}📦 Container Status:${NC}"
docker-compose ps

# Check if all required containers are running
required_containers=("kentkonut-postgres" "kentkonut-backend" "kentkonut-redis")
for container in "${required_containers[@]}"; do
    if docker ps --format "table {{.Names}}" | grep -q "$container"; then
        echo -e "${GREEN}✅ $container is running${NC}"
    else
        echo -e "${RED}❌ $container is not running${NC}"
        exit 1
    fi
done

# Check database health
echo -e "\n${YELLOW}🗄️ Database Health:${NC}"
if docker exec kentkonut-postgres pg_isready -U postgres -d kentkonutdb; then
    echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not ready${NC}"
    exit 1
fi

# Check Redis health
echo -e "\n${YELLOW}🔴 Redis Health:${NC}"
if docker exec kentkonut-redis redis-cli ping | grep -q "PONG"; then
    echo -e "${GREEN}✅ Redis is ready${NC}"
else
    echo -e "${RED}❌ Redis is not ready${NC}"
    exit 1
fi

# Check backend API
echo -e "\n${YELLOW}🔧 Backend API Health:${NC}"
check_service "Backend API" "http://localhost:3010/api/health"

# Check data integrity
echo -e "\n${YELLOW}📊 Data Integrity Check:${NC}"
page_count=$(docker exec kentkonut-postgres psql -U postgres -d kentkonutdb -t -c "SELECT COUNT(*) FROM \"Page\";" 2>/dev/null | xargs)
if [ "$page_count" -ge 0 ] 2>/dev/null; then
    echo -e "${GREEN}✅ Database contains $page_count pages${NC}"
else
    echo -e "${RED}❌ Unable to verify database data${NC}"
fi

# Check media files
echo -e "\n${YELLOW}📁 Media Files Check:${NC}"
media_count=$(docker exec kentkonut-backend find /app/public -name "*.jpg" -o -name "*.png" -o -name "*.avif" -o -name "*.webp" | wc -l)
echo -e "${GREEN}✅ Found $media_count media files${NC}"

# Check volumes
echo -e "\n${YELLOW}💾 Volume Status:${NC}"
docker volume ls | grep kentkonut
volumes=("postgres_data" "uploads_data" "media_data" "banners_data" "haberler_data" "hafriyat_data" "kurumsal_data" "services_data" "proje_data" "redis_data")
for volume in "${volumes[@]}"; do
    if docker volume inspect "kentkonut-full-stack_$volume" &>/dev/null; then
        echo -e "${GREEN}✅ $volume exists${NC}"
    else
        echo -e "${RED}❌ $volume missing${NC}"
    fi
done

# Check network
echo -e "\n${YELLOW}🌐 Network Status:${NC}"
if docker network inspect kentkonut-full-stack_kentkonut-network &>/dev/null; then
    echo -e "${GREEN}✅ kentkonut-network exists${NC}"
else
    echo -e "${RED}❌ kentkonut-network missing${NC}"
fi

# Performance check
echo -e "\n${YELLOW}⚡ Performance Check:${NC}"
backend_response_time=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:3010/api/health)
echo -e "${GREEN}📊 Backend response time: ${backend_response_time}s${NC}"

# Resource usage
echo -e "\n${YELLOW}💻 Resource Usage:${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" kentkonut-postgres kentkonut-backend kentkonut-redis

echo -e "\n${GREEN}🎉 Verification completed successfully!${NC}"
echo -e "${BLUE}🔧 Backend: http://localhost:3010${NC}"
echo -e "${BLUE}🗄️ PgAdmin: http://localhost:8080 (start with --profile tools)${NC}"
