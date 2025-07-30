#!/bin/bash

echo "🚀 Setting up local production replica..."

# Navigate to frontend directory
cd frontend

# Install serve globally if not already installed
if ! command -v serve &> /dev/null; then
    echo "📦 Installing 'serve' package globally..."
    npm install -g serve
fi

# Build the production version
echo "🔨 Building production version..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🌐 Starting production replica server..."
    echo "📍 Your app will be available at: http://localhost:3000"
    echo "🔄 This is identical to your live production environment"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "----------------------------------------"
    
    # Serve the production build
    serve -s build -l 3000
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
