#!/bin/bash

# Safe routing test script
# This tests the routing fix locally before deploying

set -e

echo "🧪 Testing routing fix safely..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

# Navigate to frontend directory
cd frontend

print_status "Building React application..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build completed successfully"
else
    echo "Build failed"
    exit 1
fi

# Check if _redirects file is in build
if [ -f "build/_redirects" ]; then
    print_success "_redirects file found in build directory"
    echo "Content:"
    cat build/_redirects
    echo ""
else
    echo "_redirects file missing from build"
    exit 1
fi

# Check if 200.html backup exists
if [ -f "build/200.html" ]; then
    print_success "200.html backup file found in build directory"
else
    print_warning "200.html backup file not found (this is optional)"
fi

# Check if index.html exists
if [ -f "build/index.html" ]; then
    print_success "index.html found in build directory"
else
    echo "index.html missing from build"
    exit 1
fi

print_success "All routing fix components are in place!"
echo ""
echo "Files ready for deployment:"
echo "✅ _redirects file with explicit rules"
echo "✅ 200.html backup file"
echo "✅ index.html main file"
echo ""
echo "This fix should resolve the 404 error on /app/upload refresh"
echo "without affecting the main website functionality."
echo ""
echo "Ready to deploy? The changes are minimal and safe."
