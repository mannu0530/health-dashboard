#!/bin/bash

# Health Dashboard Lightweight Startup Script for 2GB Servers
# This script optimizes the startup process for low-resource environments

set -e

echo "🚀 Health Dashboard Lightweight Startup for 2GB Servers"
echo "======================================================"

# Check system resources
echo "📊 Checking system resources..."

# Check available memory
TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $7}')
USED_MEM=$(free -m | awk 'NR==2{printf "%.0f", $3}')

echo "   Total RAM: ${TOTAL_MEM}MB"
echo "   Available RAM: ${AVAILABLE_MEM}MB"
echo "   Used RAM: ${USED_MEM}MB"

# Check if we have enough memory
if [ $AVAILABLE_MEM -lt 500 ]; then
    echo "⚠️  Warning: Less than 500MB available RAM"
    echo "   Consider freeing up memory or using swap"
    
    # Check if swap is available
    SWAP_SIZE=$(free -m | awk 'NR==3{printf "%.0f", $2}')
    if [ $SWAP_SIZE -eq 0 ]; then
        echo "   No swap space detected"
        echo "   Creating 1GB swap file..."
        sudo fallocate -l 1G /swapfile
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile
        sudo swapon /swapfile
        echo "   Swap file created and activated"
    else
        echo "   Swap space available: ${SWAP_SIZE}MB"
    fi
fi

# Check Docker status
echo "🐳 Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Starting Docker..."
    sudo systemctl start docker
    sleep 5
fi

# Clean up Docker resources if needed
if [ $AVAILABLE_MEM -lt 800 ]; then
    echo "🧹 Cleaning up Docker resources..."
    docker system prune -f
    docker volume prune -f
fi

# Build lightweight images
echo "🔨 Building lightweight Docker images..."
echo "   This may take 5-10 minutes on a 2GB server..."

# Build services one at a time to avoid memory issues
echo "   Building backend..."
docker-compose -f docker-compose.lightweight.yml build backend

echo "   Building frontend..."
docker-compose -f docker-compose.lightweight.yml build frontend

echo "   Building database..."
docker-compose -f docker-compose.lightweight.yml build postgres

echo "   Building cache..."
docker-compose -f docker-compose.lightweight.yml build redis

echo "   Building monitoring..."
docker-compose -f docker-compose.lightweight.yml build prometheus grafana

echo "✅ All images built successfully!"

# Start services
echo "🚀 Starting lightweight services..."
docker-compose -f docker-compose.lightweight.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
docker-compose -f docker-compose.lightweight.yml ps

# Show resource usage
echo "📊 Current resource usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo ""
echo "🎉 Health Dashboard is starting up!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📊 API Docs: http://localhost:8000/docs"
echo "📈 Prometheus: http://localhost:9090"
echo "📊 Grafana: http://localhost:3001 (admin/admin)"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose -f docker-compose.lightweight.yml logs -f"
echo "   Stop services: make down-lightweight"
echo "   Check resources: docker stats"
echo "   View status: docker-compose -f docker-compose.lightweight.yml ps"
echo ""
echo "💡 For optimal performance on 2GB servers:"
echo "   - Monitor memory usage with 'docker stats'"
echo "   - Use 'make down-lightweight' when not needed"
echo "   - Consider increasing swap space if needed"
echo ""
echo "Happy monitoring! 🚀"
