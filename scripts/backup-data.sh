#!/bin/bash
# scripts/backup-data.sh - Backup data from root

set -e

# Configuration
BACKUP_DIR="kentkonut-backend/backups/$(date +%Y%m%d_%H%M%S)"
CONTAINER_NAME="kentkonut-postgres"
DB_NAME="kentkonutdb"
DB_USER="postgres"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Starting backup process...${NC}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check if PostgreSQL container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}❌ PostgreSQL container is not running!${NC}"
    exit 1
fi

# Backup PostgreSQL data
echo -e "${YELLOW}📊 Backing up PostgreSQL database...${NC}"
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/kentkonutdb_backup.sql"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database backup completed${NC}"
else
    echo -e "${RED}❌ Database backup failed${NC}"
    exit 1
fi

# Backup uploaded files
echo -e "${YELLOW}📁 Backing up media files...${NC}"
if [ -d "kentkonut-backend/public/uploads" ]; then
    cp -r kentkonut-backend/public/uploads "$BACKUP_DIR/uploads"
    echo -e "${GREEN}✅ Uploads backup completed${NC}"
fi

if [ -d "kentkonut-backend/public/media" ]; then
    cp -r kentkonut-backend/public/media "$BACKUP_DIR/media"
    echo -e "${GREEN}✅ Media backup completed${NC}"
fi

if [ -d "kentkonut-backend/public/banners" ]; then
    cp -r kentkonut-backend/public/banners "$BACKUP_DIR/banners"
    echo -e "${GREEN}✅ Banners backup completed${NC}"
fi

if [ -d "kentkonut-backend/public/haberler" ]; then
    cp -r kentkonut-backend/public/haberler "$BACKUP_DIR/haberler"
    echo -e "${GREEN}✅ Haberler backup completed${NC}"
fi

if [ -d "kentkonut-backend/public/hafriyat" ]; then
    cp -r kentkonut-backend/public/hafriyat "$BACKUP_DIR/hafriyat"
    echo -e "${GREEN}✅ Hafriyat backup completed${NC}"
fi

if [ -d "kentkonut-backend/public/kurumsal" ]; then
    cp -r kentkonut-backend/public/kurumsal "$BACKUP_DIR/kurumsal"
    echo -e "${GREEN}✅ Kurumsal backup completed${NC}"
fi

if [ -d "kentkonut-backend/public/services" ]; then
    cp -r kentkonut-backend/public/services "$BACKUP_DIR/services"
    echo -e "${GREEN}✅ Services backup completed${NC}"
fi

if [ -d "kentkonut-backend/public/proje" ]; then
    cp -r kentkonut-backend/public/proje "$BACKUP_DIR/proje"
    echo -e "${GREEN}✅ Proje backup completed${NC}"
fi

# Backup environment files
echo -e "${YELLOW}⚙️ Backing up environment configuration...${NC}"
cp kentkonut-backend/.env "$BACKUP_DIR/.env.backup" 2>/dev/null || echo -e "${YELLOW}⚠️ No .env file found${NC}"

# Create backup info file
cat > "$BACKUP_DIR/backup_info.txt" << EOF
Backup Information
==================
Date: $(date)
Database: $DB_NAME
Container: $CONTAINER_NAME
Backup Directory: $BACKUP_DIR

Files Included:
- kentkonutdb_backup.sql (PostgreSQL database dump)
- uploads/ (uploaded files)
- media/ (media files)
- banners/ (banner images)
- haberler/ (news images)
- hafriyat/ (excavation images)
- kurumsal/ (corporate images)
- services/ (service images)
- proje/ (project images)
- .env.backup (environment variables)

Restore Instructions:
1. Start PostgreSQL container
2. Run: docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < kentkonutdb_backup.sql
3. Copy media directories back to kentkonut-backend/public/ folder
4. Restore environment files if needed
EOF

echo -e "${GREEN}✅ Backup completed successfully!${NC}"
echo -e "${GREEN}📁 Backup location: $BACKUP_DIR${NC}"
echo -e "${YELLOW}💡 Backup size: $(du -sh "$BACKUP_DIR" | cut -f1)${NC}"
