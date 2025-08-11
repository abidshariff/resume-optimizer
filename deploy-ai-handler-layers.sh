#!/bin/bash

# AI Handler Lambda Deployment with Layers and S3
set -e

# Configuration
FUNCTION_NAME="ResumeOptimizerAIHandler"
LAYER_NAME="resume-optimizer-dependencies"
ENVIRONMENT=${1:-prod}
REGION=${AWS_DEFAULT_REGION:-us-east-1}
BUCKET_NAME="resume-optimizer-deployments-${ENVIRONMENT}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

print_status "🚀 Deploying AI Handler with Lambda Layers..."

# Create S3 bucket if it doesn't exist
if ! aws s3 ls "s3://${BUCKET_NAME}" 2>/dev/null; then
    print_status "Creating deployment bucket: ${BUCKET_NAME}"
    aws s3 mb "s3://${BUCKET_NAME}" --region ${REGION}
fi

# Navigate to AI handler directory
cd backend/lambda-functions/ai-handler

# Clean up previous builds
rm -rf layer/ function/ *.zip
mkdir -p layer/python function/

print_status "📦 Creating dependencies layer..."

# Install dependencies for layer
pip install -r requirements.txt -t layer/python/ --platform linux_x86_64 --only-binary=:all:

# Create layer package
cd layer/
zip -r ../dependencies-layer.zip . -x "*.pyc" "*/__pycache__/*"
cd ..

print_status "⬆️ Uploading layer to S3..."

# Upload layer to S3
aws s3 cp dependencies-layer.zip "s3://${BUCKET_NAME}/layers/"

print_status "🔄 Publishing Lambda layer..."

# Publish layer
LAYER_VERSION=$(aws lambda publish-layer-version \
    --layer-name "${LAYER_NAME}-${ENVIRONMENT}" \
    --content "S3Bucket=${BUCKET_NAME},S3Key=layers/dependencies-layer.zip" \
    --compatible-runtimes python3.9 python3.10 python3.11 \
    --region ${REGION} \
    --query 'Version' \
    --output text)

print_success "✅ Layer published: Version ${LAYER_VERSION}"

print_status "📦 Creating function package..."

# Copy only source files to function directory
cp *.py function/
cp *.docx function/ 2>/dev/null || true
cp *.md function/ 2>/dev/null || true

# Create function package (without dependencies)
cd function/
zip -r ../ai-handler-function.zip . -x "*.pyc" "*/__pycache__/*"
cd ..

print_status "⬆️ Uploading function to S3..."

# Upload function to S3
aws s3 cp ai-handler-function.zip "s3://${BUCKET_NAME}/functions/"

print_status "🔄 Updating Lambda function..."

# Update function code
aws lambda update-function-code \
    --function-name "${FUNCTION_NAME}-${ENVIRONMENT}" \
    --s3-bucket "${BUCKET_NAME}" \
    --s3-key "functions/ai-handler-function.zip" \
    --region ${REGION}

# Get layer ARN
LAYER_ARN="arn:aws:lambda:${REGION}:$(aws sts get-caller-identity --query Account --output text):layer:${LAYER_NAME}-${ENVIRONMENT}:${LAYER_VERSION}"

print_status "🔗 Updating function layers..."

# Update function configuration to use layer
aws lambda update-function-configuration \
    --function-name "${FUNCTION_NAME}-${ENVIRONMENT}" \
    --layers "${LAYER_ARN}" \
    --region ${REGION}

# Clean up
rm -rf layer/ function/ *.zip

print_success "✅ AI Handler deployed with layers successfully!"
print_status "Function: ${FUNCTION_NAME}-${ENVIRONMENT}"
print_status "Layer: ${LAYER_ARN}"
print_status "Function Package: s3://${BUCKET_NAME}/functions/ai-handler-function.zip"
print_status "Layer Package: s3://${BUCKET_NAME}/layers/dependencies-layer.zip"
