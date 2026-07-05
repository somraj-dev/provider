#!/bin/bash
# ============================================
# AxioVital Local Development Setup Script
# ============================================

set -euo pipefail

echo "=========================================="
echo "AxioVital Provider — Local Setup"
echo "=========================================="

# Check prerequisites
echo "Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed."; exit 1; }

echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Docker: $(docker --version)"

# Copy environment files
echo ""
echo "Setting up environment files..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example"
else
  echo ".env already exists, skipping"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Start infrastructure
echo ""
echo "Starting infrastructure services..."
docker compose up postgres redis opensearch -d

echo ""
echo "=========================================="
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "  npm run dev:backend    # Start backend (port 4000)"
echo "  npm run dev:frontend   # Start frontend (port 3000)"
echo "  npm run dev:desktop    # Start desktop app"
echo "=========================================="
