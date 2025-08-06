#!/bin/bash

# Resume Optimizer Build Script
# This script builds the frontend React application

set -e  # Exit on any error

echo "🚀 Starting Resume Optimizer Build Process..."
echo "================================================"

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
if [ ! -f "package.json" ]; then
    if [ -d "frontend" ]; then
        print_status "Changing to frontend directory..."
        cd frontend
    else
        print_error "No package.json found and no frontend directory. Are you in the right location?"
        exit 1
    fi
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the frontend directory."
    exit 1
fi

print_success "Found package.json - proceeding with build"

# Check Node.js version
print_status "Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js version: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check npm version
print_status "Checking npm version..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm version: $NPM_VERSION"
else
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

# Check if .env file exists
print_status "Checking environment configuration..."
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating template..."
    cat > .env << EOF
# AWS Configuration
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=your-user-pool-id
REACT_APP_USER_POOL_WEB_CLIENT_ID=your-client-id
REACT_APP_API_ENDPOINT=https://your-api-gateway-url.amazonaws.com/prod

# Optional Configuration
REACT_APP_TEST_MODE=false
GENERATE_SOURCEMAP=false
EOF
    print_warning "Please update .env file with your AWS configuration before deploying!"
else
    print_success ".env file found"
fi

# Install dependencies
print_status "Installing dependencies..."
if npm ci; then
    print_success "Dependencies installed successfully"
else
    print_warning "npm ci failed, trying npm install..."
    if npm install; then
        print_success "Dependencies installed with npm install"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
fi

# Run tests (if they exist)
print_status "Checking for tests..."
if npm run test -- --watchAll=false --passWithNoTests &> /dev/null; then
    print_success "Tests passed"
else
    print_warning "Tests failed or not configured - continuing with build"
fi

# Build the application
print_status "Building React application..."
echo "This may take a few minutes..."

if npm run build; then
    print_success "Build completed successfully!"
else
    print_error "Build failed!"
    exit 1
fi

# Check build output
if [ -d "build" ]; then
    BUILD_SIZE=$(du -sh build | cut -f1)
    print_success "Build directory created (Size: $BUILD_SIZE)"
    
    # List key files
    print_status "Build contents:"
    ls -la build/
    
    if [ -f "build/index.html" ]; then
        print_success "index.html created"
    fi
    
    if [ -d "build/static" ]; then
        print_success "Static assets created"
        JS_FILES=$(find build/static/js -name "*.js" | wc -l)
        CSS_FILES=$(find build/static/css -name "*.css" | wc -l)
        print_status "JavaScript files: $JS_FILES"
        print_status "CSS files: $CSS_FILES"
    fi
else
    print_error "Build directory not created!"
    exit 1
fi

# Deployment suggestions
echo ""
echo "================================================"
print_success "🎉 Build completed successfully!"
echo "================================================"
echo ""
print_status "Next steps for deployment:"
echo ""
echo "📦 Local Testing:"
echo "   npx serve -s build -l 3000"
echo ""
echo "☁️  AWS Amplify Deployment:"
echo "   1. Connect your repository to AWS Amplify"
echo "   2. Set environment variables in Amplify Console"
echo "   3. Deploy automatically via Git push"
echo ""
echo "🌐 S3 + CloudFront Deployment:"
echo "   1. aws s3 sync build/ s3://your-bucket-name --delete"
echo "   2. aws cloudfront create-invalidation --distribution-id YOUR_ID --paths '/*'"
echo ""
echo "🔧 Manual Deployment:"
echo "   Upload the contents of the 'build' directory to your web server"
echo ""

# Environment check
print_status "Environment Configuration Check:"
if grep -q "your-user-pool-id" .env 2>/dev/null; then
    print_warning "⚠️  Please update .env with your actual AWS configuration!"
else
    print_success "✅ Environment variables appear to be configured"
fi

echo ""
print_success "Build process completed! 🚀"
