#!/bin/bash
# scripts/migrate-db-to-local.sh - Migrate PostgreSQL from Docker volume to local directory

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="kentkonut-postgres"
DB_NAME="kentkonutdb"
DB_USER="postgres"
VOLUME_NAME="kentkonut-full-stack_postgres_data"
LOCAL_DB_DIR="kentkonut_db_data"
BACKUP_DIR="kentkonut-backend/backups/migration_$(date +%Y%m%d_%H%M%S)"

echo -e "${BLUE}🗄️ PostgreSQL Data Migration to Local Directory${NC}"
echo "=================================================="

# Function to check if container is running
check_container() {
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        echo -e "${RED}❌ PostgreSQL container is not running!${NC}"
        echo -e "${YELLOW}💡 Please start containers first: docker-compose up -d${NC}"
        exit 1
    fi
}

# Function to create backup
create_backup() {
    echo -e "${YELLOW}💾 Creating comprehensive backup...${NC}"
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # 1. SQL Dump backup
    echo -e "${YELLOW}📊 Creating SQL dump backup...${NC}"
    docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/kentkonutdb_backup.sql"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SQL dump backup completed${NC}"
    else
        echo -e "${RED}❌ SQL dump backup failed${NC}"
        exit 1
    fi
    
    # 2. Volume data backup
    echo -e "${YELLOW}📁 Creating volume data backup...${NC}"
    docker run --rm -v "$VOLUME_NAME":/source -v "$(pwd)/$BACKUP_DIR":/backup alpine sh -c "cp -r /source/* /backup/volume_backup/ 2>/dev/null || mkdir -p /backup/volume_backup && cp -r /source/* /backup/volume_backup/"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Volume data backup completed${NC}"
    else
        echo -e "${RED}❌ Volume data backup failed${NC}"
        exit 1
    fi
    
    # 3. Create backup info
    cat > "$BACKUP_DIR/backup_info.txt" << EOF
PostgreSQL Migration Backup
===========================
Date: $(date)
Container: $CONTAINER_NAME
Database: $DB_NAME
Volume: $VOLUME_NAME
Target Directory: $LOCAL_DB_DIR

Backup Contents:
- kentkonutdb_backup.sql (SQL dump)
- volume_backup/ (raw PostgreSQL data files)

Migration Steps:
1. Stop containers
2. Create local directory
3. Copy volume data to local directory
4. Update docker-compose.yml
5. Start containers with new configuration
6. Verify data integrity
EOF
    
    echo -e "${GREEN}✅ Comprehensive backup completed${NC}"
    echo -e "${GREEN}📁 Backup location: $BACKUP_DIR${NC}"
}

# Function to create local directory
create_local_directory() {
    echo -e "${YELLOW}📁 Creating local database directory...${NC}"
    
    if [ -d "$LOCAL_DB_DIR" ]; then
        echo -e "${YELLOW}⚠️ Directory $LOCAL_DB_DIR already exists${NC}"
        read -p "Do you want to remove it and continue? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$LOCAL_DB_DIR"
            echo -e "${YELLOW}🗑️ Removed existing directory${NC}"
        else
            echo -e "${RED}❌ Migration cancelled${NC}"
            exit 1
        fi
    fi
    
    mkdir -p "$LOCAL_DB_DIR"
    echo -e "${GREEN}✅ Created directory: $LOCAL_DB_DIR${NC}"
}

# Function to migrate data
migrate_data() {
    echo -e "${YELLOW}🔄 Migrating data from Docker volume to local directory...${NC}"
    
    # Stop the backend container first (but keep postgres running for now)
    echo -e "${YELLOW}🛑 Stopping backend container...${NC}"
    docker-compose stop backend
    
    # Copy data from volume to local directory
    echo -e "${YELLOW}📋 Copying PostgreSQL data...${NC}"
    docker run --rm -v "$VOLUME_NAME":/source -v "$(pwd)/$LOCAL_DB_DIR":/target alpine sh -c "cp -r /source/* /target/"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Data migration completed${NC}"
    else
        echo -e "${RED}❌ Data migration failed${NC}"
        exit 1
    fi
    
    # Set proper permissions
    echo -e "${YELLOW}🔐 Setting proper permissions...${NC}"
    sudo chown -R 999:999 "$LOCAL_DB_DIR" 2>/dev/null || echo -e "${YELLOW}⚠️ Could not set ownership (may need manual adjustment)${NC}"
    chmod -R 700 "$LOCAL_DB_DIR"
    
    echo -e "${GREEN}✅ Data migration completed successfully${NC}"
}

# Function to update docker-compose
update_docker_compose() {
    echo -e "${YELLOW}⚙️ Updating docker-compose.yml configuration...${NC}"
    
    # Create backup of current docker-compose.yml
    cp docker-compose.yml docker-compose.yml.backup
    echo -e "${GREEN}✅ Created backup: docker-compose.yml.backup${NC}"
    
    # Update the postgresql service volume mount
    sed -i.bak 's|postgres_data:/var/lib/postgresql/data|./kentkonut_db_data:/var/lib/postgresql/data|g' docker-compose.yml
    
    # Remove the postgres_data volume definition
    sed -i.bak '/postgres_data:/d' docker-compose.yml
    sed -i.bak '/driver: local/d' docker-compose.yml
    
    echo -e "${GREEN}✅ Updated docker-compose.yml configuration${NC}"
}

# Function to test migration
test_migration() {
    echo -e "${YELLOW}🧪 Testing migration...${NC}"
    
    # Stop all containers
    echo -e "${YELLOW}🛑 Stopping all containers...${NC}"
    docker-compose down
    
    # Start with new configuration
    echo -e "${YELLOW}🚀 Starting containers with new configuration...${NC}"
    docker-compose up -d
    
    # Wait for database to be ready
    echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
    for i in {1..30}; do
        if docker exec kentkonut-postgres pg_isready -U postgres -d kentkonutdb >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Database is ready${NC}"
            break
        fi
        echo -e "${YELLOW}⏳ Waiting for database... (attempt $i/30)${NC}"
        sleep 2
    done
    
    # Test database connectivity
    echo -e "${YELLOW}🔍 Testing database connectivity...${NC}"
    page_count=$(docker exec kentkonut-postgres psql -U postgres -d kentkonutdb -t -c "SELECT COUNT(*) FROM \"Page\";" 2>/dev/null | xargs)
    if [ "$page_count" -ge 0 ] 2>/dev/null; then
        echo -e "${GREEN}✅ Database contains $page_count pages${NC}"
    else
        echo -e "${RED}❌ Database connectivity test failed${NC}"
        return 1
    fi
    
    # Test backend API
    echo -e "${YELLOW}🔍 Testing backend API...${NC}"
    sleep 10  # Give backend time to start
    if curl -s http://localhost:3010/api/health | grep -q "OK"; then
        echo -e "${GREEN}✅ Backend API is responding${NC}"
    else
        echo -e "${RED}❌ Backend API test failed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Migration test completed successfully${NC}"
}

# Main execution
main() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    check_container
    
    echo -e "${YELLOW}📋 Migration Summary:${NC}"
    echo -e "  Source: Docker volume ($VOLUME_NAME)"
    echo -e "  Target: Local directory ($LOCAL_DB_DIR)"
    echo -e "  Backup: $BACKUP_DIR"
    echo
    
    read -p "Do you want to proceed with the migration? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Migration cancelled${NC}"
        exit 0
    fi
    
    create_backup
    create_local_directory
    migrate_data
    update_docker_compose
    test_migration
    
    echo -e "\n${GREEN}🎉 Migration completed successfully!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo -e "${BLUE}📁 Database data is now stored in: $LOCAL_DB_DIR${NC}"
    echo -e "${BLUE}💾 Backup available at: $BACKUP_DIR${NC}"
    echo -e "${BLUE}🔧 Backend: http://localhost:3010${NC}"
    echo -e "\n${YELLOW}💡 Next steps:${NC}"
    echo -e "   1. Verify all functionality works correctly"
    echo -e "   2. Test database operations"
    echo -e "   3. Remove backup files when satisfied"
    echo -e "   4. Consider adding $LOCAL_DB_DIR to .gitignore"
}

# Run main function
main "$@"
