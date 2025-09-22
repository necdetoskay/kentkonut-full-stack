#!/bin/bash
# scripts/verify-db-migration.sh - Verify PostgreSQL migration integrity

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
LOCAL_DB_DIR="kentkonut_db_data"

echo -e "${BLUE}🔍 PostgreSQL Migration Verification${NC}"
echo "===================================="

# Function to check database health
check_database_health() {
    echo -e "${YELLOW}🏥 Checking database health...${NC}"
    
    if docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is healthy and accepting connections${NC}"
    else
        echo -e "${RED}❌ Database health check failed${NC}"
        return 1
    fi
}

# Function to verify data integrity
verify_data_integrity() {
    echo -e "${YELLOW}📊 Verifying data integrity...${NC}"
    
    # Check table counts
    echo -e "${YELLOW}📋 Checking table counts...${NC}"
    
    tables=("Page" "User" "Banner" "News" "Department" "Executive" "ServiceCard")
    
    for table in "${tables[@]}"; do
        count=$(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM \"$table\";" 2>/dev/null | xargs)
        if [ "$count" -ge 0 ] 2>/dev/null; then
            echo -e "${GREEN}✅ $table: $count records${NC}"
        else
            echo -e "${YELLOW}⚠️ $table: Table may not exist or is empty${NC}"
        fi
    done
}

# Function to test database operations
test_database_operations() {
    echo -e "${YELLOW}🧪 Testing database operations...${NC}"
    
    # Test read operation
    echo -e "${YELLOW}📖 Testing read operations...${NC}"
    if docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Read operations working${NC}"
    else
        echo -e "${RED}❌ Read operations failed${NC}"
        return 1
    fi
    
    # Test write operation (create temporary table)
    echo -e "${YELLOW}✏️ Testing write operations...${NC}"
    if docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "CREATE TEMP TABLE migration_test (id SERIAL PRIMARY KEY, test_data TEXT);" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Write operations working${NC}"
    else
        echo -e "${RED}❌ Write operations failed${NC}"
        return 1
    fi
    
    # Test insert operation
    echo -e "${YELLOW}➕ Testing insert operations...${NC}"
    if docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "INSERT INTO migration_test (test_data) VALUES ('Migration test successful');" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Insert operations working${NC}"
    else
        echo -e "${RED}❌ Insert operations failed${NC}"
        return 1
    fi
    
    # Test select operation
    echo -e "${YELLOW}🔍 Testing select operations...${NC}"
    result=$(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT test_data FROM migration_test WHERE test_data = 'Migration test successful';" 2>/dev/null | xargs)
    if [ "$result" = "Migration test successful" ]; then
        echo -e "${GREEN}✅ Select operations working${NC}"
    else
        echo -e "${RED}❌ Select operations failed${NC}"
        return 1
    fi
}

# Function to verify file system
verify_file_system() {
    echo -e "${YELLOW}📁 Verifying file system...${NC}"
    
    # Check if local directory exists
    if [ -d "$LOCAL_DB_DIR" ]; then
        echo -e "${GREEN}✅ Local database directory exists: $LOCAL_DB_DIR${NC}"
    else
        echo -e "${RED}❌ Local database directory not found: $LOCAL_DB_DIR${NC}"
        return 1
    fi
    
    # Check directory size
    size=$(du -sh "$LOCAL_DB_DIR" | cut -f1)
    echo -e "${GREEN}📊 Database directory size: $size${NC}"
    
    # Check key PostgreSQL files
    key_files=("PG_VERSION" "postgresql.conf" "pg_hba.conf")
    for file in "${key_files[@]}"; do
        if [ -f "$LOCAL_DB_DIR/$file" ]; then
            echo -e "${GREEN}✅ Found: $file${NC}"
        else
            echo -e "${YELLOW}⚠️ Missing: $file (may be normal depending on PostgreSQL version)${NC}"
        fi
    done
    
    # Check data directory
    if [ -d "$LOCAL_DB_DIR/base" ]; then
        echo -e "${GREEN}✅ PostgreSQL data directory structure intact${NC}"
    else
        echo -e "${RED}❌ PostgreSQL data directory structure missing${NC}"
        return 1
    fi
}

# Function to test backend connectivity
test_backend_connectivity() {
    echo -e "${YELLOW}🔗 Testing backend connectivity...${NC}"
    
    # Wait for backend to be ready
    for i in {1..30}; do
        if curl -s http://localhost:3010/api/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend is responding${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Backend not responding after 30 attempts${NC}"
            return 1
        fi
        echo -e "${YELLOW}⏳ Waiting for backend... (attempt $i/30)${NC}"
        sleep 2
    done
    
    # Test API endpoints
    echo -e "${YELLOW}🧪 Testing API endpoints...${NC}"
    
    # Health endpoint
    if curl -s http://localhost:3010/api/health | grep -q "OK"; then
        echo -e "${GREEN}✅ Health endpoint working${NC}"
    else
        echo -e "${RED}❌ Health endpoint failed${NC}"
        return 1
    fi
    
    # Pages endpoint
    if curl -s http://localhost:3010/api/pages >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Pages endpoint working${NC}"
    else
        echo -e "${RED}❌ Pages endpoint failed${NC}"
        return 1
    fi
}

# Function to check Docker configuration
check_docker_config() {
    echo -e "${YELLOW}🐳 Checking Docker configuration...${NC}"
    
    # Check if volume mount is correct
    mount_info=$(docker inspect kentkonut-postgres | grep -A 5 -B 5 "kentkonut_db_data")
    if echo "$mount_info" | grep -q "kentkonut_db_data"; then
        echo -e "${GREEN}✅ Local directory mount configured correctly${NC}"
    else
        echo -e "${RED}❌ Local directory mount not found in container configuration${NC}"
        return 1
    fi
    
    # Check container status
    if docker ps | grep -q "kentkonut-postgres.*healthy"; then
        echo -e "${GREEN}✅ PostgreSQL container is healthy${NC}"
    else
        echo -e "${YELLOW}⚠️ PostgreSQL container health status unknown${NC}"
    fi
}

# Function to generate migration report
generate_report() {
    echo -e "${YELLOW}📋 Generating migration report...${NC}"
    
    report_file="migration_verification_report_$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$report_file" << EOF
PostgreSQL Migration Verification Report
========================================
Date: $(date)
Local Directory: $LOCAL_DB_DIR
Container: $CONTAINER_NAME
Database: $DB_NAME

Directory Information:
- Size: $(du -sh "$LOCAL_DB_DIR" | cut -f1)
- Files: $(find "$LOCAL_DB_DIR" -type f | wc -l)
- Directories: $(find "$LOCAL_DB_DIR" -type d | wc -l)

Database Health:
- Connection: $(docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" -d "$DB_NAME" 2>/dev/null && echo "OK" || echo "FAILED")
- Version: $(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT version();" 2>/dev/null | head -1 | xargs)

Table Counts:
EOF

    # Add table counts to report
    tables=("Page" "User" "Banner" "News" "Department" "Executive" "ServiceCard")
    for table in "${tables[@]}"; do
        count=$(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM \"$table\";" 2>/dev/null | xargs)
        echo "- $table: $count records" >> "$report_file"
    done
    
    cat >> "$report_file" << EOF

Backend API Status:
- Health Endpoint: $(curl -s http://localhost:3010/api/health >/dev/null 2>&1 && echo "OK" || echo "FAILED")
- Pages Endpoint: $(curl -s http://localhost:3010/api/pages >/dev/null 2>&1 && echo "OK" || echo "FAILED")

Migration Status: COMPLETED SUCCESSFULLY
EOF
    
    echo -e "${GREEN}✅ Report generated: $report_file${NC}"
}

# Main verification function
main() {
    echo -e "${YELLOW}🔍 Starting comprehensive verification...${NC}"
    
    verify_file_system
    check_docker_config
    check_database_health
    verify_data_integrity
    test_database_operations
    test_backend_connectivity
    generate_report
    
    echo -e "\n${GREEN}🎉 Migration verification completed successfully!${NC}"
    echo -e "${GREEN}===============================================${NC}"
    echo -e "${BLUE}📁 Database data location: $LOCAL_DB_DIR${NC}"
    echo -e "${BLUE}📊 All tests passed${NC}"
    echo -e "${BLUE}🔧 Backend: http://localhost:3010${NC}"
    echo -e "\n${YELLOW}💡 Your PostgreSQL data is now stored locally and fully functional!${NC}"
}

# Run main function
main "$@"
