#!/bin/bash

# AI Handler Lambda Deployment with S3 Dependencies (Fixed)
set -e

# Configuration
FUNCTION_NAME="ResumeOptimizerAIHandler"
ENVIRONMENT=${1:-prod}
REGION=${AWS_DEFAULT_REGION:-us-east-1}
BUCKET_NAME="resume-optimizer-deployments-${ENVIRONMENT}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

print_status "🚀 Deploying AI Handler with S3 dependencies..."

# Check for Python and pip
if ! command -v python3 &> /dev/null; then
    print_error "python3 not found. Please install Python 3."
    exit 1
fi

# Create S3 bucket if it doesn't exist
if ! aws s3 ls "s3://${BUCKET_NAME}" 2>/dev/null; then
    print_status "Creating deployment bucket: ${BUCKET_NAME}"
    aws s3 mb "s3://${BUCKET_NAME}" --region ${REGION}
fi

# Navigate to AI handler directory
cd backend/lambda-functions/ai-handler

# Clean up previous builds
rm -rf build/
mkdir -p build/

print_status "📦 Installing dependencies..."

# Install dependencies to build directory
python3 -m pip install -r requirements.txt -t build/ --platform linux_x86_64 --only-binary=:all: --no-deps

# Copy source files
cp *.py build/
cp *.docx build/ 2>/dev/null || true
cp *.md build/ 2>/dev/null || true

# Create deployment package
cd build/
zip -r ../ai-handler-with-deps.zip . -x "*.pyc" "*/__pycache__/*"
cd ..

print_status "⬆️ Uploading package to S3..."

# Upload to S3
aws s3 cp ai-handler-with-deps.zip "s3://${BUCKET_NAME}/packages/"

print_status "🔄 Updating Lambda function..."

# Update Lambda function code
aws lambda update-function-code \
    --function-name "${FUNCTION_NAME}-${ENVIRONMENT}" \
    --s3-bucket "${BUCKET_NAME}" \
    --s3-key "packages/ai-handler-with-deps.zip" \
    --region ${REGION}

# Clean up
rm -rf build/
rm ai-handler-with-deps.zip

print_success "✅ AI Handler deployed successfully!"
print_status "Function: ${FUNCTION_NAME}-${ENVIRONMENT}"
print_status "Package: s3://${BUCKET_NAME}/packages/ai-handler-with-deps.zip"
