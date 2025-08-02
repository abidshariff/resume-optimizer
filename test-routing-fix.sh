#!/bin/bash

# Test script to verify routing fixes work locally
set -e

echo "🧪 Testing React Router client-side routing fixes..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

# Navigate to frontend directory
cd frontend

# Build the project
print_status "Building React application for testing..."
npm run build

# Check if build was successful
if [ -d "build" ]; then
    print_success "Build directory created"
else
    echo "Build failed"
    exit 1
fi

# Check if _redirects file is in build
if [ -f "build/_redirects" ]; then
    print_success "_redirects file found in build directory"
    echo "Content:"
    cat build/_redirects
else
    echo "_redirects file missing from build"
    exit 1
fi

# Check if index.html exists
if [ -f "build/index.html" ]; then
    print_success "index.html found in build directory"
else
    echo "index.html missing from build"
    exit 1
fi

print_status "All routing fix components are in place!"
echo ""
echo "To test locally:"
echo "1. Install serve globally: npm install -g serve"
echo "2. Run: serve -s build -l 3000"
echo "3. Navigate to http://localhost:3000/app/upload"
echo "4. Refresh the page - it should NOT show a white screen"
echo ""
echo "To deploy to production:"
echo "1. Commit and push your changes to trigger Amplify deployment"
echo "2. Or run: ./fix-routing-and-deploy.sh"
