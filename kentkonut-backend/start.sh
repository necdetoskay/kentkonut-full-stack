#!/bin/bash
set -e

echo "🚀 Starting KentKonut Backend Container..."
echo "📅 Timestamp: $(date)"
echo "🔧 Environment: $NODE_ENV"
echo "🌐 Port: $PORT"
echo ""

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
  if npx prisma db push --accept-data-loss 2>/dev/null; then
    echo "✅ Database connection established"
    break
  else
    echo "⏳ Database not ready (attempt $attempt/$max_attempts), waiting 5 seconds..."
    sleep 5
    attempt=$((attempt + 1))
  fi
done

if [ $attempt -gt $max_attempts ]; then
  echo "❌ Failed to connect to database after $max_attempts attempts"
  exit 1
fi

# Create admin user (idempotent)
echo "👤 Creating admin user..."
node prisma/admin-user-seed.js

echo "✅ Database setup completed!"
echo "🎯 Starting Next.js application on port $PORT..."
echo ""

# Start the application
exec node server.js
