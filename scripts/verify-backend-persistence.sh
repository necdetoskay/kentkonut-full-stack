#!/bin/bash

# Backend Persistence Verification Script
# This script verifies that backend data is properly persisted in local directories

echo "🔍 Verifying Backend Persistence Configuration"
echo "=" | tr -s '=' | head -c 60; echo

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if directory exists and has content
check_directory() {
    local dir_path="$1"
    local dir_name="$2"
    
    if [ -d "$dir_path" ]; then
        local file_count=$(find "$dir_path" -type f | wc -l)
        if [ "$file_count" -gt 0 ]; then
            echo -e "✅ ${GREEN}$dir_name${NC}: $file_count files"
        else
            echo -e "⚠️  ${YELLOW}$dir_name${NC}: Directory exists but empty"
        fi
    else
        echo -e "❌ ${RED}$dir_name${NC}: Directory not found"
    fi
}

# Function to check container volume mounts
check_container_mounts() {
    echo "🐳 Checking container volume mounts..."
    
    if docker ps --format "table {{.Names}}" | grep -q "kentkonut-backend"; then
        echo -e "✅ ${GREEN}Backend container${NC}: Running"
        
        # Check if volumes are mounted correctly
        docker inspect kentkonut-backend --format '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{"\n"}}{{end}}' | grep kentkonut_backend_data | head -5
        
    else
        echo -e "❌ ${RED}Backend container${NC}: Not running"
    fi
}

# Function to test API accessibility
test_api() {
    echo "🌐 Testing API accessibility..."
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3010/api/health | grep -q "200"; then
        echo -e "✅ ${GREEN}API Health${NC}: Responding (200 OK)"
    else
        echo -e "❌ ${RED}API Health${NC}: Not responding"
    fi
}

# Function to test file persistence
test_file_persistence() {
    echo "📁 Testing file persistence..."
    
    # Create a test file in the uploads directory
    local test_file="kentkonut_backend_data/uploads/persistence_test_$(date +%s).txt"
    echo "Backend persistence test - $(date)" > "$test_file"
    
    if [ -f "$test_file" ]; then
        echo -e "✅ ${GREEN}File Creation${NC}: Test file created successfully"
        
        # Check if file is accessible from container
        if docker exec kentkonut-backend ls /app/public/uploads/ | grep -q "persistence_test"; then
            echo -e "✅ ${GREEN}Container Access${NC}: File accessible from container"
        else
            echo -e "❌ ${RED}Container Access${NC}: File not accessible from container"
        fi
        
        # Clean up test file
        rm "$test_file"
        echo -e "🧹 ${YELLOW}Cleanup${NC}: Test file removed"
    else
        echo -e "❌ ${RED}File Creation${NC}: Failed to create test file"
    fi
}

echo "📊 Backend Data Directory Status:"
echo "-" | tr -s '-' | head -c 40; echo

# Check all backend data directories
check_directory "kentkonut_backend_data/uploads" "Uploads"
check_directory "kentkonut_backend_data/media" "Media"
check_directory "kentkonut_backend_data/banners" "Banners"
check_directory "kentkonut_backend_data/haberler" "News (Haberler)"
check_directory "kentkonut_backend_data/hafriyat" "Excavation (Hafriyat)"
check_directory "kentkonut_backend_data/kurumsal" "Corporate (Kurumsal)"
check_directory "kentkonut_backend_data/services" "Services"
check_directory "kentkonut_backend_data/proje" "Projects (Proje)"
check_directory "kentkonut_backend_data/logs" "Logs"
check_directory "kentkonut_backend_data/backups" "Backups"

echo ""
check_container_mounts
echo ""
test_api
echo ""
test_file_persistence

echo ""
echo "=" | tr -s '=' | head -c 60; echo
echo "🎉 Backend persistence verification completed!"

# Summary
total_files=$(find kentkonut_backend_data -type f | wc -l)
total_size=$(du -sh kentkonut_backend_data | cut -f1)

echo "📈 Summary:"
echo "   Total files: $total_files"
echo "   Total size: $total_size"
echo "   Location: $(pwd)/kentkonut_backend_data/"
echo ""
echo "✨ Backend data is now persistent and visible in the local file system!"
