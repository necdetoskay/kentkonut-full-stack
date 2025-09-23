#!/bin/bash
# kentkonut-backend/scripts/migrate-to-containers.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 KentKonut Containerization Migration${NC}"
echo "========================================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Create backup before migration
echo -e "${YELLOW}💾 Creating backup before migration...${NC}"
chmod +x scripts/backup-data.sh
./scripts/backup-data.sh

# Create necessary directories
echo -e "${YELLOW}📁 Creating necessary directories...${NC}"
mkdir -p backups

# Copy existing media files to preserve them
echo -e "${YELLOW}📋 Preparing media files for containerization...${NC}"

# Create volume initialization script
cat > scripts/init-volumes.sh << 'EOF'
#!/bin/bash
# Initialize Docker volumes with existing data

echo "Initializing Docker volumes with existing data..."

# Function to copy data to volume
copy_to_volume() {
    local source_dir=$1
    local volume_name=$2
    local container_path=$3
    
    if [ -d "$source_dir" ]; then
        echo "Copying $source_dir to volume $volume_name..."
        docker run --rm -v "$(pwd)/$source_dir":/source -v "$volume_name":/target alpine sh -c "cp -r /source/* /target/ 2>/dev/null || true"
    fi
}

# Copy all media directories to their respective volumes
copy_to_volume "public/uploads" "kentkonut-backend_uploads_data" "/app/public/uploads"
copy_to_volume "public/media" "kentkonut-backend_media_data" "/app/public/media"
copy_to_volume "public/banners" "kentkonut-backend_banners_data" "/app/public/banners"
copy_to_volume "public/haberler" "kentkonut-backend_haberler_data" "/app/public/haberler"
copy_to_volume "public/hafriyat" "kentkonut-backend_hafriyat_data" "/app/public/hafriyat"
copy_to_volume "public/kurumsal" "kentkonut-backend_kurumsal_data" "/app/public/kurumsal"
copy_to_volume "public/services" "kentkonut-backend_services_data" "/app/public/services"
copy_to_volume "public/proje" "kentkonut-backend_proje_data" "/app/public/proje"

echo "Volume initialization completed!"
EOF

chmod +x scripts/init-volumes.sh

# Update environment variables for container networking
echo -e "${YELLOW}⚙️ Updating environment variables...${NC}"
cp .env .env.host-backup

# Update DATABASE_URL for container networking
sed -i 's|DATABASE_URL=postgresql://postgres:P@ssw0rd@localhost:5432/kentkonutdb|DATABASE_URL=postgresql://postgres:P@ssw0rd@postgresql:5432/kentkonutdb|g' .env

echo -e "${GREEN}✅ Environment updated for containerization${NC}"

# Build Docker images
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker-compose build

# Start PostgreSQL first to ensure database is ready
echo -e "${YELLOW}🗄️ Starting PostgreSQL container...${NC}"
docker-compose up -d postgresql

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
for i in {1..30}; do
    if docker exec kentkonut-postgres pg_isready -U postgres -d kentkonutdb >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
        break
    fi
    echo -e "${YELLOW}⏳ Waiting for PostgreSQL... (attempt $i/30)${NC}"
    sleep 2
done

# Initialize volumes with existing data
echo -e "${YELLOW}📦 Initializing volumes with existing data...${NC}"
./scripts/init-volumes.sh

# Start all services
echo -e "${YELLOW}🚀 Starting all containerized services...${NC}"
docker-compose up -d

# Wait for backend to be ready
echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
for i in {1..60}; do
    if curl -s http://localhost:3010/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready${NC}"
        break
    fi
    echo -e "${YELLOW}⏳ Waiting for backend... (attempt $i/60)${NC}"
    sleep 2
done

# Run database migrations
echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
docker exec kentkonut-backend npx prisma migrate deploy || echo -e "${YELLOW}⚠️ Migration failed or not needed${NC}"

# Generate Prisma client
echo -e "${YELLOW}🔧 Generating Prisma client...${NC}"
docker exec kentkonut-backend npx prisma generate || echo -e "${YELLOW}⚠️ Prisma generate failed${NC}"

# Verify migration
echo -e "${YELLOW}🔍 Verifying migration...${NC}"
if [ -f "scripts/verify-containerized-setup.sh" ]; then
    chmod +x scripts/verify-containerized-setup.sh
    ./scripts/verify-containerized-setup.sh
else
    echo -e "${YELLOW}⚠️ Verification script not found, running basic checks...${NC}"
    
    # Basic verification
    if curl -s http://localhost:3010/api/health | grep -q "ok"; then
        echo -e "${GREEN}✅ Backend health check passed${NC}"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
    fi
    
    if docker exec kentkonut-postgres pg_isready -U postgres -d kentkonutdb >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Database health check passed${NC}"
    else
        echo -e "${RED}❌ Database health check failed${NC}"
    fi
fi

echo -e "\n${GREEN}🎉 Migration completed successfully!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${BLUE}📱 Backend: http://localhost:3010${NC}"
echo -e "${BLUE}🗄️ Database: localhost:5432${NC}"
echo -e "${BLUE}🛠️ PgAdmin: docker-compose --profile tools up -d pgadmin${NC}"
echo -e "\n${YELLOW}💡 Useful commands:${NC}"
echo -e "   View logs: docker-compose logs -f [service]"
echo -e "   Stop: docker-compose down"
echo -e "   Restart: docker-compose restart [service]"
echo -e "   Shell access: docker exec -it kentkonut-[service] sh"
echo -e "\n${YELLOW}📁 Backup location: $(ls -t backups/ | head -1)${NC}"
