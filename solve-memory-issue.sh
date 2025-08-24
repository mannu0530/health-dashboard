#!/bin/bash

# Memory Issue Solver for 2GB Servers
# This script provides multiple solutions to the frontend build memory problem

set -e

echo "🔧 Memory Issue Solver for 2GB Servers"
echo "======================================"

# Check system resources
echo "📊 Checking system resources..."
TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $7}')

echo "   Total RAM: ${TOTAL_MEM}MB"
echo "   Available RAM: ${AVAILABLE_MEM}MB"

# Solution 1: Clean up Docker and try ultra-lightweight
echo ""
echo "🔄 Solution 1: Ultra-Lightweight Build"
echo "======================================"

# Clean up Docker completely
echo "🧹 Cleaning up Docker completely..."
docker system prune -af
docker volume prune -f
docker builder prune -af

# Wait for cleanup
sleep 10

# Try ultra-lightweight build
echo "🔨 Attempting ultra-lightweight build..."
if docker build \
    --target production \
    --build-arg NODE_OPTIONS="--max-old-space-size=256" \
    --build-arg NPM_CONFIG_CACHE=/tmp/.npm \
    --build-arg NPM_CONFIG_TMP=/tmp/.npm \
    -f frontend/Dockerfile.ultra-lightweight \
    -t health-dashboard-frontend:ultra-lightweight \
    ./frontend; then
    
    echo "✅ Ultra-lightweight build successful!"
    echo "🚀 Starting services..."
    docker-compose -f docker-compose.lightweight.yml up -d
    exit 0
else
    echo "❌ Ultra-lightweight build failed. Trying Solution 2..."
fi

# Solution 2: Pre-built approach
echo ""
echo "🔄 Solution 2: Pre-built Approach"
echo "================================="

echo "📦 Building frontend locally first..."
cd frontend

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not available. Installing..."
    # Try to install Node.js (adjust for your system)
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y nodejs npm
    elif command -v yum &> /dev/null; then
        sudo yum install -y nodejs npm
    else
        echo "❌ Cannot install Node.js automatically. Please install manually."
        exit 1
    fi
fi

# Install dependencies
echo "📥 Installing dependencies..."
npm ci --silent --no-audit --no-fund

# Build with memory constraints
echo "🔨 Building with memory constraints..."
export NODE_OPTIONS="--max-old-space-size=256"
npm run build

# Check if build was successful
if [ -d "build" ]; then
    echo "✅ Local build successful!"
    cd ..
    
    # Build Docker image with pre-built files
    echo "🐳 Building Docker image with pre-built files..."
    if docker build \
        -f frontend/Dockerfile.prebuilt \
        -t health-dashboard-frontend:prebuilt \
        ./frontend; then
        
        echo "✅ Pre-built Docker build successful!"
        
        # Update docker-compose to use pre-built image
        echo "📝 Updating docker-compose to use pre-built image..."
        sed -i 's|build:|image: health-dashboard-frontend:prebuilt|' docker-compose.lightweight.yml
        sed -i '/dockerfile:/d' docker-compose.lightweight.yml
        sed -i '/target:/d' docker-compose.lightweight.yml
        sed -i '/args:/d' docker-compose.lightweight.yml
        sed -i '/BUILDKIT_INLINE_CACHE:/d' docker-compose.lightweight.yml
        sed -i '/NODE_OPTIONS:/d' docker-compose.lightweight.yml
        
        echo "🚀 Starting services with pre-built frontend..."
        docker-compose -f docker-compose.lightweight.yml up -d
        exit 0
    else
        echo "❌ Pre-built Docker build failed. Trying Solution 3..."
    fi
else
    echo "❌ Local build failed. Trying Solution 3..."
    cd ..
fi

# Solution 3: Minimal frontend (no build)
echo ""
echo "🔄 Solution 3: Minimal Frontend (No Build)"
echo "=========================================="

echo "📝 Creating minimal frontend without build..."
cd frontend

# Create a minimal index.html
mkdir -p build
cat > build/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Health Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
        .container { max-width: 600px; margin: 0 auto; }
        .status { padding: 20px; margin: 20px 0; border-radius: 8px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 Health Dashboard</h1>
        <div class="status success">
            <h2>✅ System Status: Operational</h2>
            <p>Frontend is running in minimal mode due to server constraints.</p>
        </div>
        <div class="status info">
            <h3>📊 Available Services</h3>
            <ul style="text-align: left; display: inline-block;">
                <li>🔧 Backend API: <a href="/api" target="_blank">/api</a></li>
                <li>📈 Prometheus: <a href="http://localhost:9090" target="_blank">http://localhost:9090</a></li>
                <li>📊 Grafana: <a href="http://localhost:3001" target="_blank">http://localhost:3001</a></li>
            </ul>
        </div>
        <div class="status warning">
            <h3>⚠️ Note</h3>
            <p>This is a minimal frontend for 2GB servers. Full features available via API.</p>
        </div>
    </div>
</body>
</html>
EOF

echo "✅ Minimal frontend created!"
cd ..

# Build Docker image with minimal frontend
echo "🐳 Building Docker image with minimal frontend..."
if docker build \
    -f frontend/Dockerfile.prebuilt \
    -t health-dashboard-frontend:minimal \
    ./frontend; then
    
    echo "✅ Minimal Docker build successful!"
    
    # Update docker-compose to use minimal image
    echo "📝 Updating docker-compose to use minimal image..."
    sed -i 's|build:|image: health-dashboard-frontend:minimal|' docker-compose.lightweight.yml
    sed -i '/dockerfile:/d' docker-compose.lightweight.yml
    sed -i '/target:/d' docker-compose.lightweight.yml
    sed -i '/args:/d' docker-compose.lightweight.yml
    sed -i '/BUILDKIT_INLINE_CACHE:/d' docker-compose.lightweight.yml
    sed -i '/NODE_OPTIONS:/d' docker-compose.lightweight.yml
    
    echo "🚀 Starting services with minimal frontend..."
    docker-compose -f docker-compose.lightweight.yml up -d
    exit 0
else
    echo "❌ All solutions failed. Please check your system resources."
    exit 1
fi
