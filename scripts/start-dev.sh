#!/bin/bash
# scripts/start-dev.sh - Start development environment from root

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting KentKonut Development Environment...${NC}"
echo "================================================"

# Check if Docker is running
if ! docker info &>/dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Stop any existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down --remove-orphans

# Build images if they don't exist or if --build flag is passed
if [ "$1" = "--build" ] || [ "$1" = "-b" ]; then
    echo -e "${YELLOW}🔨 Building Docker images...${NC}"
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache
fi

# Start services
echo -e "${YELLOW}🚀 Starting development services...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 15

# Run database migrations if needed
echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
docker exec kentkonut-backend npx prisma migrate deploy || echo -e "${YELLOW}⚠️ Migration failed or not needed${NC}"

# Generate Prisma client
echo -e "${YELLOW}🔧 Generating Prisma client...${NC}"
docker exec kentkonut-backend npx prisma generate || echo -e "${YELLOW}⚠️ Prisma generate failed${NC}"

# Run verification
echo -e "${YELLOW}🔍 Running verification...${NC}"
if [ -f "scripts/verify-containerized-setup.sh" ]; then
    chmod +x scripts/verify-containerized-setup.sh
    ./scripts/verify-containerized-setup.sh
else
    echo -e "${YELLOW}⚠️ Verification script not found${NC}"
fi

echo -e "\n${GREEN}🎉 Development environment is ready!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${BLUE}🔧 Backend: http://localhost:3010${NC}"
echo -e "${BLUE}🗄️ Database: localhost:5433${NC}"
echo -e "${BLUE}🔴 Redis: localhost:6379${NC}"
echo -e "${BLUE}🛠️ PgAdmin: docker-compose --profile tools up -d pgadmin${NC}"
echo -e "\n${YELLOW}💡 Useful commands:${NC}"
echo -e "   View logs: docker-compose logs -f [service]"
echo -e "   Stop: docker-compose down"
echo -e "   Restart: docker-compose restart [service]"
echo -e "   Shell access: docker exec -it kentkonut-[service] sh"
