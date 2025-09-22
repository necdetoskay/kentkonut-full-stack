#!/bin/sh
# Docker entrypoint script for KentKonut Frontend
# Handles nginx configuration with dynamic backend hostname

set -e

# Default backend host if not provided
BACKEND_HOST=${BACKEND_HOST:-kentkonut-backend-prod}

echo "Starting KentKonut Frontend..."
echo "Backend host: $BACKEND_HOST"

# Check if backend is reachable before starting nginx
echo "Waiting for backend to be available..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    echo "Attempt $attempt/$max_attempts: Checking backend at $BACKEND_HOST:3021..."
    
    if nc -z "$BACKEND_HOST" 3021 2>/dev/null; then
        echo "Backend is available!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "WARNING: Backend not available after $max_attempts attempts. Starting nginx anyway..."
        break
    fi
    
    echo "Backend not ready, waiting 2 seconds..."
    sleep 2
    attempt=$((attempt + 1))
done

# Process nginx configuration template
echo "Processing nginx configuration..."
envsubst '${BACKEND_HOST}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Validate nginx configuration
echo "Validating nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx configuration is valid"
else
    echo "ERROR: Nginx configuration is invalid!"
    exit 1
fi

# Start nginx
echo "Starting nginx..."
exec nginx -g 'daemon off;'
