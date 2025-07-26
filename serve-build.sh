#!/bin/bash

# Script to serve the built React application
echo "🚀 Starting Resume Optimizer with LinkedIn-style Sign-in..."
echo "📍 Serving from: $(pwd)/frontend/build"
echo "🌐 Application will be available at: http://localhost:8080"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "Using Python 3 HTTP server..."
    cd frontend/build && python3 -m http.server 8080
elif command -v python &> /dev/null; then
    echo "Using Python 2 HTTP server..."
    cd frontend/build && python -m SimpleHTTPServer 8080
else
    echo "❌ Python not found. Please install Python or use another web server."
    echo "💡 Alternative: Use 'npx serve build' if you have Node.js"
    exit 1
fi
