#!/bin/bash
# scripts/rollback-db-migration.sh - Rollback PostgreSQL migration if needed

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

CONTAINER_NAME="kentkonut-postgres"
DB_NAME="kentkonutdb"
DB_USER="postgres"
VOLUME_NAME="kentkonut-full-stack_postgres_data"
LOCAL_DB_DIR="kentkonut_db_data"

echo -e "${BLUE}🔄 PostgreSQL Migration Rollback${NC}"
echo "================================="

# Function to find latest backup
find_latest_backup() {
    backup_dir=$(find kentkonut-backend/backups -name "migration_*" -type d | sort -r | head -1)
    if [ -z "$backup_dir" ]; then
        echo -e "${RED}❌ No migration backup found${NC}"
        exit 1
    fi
    echo "$backup_dir"
}

# Function to rollback configuration
rollback_configuration() {
    echo -e "${YELLOW}⚙️ Rolling back docker-compose.yml configuration...${NC}"
    
    if [ -f "docker-compose.yml.backup" ]; then
        cp docker-compose.yml.backup docker-compose.yml
        echo -e "${GREEN}✅ Restored docker-compose.yml from backup${NC}"
    else
        echo -e "${RED}❌ No docker-compose.yml backup found${NC}"
        echo -e "${YELLOW}💡 Manually restoring volume configuration...${NC}"
        
        # Manually restore volume configuration
        sed -i.rollback 's|./kentkonut_db_data:/var/lib/postgresql/data|postgres_data:/var/lib/postgresql/data|g' docker-compose.yml
        
        # Add volume definition back if not present
        if ! grep -q "postgres_data:" docker-compose.yml; then
            cat >> docker-compose.yml << EOF

volumes:
  postgres_data:
    driver: local
EOF
        fi
        echo -e "${GREEN}✅ Manually restored volume configuration${NC}"
    fi
}

# Function to restore data from backup
restore_data_from_backup() {
    local backup_dir=$1
    echo -e "${YELLOW}📋 Restoring data from backup: $backup_dir${NC}"
    
    # Stop containers
    echo -e "${YELLOW}🛑 Stopping containers...${NC}"
    docker-compose down
    
    # Remove local directory if it exists
    if [ -d "$LOCAL_DB_DIR" ]; then
        echo -e "${YELLOW}🗑️ Removing local database directory...${NC}"
        rm -rf "$LOCAL_DB_DIR"
    fi
    
    # Restore volume from backup
    echo -e "${YELLOW}📦 Restoring Docker volume from backup...${NC}"
    docker volume create "$VOLUME_NAME" >/dev/null 2>&1 || true
    
    if [ -d "$backup_dir/volume_backup" ]; then
        docker run --rm -v "$VOLUME_NAME":/target -v "$(pwd)/$backup_dir/volume_backup":/source alpine sh -c "cp -r /source/* /target/"
        echo -e "${GREEN}✅ Volume data restored from backup${NC}"
    else
        echo -e "${YELLOW}⚠️ Volume backup not found, will restore from SQL dump${NC}"
    fi
    
    # Start containers
    echo -e "${YELLOW}🚀 Starting containers...${NC}"
    docker-compose up -d
    
    # Wait for database
    echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
    for i in {1..30}; do
        if docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Database is ready${NC}"
            break
        fi
        echo -e "${YELLOW}⏳ Waiting for database... (attempt $i/30)${NC}"
        sleep 2
    done
    
    # If volume backup didn't work, restore from SQL dump
    if [ ! -d "$backup_dir/volume_backup" ] || [ -z "$(ls -A "$backup_dir/volume_backup" 2>/dev/null)" ]; then
        echo -e "${YELLOW}📊 Restoring from SQL dump...${NC}"
        if [ -f "$backup_dir/kentkonutdb_backup.sql" ]; then
            docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$backup_dir/kentkonutdb_backup.sql"
            echo -e "${GREEN}✅ Database restored from SQL dump${NC}"
        else
            echo -e "${RED}❌ SQL backup file not found${NC}"
            exit 1
        fi
    fi
}

# Function to verify rollback
verify_rollback() {
    echo -e "${YELLOW}🔍 Verifying rollback...${NC}"
    
    # Check if using volume again
    mount_info=$(docker inspect "$CONTAINER_NAME" | grep -A 5 -B 5 "postgres_data")
    if echo "$mount_info" | grep -q "postgres_data"; then
        echo -e "${GREEN}✅ Using Docker volume again${NC}"
    else
        echo -e "${RED}❌ Still using local directory mount${NC}"
        return 1
    fi
    
    # Test database connectivity
    if docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Database connectivity restored${NC}"
    else
        echo -e "${RED}❌ Database connectivity failed${NC}"
        return 1
    fi
    
    # Test data integrity
    page_count=$(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM \"Page\";" 2>/dev/null | xargs)
    if [ "$page_count" -ge 0 ] 2>/dev/null; then
        echo -e "${GREEN}✅ Database contains $page_count pages${NC}"
    else
        echo -e "${RED}❌ Data integrity check failed${NC}"
        return 1
    fi
    
    # Test backend API
    sleep 10  # Give backend time to start
    if curl -s http://localhost:3010/api/health | grep -q "OK"; then
        echo -e "${GREEN}✅ Backend API is responding${NC}"
    else
        echo -e "${RED}❌ Backend API test failed${NC}"
        return 1
    fi
}

# Main rollback function
main() {
    echo -e "${YELLOW}⚠️ This will rollback the PostgreSQL migration to Docker volumes${NC}"
    echo -e "${YELLOW}📋 Current state will be lost if you proceed${NC}"
    echo
    
    read -p "Are you sure you want to rollback the migration? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Rollback cancelled${NC}"
        exit 0
    fi
    
    # Find latest backup
    backup_dir=$(find_latest_backup)
    echo -e "${GREEN}📁 Found backup: $backup_dir${NC}"
    
    # Confirm backup
    echo -e "${YELLOW}📋 Backup contents:${NC}"
    ls -la "$backup_dir"
    echo
    
    read -p "Use this backup for rollback? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Rollback cancelled${NC}"
        exit 0
    fi
    
    rollback_configuration
    restore_data_from_backup "$backup_dir"
    verify_rollback
    
    echo -e "\n${GREEN}🎉 Rollback completed successfully!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo -e "${BLUE}📦 Database is now using Docker volumes again${NC}"
    echo -e "${BLUE}💾 Data restored from: $backup_dir${NC}"
    echo -e "${BLUE}🔧 Backend: http://localhost:3010${NC}"
    echo -e "\n${YELLOW}💡 You can now remove the local directory: $LOCAL_DB_DIR${NC}"
}

# Run main function
main "$@"
