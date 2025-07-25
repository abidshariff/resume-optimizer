#!/bin/bash

# Frontend Deployment Script for AWS Amplify
# This script helps set up AWS Amplify for your Resume Optimizer frontend

set -e

echo "🚀 Setting up AWS Amplify for Resume Optimizer Frontend"
echo ""

# Check if Amplify CLI is installed
if ! command -v amplify &> /dev/null; then
    echo "📦 Installing Amplify CLI..."
    npm install -g @aws-amplify/cli
fi

echo "📋 Amplify CLI Setup Instructions:"
echo ""
echo "1. Initialize Amplify in your project:"
echo "   cd frontend"
echo "   amplify init"
echo ""
echo "2. Add hosting:"
echo "   amplify add hosting"
echo "   - Select 'Amazon CloudFront and S3'"
echo "   - Choose 'DEV (S3 only with HTTP)' or 'PROD (S3 with CloudFront using HTTPS)'"
echo ""
echo "3. Deploy:"
echo "   amplify publish"
echo ""
echo "🔧 Alternative: Manual Amplify Console Setup"
echo ""
echo "1. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify/"
echo "2. Click 'New app' > 'Host web app'"
echo "3. Connect your GitHub repository"
echo "4. Set build settings (amplify.yml is already configured)"
echo "5. Set environment variables:"
echo "   - REACT_APP_AWS_REGION"
echo "   - REACT_APP_USER_POOL_ID"
echo "   - REACT_APP_USER_POOL_WEB_CLIENT_ID"
echo "   - REACT_APP_API_ENDPOINT"
echo "6. Deploy"
echo ""
echo "📖 The values for environment variables are in your frontend/.env file"
