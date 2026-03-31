#!/bin/bash
set -e

echo "🚀 Deploying Jovob..."

# Pull latest images
docker compose pull

# Build and start
docker compose up -d --build

# Wait for DB to be ready
echo "⏳ Waiting for database..."
sleep 5

# Run migrations
docker compose exec app npx prisma migrate deploy

# Health check
echo "🔍 Running health check..."
for i in {1..10}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
  if [ "$STATUS" = "200" ]; then
    echo "✅ Deploy successful! Site is live."
    exit 0
  fi
  echo "  Waiting... ($i/10)"
  sleep 3
done

echo "❌ Health check failed after 30 seconds"
docker compose logs app --tail 50
exit 1
