#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 JobTailorAI - Production Replica Testing Environment${NC}"
echo "=================================================================="

# Navigate to frontend directory
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Install serve globally if not already installed
if ! command -v serve &> /dev/null; then
    echo -e "${YELLOW}📦 Installing 'serve' package globally...${NC}"
    npm install -g serve
fi

# Clean previous build
echo -e "${BLUE}🧹 Cleaning previous build...${NC}"
rm -rf build

# Build the production version with production environment
echo -e "${BLUE}🔨 Building production version...${NC}"
echo "   - Using production environment variables"
echo "   - Optimizing for performance"
echo "   - Minifying code"
echo ""

REACT_APP_ENV=production-local npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Production build successful!${NC}"
    echo ""
    echo -e "${BLUE}📊 Build Statistics:${NC}"
    
    # Show build size information
    if [ -d "build/static/js" ]; then
        echo "   JavaScript bundles:"
        ls -lh build/static/js/*.js | awk '{print "   - " $9 ": " $5}'
    fi
    
    if [ -d "build/static/css" ]; then
        echo "   CSS bundles:"
        ls -lh build/static/css/*.css | awk '{print "   - " $9 ": " $5}'
    fi
    
    echo ""
    echo -e "${GREEN}🌐 Starting Production Replica Server...${NC}"
    echo "=================================================================="
    echo -e "${YELLOW}📍 Local URL:${NC}      http://localhost:3000"
    echo -e "${YELLOW}🌍 Production URL:${NC} https://jobtailorai.com"
    echo ""
    echo -e "${BLUE}🔍 Testing Features:${NC}"
    echo "   ✓ Resume upload and processing"
    echo "   ✓ Preview functionality"
    echo "   ✓ Side-by-side comparison"
    echo "   ✓ Download capabilities"
    echo "   ✓ User authentication"
    echo "   ✓ Profile management"
    echo ""
    echo -e "${YELLOW}💡 Tips:${NC}"
    echo "   • This is identical to your production environment"
    echo "   • Test with different file types (.txt, .pdf, .docx)"
    echo "   • Try the new preview and comparison features"
    echo "   • Test on different screen sizes"
    echo ""
    echo -e "${RED}Press Ctrl+C to stop the server${NC}"
    echo "=================================================================="
    echo ""
    
    # Serve the production build with production-like settings
    serve -s build -l 3000 --cors
else
    echo ""
    echo -e "${RED}❌ Build failed! Please check the errors above.${NC}"
    exit 1
fi
