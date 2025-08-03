#!/bin/bash

# JobTailorAI Pro - Production Deployment Script
# This script deploys the frontend to AWS Amplify with production configuration

set -e  # Exit on any error

echo "🚀 Starting JobTailorAI Pro Production Deployment..."

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
if [ ! -f "frontend/package.json" ]; then
    print_error "Please run this script from the resume-optimizer root directory"
    exit 1
fi

# Step 1: Pre-deployment checks
print_status "Running pre-deployment checks..."

# Check if production environment file exists
if [ ! -f "frontend/.env.production" ]; then
    print_error "Production environment file not found!"
    print_warning "Please create frontend/.env.production with your live Stripe keys"
    exit 1
fi

# Check if Stripe keys are configured
if grep -q "pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE" frontend/.env.production; then
    print_warning "⚠️  Using placeholder Stripe keys!"
    print_warning "Update frontend/.env.production with your live Stripe keys before deploying"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled"
        exit 1
    fi
fi

# Step 2: Build the application
print_status "Building production application..."
cd frontend

# Install dependencies
print_status "Installing dependencies..."
npm ci

# Run production build
print_status "Creating production build..."
NODE_ENV=production npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed!"
    exit 1
fi

print_success "Build completed successfully!"

# Step 3: Deployment options
cd ..
print_status "Choose deployment method:"
echo "1. AWS Amplify (Recommended)"
echo "2. Manual S3 + CloudFront"
echo "3. Create deployment package only"

read -p "Enter choice (1-3): " choice

case $choice in
    1)
        print_status "Deploying to AWS Amplify..."
        
        # Check if Amplify CLI is installed
        if ! command -v amplify &> /dev/null; then
            print_error "Amplify CLI not found!"
            print_status "Install with: npm install -g @aws-amplify/cli"
            exit 1
        fi
        
        # Deploy to Amplify
        print_status "Publishing to Amplify..."
        cd frontend
        amplify publish
        
        if [ $? -eq 0 ]; then
            print_success "🎉 Deployment to Amplify successful!"
            print_status "Your app is now live!"
        else
            print_error "Amplify deployment failed"
            exit 1
        fi
        ;;
        
    2)
        print_status "Creating S3 deployment package..."
        
        # Create deployment package
        cd frontend
        tar -czf ../jobtailorai-pro-production.tar.gz build/
        
        print_success "Deployment package created: jobtailorai-pro-production.tar.gz"
        print_status "Manual S3 deployment steps:"
        echo "1. Upload build/ contents to your S3 bucket"
        echo "2. Configure CloudFront distribution"
        echo "3. Update DNS records"
        ;;
        
    3)
        print_status "Creating deployment package only..."
        
        cd frontend
        zip -r ../jobtailorai-pro-production.zip build/
        
        print_success "Deployment package created: jobtailorai-pro-production.zip"
        print_status "Package ready for manual deployment"
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Step 4: Post-deployment tasks
print_status "Post-deployment checklist:"
echo "✅ Frontend deployed"
echo "⏳ Set up Stripe webhooks (next step)"
echo "⏳ Configure production monitoring"
echo "⏳ Set up analytics tracking"
echo "⏳ Test payment flow with live keys"

print_success "🎉 Production deployment completed!"
print_status "Next steps:"
echo "1. Test the live application"
echo "2. Set up Stripe webhooks for subscription management"
echo "3. Configure monitoring and analytics"
echo "4. Update DNS if needed"

echo ""
print_status "🔗 Useful links:"
echo "• Stripe Dashboard: https://dashboard.stripe.com"
echo "• AWS Amplify Console: https://console.aws.amazon.com/amplify"
echo "• Your app: Check Amplify console for URL"
