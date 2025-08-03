#!/bin/bash

# Deploy AI Handler with Enhanced Prompt Fix
# This script updates the Lambda function with the improved skills-experience alignment prompt

set -e

echo "🔧 Deploying AI Handler with Enhanced Skills-Experience Alignment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
if [ ! -f "backend/lambda-functions/ai-handler/index.py" ]; then
    print_error "Please run this script from the resume-optimizer root directory"
    exit 1
fi

# Environment
ENVIRONMENT=${1:-prod}
print_status "Deploying to environment: $ENVIRONMENT"

# Step 1: Package the updated Lambda function
print_status "Packaging AI Handler Lambda function..."

cd backend/lambda-functions/ai-handler

# Create deployment package
print_status "Creating deployment package..."
zip -r ai-handler-enhanced.zip . -x "*.pyc" "__pycache__/*" "*.zip"

if [ $? -ne 0 ]; then
    print_error "Failed to create deployment package"
    exit 1
fi

print_success "Deployment package created: ai-handler-enhanced.zip"

# Step 2: Update Lambda function
print_status "Updating Lambda function code..."

aws lambda update-function-code \
    --function-name "ResumeOptimizerAIHandler-${ENVIRONMENT}" \
    --zip-file fileb://ai-handler-enhanced.zip \
    --region us-east-1

if [ $? -eq 0 ]; then
    print_success "Lambda function updated successfully!"
else
    print_error "Failed to update Lambda function"
    exit 1
fi

# Step 3: Wait for update to complete
print_status "Waiting for function update to complete..."
aws lambda wait function-updated \
    --function-name "ResumeOptimizerAIHandler-${ENVIRONMENT}" \
    --region us-east-1

# Step 4: Test the function (optional)
print_status "Function update completed!"

# Cleanup
rm ai-handler-enhanced.zip
cd ../../..

print_success "🎉 AI Handler deployment completed!"

echo ""
print_status "✅ What was fixed:"
echo "• Enhanced prompt with explicit skills-experience alignment requirements"
echo "• Added technology substitution logic (AWS → Google Cloud, etc.)"
echo "• Cross-section validation to ensure consistency"
echo "• Specific examples of technology transformation"
echo "• Validation checklist for LLM to follow"

echo ""
print_status "🧪 Test the fix:"
echo "1. Upload an AWS-focused resume"
echo "2. Use a Google Cloud job description"
echo "3. Verify that:"
echo "   • Skills section shows Google Cloud technologies"
echo "   • Experience bullets mention Google Cloud (not AWS)"
echo "   • Professional summary aligns with both sections"

echo ""
print_warning "⚠️  Note: It may take 1-2 minutes for the changes to take effect"

print_status "🔗 Monitor function logs:"
echo "aws logs tail /aws/lambda/ResumeOptimizerAIHandler-${ENVIRONMENT} --follow"
