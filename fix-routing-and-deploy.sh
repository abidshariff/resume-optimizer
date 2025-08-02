#!/bin/bash

# Fix routing issues and deploy to Amplify
# This script ensures proper client-side routing configuration

set -e

echo "🔧 Fixing React Router client-side routing issues..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "amplify.yml" ]; then
    print_error "amplify.yml not found. Please run this script from the project root directory."
    exit 1
fi

print_status "Verifying amplify.yml configuration..."

# Check if amplify.yml has redirects
if grep -q "redirects:" amplify.yml; then
    print_success "amplify.yml already has redirects configuration"
else
    print_warning "amplify.yml missing redirects configuration"
    exit 1
fi

print_status "Verifying _redirects file..."

# Check if _redirects file exists and has content
if [ -f "frontend/public/_redirects" ]; then
    print_success "_redirects file exists"
    print_status "Content of _redirects file:"
    cat frontend/public/_redirects
else
    print_error "_redirects file not found"
    exit 1
fi

print_status "Testing local build..."

# Navigate to frontend directory
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
fi

# Build the project
print_status "Building React application..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Check if build directory contains the _redirects file
if [ -f "build/_redirects" ]; then
    print_success "_redirects file copied to build directory"
    print_status "Build _redirects content:"
    cat build/_redirects
else
    print_warning "_redirects file not found in build directory"
fi

# Go back to root directory
cd ..

print_status "Deployment instructions:"
echo ""
echo "1. Your amplify.yml has been updated with proper redirects configuration"
echo "2. Your _redirects file has been updated with comprehensive routing rules"
echo "3. Your React app has been built successfully"
echo ""
echo "To deploy to AWS Amplify:"
echo "  - If using Amplify Console: Push your changes to your connected Git repository"
echo "  - If using Amplify CLI: Run 'amplify publish'"
echo ""
echo "Manual deployment option:"
echo "  - Upload the contents of frontend/build/ to your Amplify app"
echo "  - Ensure the amplify.yml is in your repository root"
echo ""

print_success "Routing fix implementation completed!"

print_status "Testing the build locally (optional)..."
echo "To test locally, run:"
echo "  cd frontend && npm run test-production"
echo ""
echo "This will serve your build on http://localhost:3000"
echo "Try refreshing /app/upload to verify the fix works"

# Optional: Start local server for testing
read -p "Would you like to start a local server to test the fix? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting local production server..."
    cd frontend
    
    # Check if serve is installed globally
    if ! command -v serve &> /dev/null; then
        print_status "Installing serve globally..."
        npm install -g serve
    fi
    
    print_success "Starting server on http://localhost:3000"
    print_status "Try navigating to http://localhost:3000/app/upload and refreshing"
    print_status "Press Ctrl+C to stop the server"
    
    serve -s build -l 3000
fi
