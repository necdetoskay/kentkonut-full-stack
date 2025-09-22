# 🗄️ PostgreSQL Data Migration Guide

## **From Docker Volumes to Local Directory Structure**

This guide provides step-by-step instructions to safely migrate your PostgreSQL data from Docker's internal volume system to a visible, accessible local directory structure.

## 📋 **Migration Overview**

**Current State**: PostgreSQL data stored in Docker volume `kentkonut-full-stack_postgres_data`  
**Target State**: PostgreSQL data stored in local directory `kentkonut_db_data/`  
**Goal**: Zero data loss, full functionality preservation

## 🛡️ **Safety Features**

- ✅ **Multiple Backup Layers** - SQL dump + volume data backup
- ✅ **Rollback Capability** - Complete rollback script provided
- ✅ **Data Verification** - Comprehensive integrity checks
- ✅ **Step-by-Step Process** - Automated with manual checkpoints

## 📁 **What You'll Get**

After migration:
```
kentkonut-full-stack/
├── kentkonut_db_data/          # ← Your PostgreSQL data (visible & accessible)
│   ├── base/                   # Database files
│   ├── global/                 # Global data
│   ├── pg_wal/                 # Write-ahead logs
│   ├── postgresql.conf         # Configuration
│   └── ...                     # Other PostgreSQL files
├── docker-compose.yml          # Updated to use local directory
└── kentkonut-backend/backups/  # Migration backups
```

## 🚀 **Step-by-Step Migration Process**

### **Prerequisites Check**

1. **Ensure containers are running**:
   ```bash
   docker-compose ps
   ```
   All containers should show "healthy" status.

2. **Verify current data**:
   ```bash
   curl http://localhost:3010/api/health
   curl http://localhost:3010/api/pages
   ```

3. **Check available disk space** (recommended 2GB+):
   ```bash
   df -h .
   ```

### **Step 1: Run the Migration Script**

**⚠️ IMPORTANT**: Use Git Bash or WSL on Windows for shell script execution.

```bash
# From the root kentkonut-full-stack/ directory
./scripts/migrate-db-to-local.sh
```

**What this script does**:
1. ✅ Creates comprehensive backup (SQL dump + volume data)
2. ✅ Creates local directory `kentkonut_db_data/`
3. ✅ Safely copies data from Docker volume to local directory
4. ✅ Updates `docker-compose.yml` configuration
5. ✅ Tests the new configuration
6. ✅ Verifies data integrity

**Expected Output**:
```
🗄️ PostgreSQL Data Migration to Local Directory
==================================================
🔍 Checking prerequisites...
💾 Creating comprehensive backup...
✅ SQL dump backup completed
✅ Volume data backup completed
📁 Creating local database directory...
✅ Created directory: kentkonut_db_data
🔄 Migrating data from Docker volume to local directory...
🛑 Stopping backend container...
📋 Copying PostgreSQL data...
✅ Data migration completed
⚙️ Updating docker-compose.yml configuration...
✅ Updated docker-compose.yml configuration
🧪 Testing migration...
🛑 Stopping all containers...
🚀 Starting containers with new configuration...
⏳ Waiting for database to be ready...
✅ Database is ready
🔍 Testing database connectivity...
✅ Database contains X pages
🔍 Testing backend API...
✅ Backend API is responding
✅ Migration test completed successfully

🎉 Migration completed successfully!
================================
📁 Database data is now stored in: kentkonut_db_data
💾 Backup available at: kentkonut-backend/backups/migration_YYYYMMDD_HHMMSS
🔧 Backend: http://localhost:3010
```

### **Step 2: Verify Migration Success**

```bash
# Run comprehensive verification
./scripts/verify-db-migration.sh
```

**What this verifies**:
- ✅ Database health and connectivity
- ✅ Data integrity (table counts, operations)
- ✅ File system structure
- ✅ Backend API functionality
- ✅ Docker configuration

### **Step 3: Test Your Application**

1. **Test Backend API**:
   ```bash
   curl http://localhost:3010/api/health
   curl http://localhost:3010/api/pages
   ```

2. **Test Database Operations**:
   - Access admin panel
   - Create/edit content
   - Upload media files
   - Verify all functionality

3. **Check Data Persistence**:
   ```bash
   # Stop and restart containers
   docker-compose down
   docker-compose up -d
   
   # Verify data is still there
   curl http://localhost:3010/api/pages
   ```

## 📊 **Before vs After Comparison**

### **Before Migration**
```yaml
# docker-compose.yml
postgresql:
  volumes:
    - postgres_data:/var/lib/postgresql/data  # Docker volume

volumes:
  postgres_data:
    driver: local
```

### **After Migration**
```yaml
# docker-compose.yml
postgresql:
  volumes:
    - ./kentkonut_db_data:/var/lib/postgresql/data  # Local directory

# volumes section removed
```

## 🔄 **Rollback Instructions (If Needed)**

If something goes wrong, you can rollback:

```bash
# Rollback to Docker volumes
./scripts/rollback-db-migration.sh
```

This will:
1. Restore original `docker-compose.yml`
2. Recreate Docker volume
3. Restore data from backup
4. Verify rollback success

## 🎯 **Benefits After Migration**

### **Visibility & Access**
- ✅ Database files visible in file explorer
- ✅ Direct access to PostgreSQL data directory
- ✅ Easy backup with standard file tools
- ✅ Better understanding of data structure

### **Development Benefits**
- ✅ Easier debugging and inspection
- ✅ Direct file system access for tools
- ✅ Simplified backup/restore procedures
- ✅ Better integration with host system

### **Operational Benefits**
- ✅ Standard file system permissions
- ✅ Integration with host backup systems
- ✅ Easier migration between environments
- ✅ Reduced Docker complexity

## 🔧 **Configuration Changes**

The migration automatically updates your `docker-compose.yml`:

```diff
  postgresql:
    volumes:
-     - postgres_data:/var/lib/postgresql/data
+     - ./kentkonut_db_data:/var/lib/postgresql/data

- volumes:
-   postgres_data:
-     driver: local
```

## 📁 **Directory Structure After Migration**

```
kentkonut_db_data/
├── base/                    # Database cluster data
│   ├── 1/                   # Template database
│   ├── 13395/              # Your kentkonutdb database
│   └── ...
├── global/                  # Cluster-wide data
├── pg_commit_ts/           # Commit timestamp data
├── pg_dynshmem/            # Dynamic shared memory
├── pg_logical/             # Logical replication data
├── pg_multixact/           # Multitransaction data
├── pg_notify/              # LISTEN/NOTIFY data
├── pg_replslot/            # Replication slots
├── pg_serial/              # Serializable isolation data
├── pg_snapshots/           # Exported snapshots
├── pg_stat/                # Statistics data
├── pg_stat_tmp/            # Temporary statistics
├── pg_subtrans/            # Subtransaction data
├── pg_tblspc/              # Tablespace symbolic links
├── pg_twophase/            # Two-phase commit data
├── pg_wal/                 # Write-ahead log files
├── pg_xact/                # Transaction commit data
├── PG_VERSION              # PostgreSQL version
├── postgresql.auto.conf    # Auto configuration
├── postgresql.conf         # Main configuration
├── pg_hba.conf            # Host-based authentication
├── pg_ident.conf          # User name mapping
└── postmaster.opts        # Server command line options
```

## 🚨 **Troubleshooting**

### **Migration Fails**
1. Check Docker is running: `docker info`
2. Ensure containers are healthy: `docker-compose ps`
3. Check disk space: `df -h .`
4. Review error messages in script output

### **Permission Issues**
```bash
# Fix permissions if needed
sudo chown -R 999:999 kentkonut_db_data/
chmod -R 700 kentkonut_db_data/
```

### **Database Won't Start**
1. Check logs: `docker-compose logs postgresql`
2. Verify directory exists: `ls -la kentkonut_db_data/`
3. Try rollback: `./scripts/rollback-db-migration.sh`

### **Data Missing**
1. Check backup: `ls -la kentkonut-backend/backups/migration_*/`
2. Verify volume copy: `ls -la kentkonut_db_data/base/`
3. Use rollback script to restore

## ✅ **Success Criteria**

Migration is successful when:
- ✅ All containers start and show "healthy" status
- ✅ Backend API responds correctly
- ✅ Database contains all original data
- ✅ All application functionality works
- ✅ Data persists after container restart
- ✅ Local directory contains PostgreSQL files

## 🎉 **Post-Migration Tasks**

1. **Update .gitignore** (recommended):
   ```bash
   echo "kentkonut_db_data/" >> .gitignore
   ```

2. **Test backup procedures**:
   ```bash
   # Your data is now easily backed up
   tar -czf db_backup.tar.gz kentkonut_db_data/
   ```

3. **Document the change** for your team

4. **Remove old backups** when satisfied:
   ```bash
   # After confirming everything works
   rm -rf kentkonut-backend/backups/migration_*
   ```

## 📞 **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Review script output for error messages
3. Use the rollback script if needed
4. Verify all prerequisites are met

Your PostgreSQL data will be safely migrated to a local directory structure while maintaining full functionality! 🎯
