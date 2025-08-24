#!/bin/bash

# Ultra-Lightweight Build Script for 2GB Servers
# This script builds the frontend with extreme memory optimization

set -e

echo "🚀 Ultra-Lightweight Build for 2GB Servers"
echo "==========================================="

# Check system resources
echo "📊 Checking system resources..."
TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $7}')

echo "   Total RAM: ${TOTAL_MEM}MB"
echo "   Available RAM: ${AVAILABLE_MEM}MB"

# Ensure we have enough memory
if [ $AVAILABLE_MEM -lt 800 ]; then
    echo "⚠️  Low memory detected. Cleaning up Docker..."
    docker system prune -af
    docker volume prune -f
    sleep 5
fi

# Create a minimal package.json for build
echo "📦 Creating minimal build configuration..."
cd frontend

# Create a minimal .npmrc for memory optimization
cat > .npmrc << EOF
cache=/tmp/.npm
tmp=/tmp/.npm
maxsockets=1
fetch-retries=3
fetch-retry-mintimeout=5000
fetch-retry-maxtimeout=60000
EOF

# Build with extreme memory constraints
echo "🔨 Building frontend with ultra-lightweight configuration..."

# Set Node.js memory limits
export NODE_OPTIONS="--max-old-space-size=256 --optimize-for-size --gc-interval=100"
export NPM_CONFIG_CACHE=/tmp/.npm
export NPM_CONFIG_TMP=/tmp/.npm

# Build using the ultra-lightweight Dockerfile
cd ..
docker build \
    --target production \
    --build-arg NODE_OPTIONS="--max-old-space-size=256" \
    --build-arg NPM_CONFIG_CACHE=/tmp/.npm \
    --build-arg NPM_CONFIG_TMP=/tmp/.npm \
    -f frontend/Dockerfile.ultra-lightweight \
    -t health-dashboard-frontend:ultra-lightweight \
    ./frontend

echo "✅ Frontend built successfully with ultra-lightweight configuration!"

# Build other services
echo "🔨 Building other services..."
docker-compose -f docker-compose.lightweight.yml build backend postgres redis prometheus grafana

echo "🎉 All services built successfully!"
echo ""
echo "📋 To start services:"
echo "   docker-compose -f docker-compose.lightweight.yml up -d"
echo ""
echo "📋 To view logs:"
echo "   docker-compose -f docker-compose.lightweight.yml logs -f"
echo ""
echo "�� Ready to deploy!"
