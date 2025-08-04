#!/bin/bash

# Script to build and deploy frontend changes
# Usage: ./update-frontend.sh

set -e

echo "🔄 Building frontend with Beta tags..."

cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the frontend
echo "🏗️ Building frontend..."
npm run build

echo "✅ Frontend built successfully!"
echo ""
echo "📋 Next steps:"
echo "1. The build files are in frontend/build/"
echo "2. Deploy to AWS Amplify or your hosting platform"
echo "3. The Compare Versions button now shows a Beta tag"
echo ""
echo "🎯 Changes made:"
echo "- Added Beta tag to Compare Versions button"
echo "- Added Beta tag to Compare dialog title"
echo "- Beta tags are responsive (smaller on mobile)"
echo ""
echo "🚀 Ready for deployment!"
