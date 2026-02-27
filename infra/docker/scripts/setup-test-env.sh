#!/bin/bash
# Setup script for synthetic-data-generator test environment

set -e

echo "🔧 Setting up test environment for synthetic-data-generator"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p ../../synthetic-data-generator/examples/configs
mkdir -p ../../synthetic-data-generator/examples/output

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build the Docker image
echo "🏗️  Building synthetic-data-generator Docker image..."
cd ../..
docker build -f infra/docker/images/synthetic-data-generator/Dockerfile -t synthetic-data-generator:latest .

echo "✅ Setup complete!"
echo ""
echo "To start the services:"
echo "  docker-compose -f infra/docker/docker-compose.yaml up -d synthetic-data-generator"
echo ""
echo "To run tests:"
echo "  ./infra/docker/scripts/test-synthetic-data.sh"
