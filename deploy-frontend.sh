#!/bin/bash

# Frontend Deployment Script for JobTailorAI
# This script provides multiple deployment options

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "🚀 JobTailorAI Frontend Deployment"
echo "=================================="

# Check if build exists
if [ ! -d "frontend/build" ]; then
    print_error "Build directory not found. Please run ./build.sh first."
    exit 1
fi

print_success "Build directory found"

# Show deployment options
echo ""
print_status "Choose deployment method:"
echo "1) Test locally (serve on localhost:3000)"
echo "2) Deploy to AWS S3 + CloudFront"
echo "3) Create deployment package (zip)"
echo "4) Show deployment info only"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        print_status "Starting local server..."
        if command -v serve &> /dev/null; then
            cd frontend && npx serve -s build -l 3000
        else
            print_status "Installing serve..."
            npm install -g serve
            cd frontend && npx serve -s build -l 3000
        fi
        ;;
    
    2)
        print_status "AWS S3 Deployment"
        read -p "Enter your S3 bucket name: " bucket_name
        
        if [ -z "$bucket_name" ]; then
            print_error "Bucket name is required"
            exit 1
        fi
        
        print_status "Syncing to S3 bucket: $bucket_name"
        cd frontend
        
        if aws s3 sync build/ s3://$bucket_name --delete; then
            print_success "Files uploaded to S3 successfully!"
            
            read -p "Do you have a CloudFront distribution ID? (y/n): " has_cloudfront
            if [ "$has_cloudfront" = "y" ]; then
                read -p "Enter CloudFront distribution ID: " dist_id
                if [ ! -z "$dist_id" ]; then
                    print_status "Creating CloudFront invalidation..."
                    aws cloudfront create-invalidation --distribution-id $dist_id --paths "/*"
                    print_success "CloudFront cache invalidated!"
                fi
            fi
            
            print_success "Deployment completed!"
            echo "Your site should be available at: http://$bucket_name.s3-website-us-east-1.amazonaws.com"
        else
            print_error "S3 sync failed. Check your AWS credentials and bucket permissions."
            exit 1
        fi
        ;;
    
    3)
        print_status "Creating deployment package..."
        cd frontend
        
        # Create timestamp for unique filename
        timestamp=$(date +"%Y%m%d_%H%M%S")
        zip_name="jobtailorai_build_$timestamp.zip"
        
        if zip -r $zip_name build/; then
            print_success "Deployment package created: $zip_name"
            print_status "Package size: $(du -h $zip_name | cut -f1)"
            print_status "Upload this file to your hosting provider"
        else
            print_error "Failed to create deployment package"
            exit 1
        fi
        ;;
    
    4)
        print_status "Deployment Information"
        echo ""
        echo "📁 Build Location: $(pwd)/frontend/build/"
        echo "📦 Build Size: $(du -sh frontend/build | cut -f1)"
        echo "📄 Files: $(find frontend/build -type f | wc -l) files"
        echo ""
        
        print_status "Environment Configuration:"
        if [ -f "frontend/.env" ]; then
            echo "✅ .env file found"
            grep "REACT_APP_" frontend/.env | sed 's/=.*/=***/' || true
        else
            print_warning "⚠️  .env file not found"
        fi
        
        echo ""
        print_status "Deployment Options:"
        echo "• AWS Amplify: Connect Git repo for automatic deployments"
        echo "• AWS S3: Use option 2 of this script"
        echo "• Netlify: Drag & drop the build folder"
        echo "• Vercel: Connect Git repo or use CLI"
        echo "• Manual: Use option 3 to create zip package"
        
        echo ""
        print_status "Quick Commands:"
        echo "Local test:    npx serve -s frontend/build -l 3000"
        echo "S3 deploy:     aws s3 sync frontend/build/ s3://your-bucket --delete"
        echo "Create zip:    cd frontend && zip -r build.zip build/"
        ;;
    
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
print_success "Deployment script completed! 🎉"
