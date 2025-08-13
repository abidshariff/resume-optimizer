#!/bin/bash

# Quick Job URL Extractor Lambda Update Script
set -e

# Configuration
ENVIRONMENT=${ENVIRONMENT:-${1:-prod}}
FUNCTION_NAME="ResumeOptimizerJobUrlExtractor-$ENVIRONMENT"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_status "🔧 Updating Job URL Extractor Lambda function..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    print_error "AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Navigate to job URL extractor directory
cd backend/lambda-functions/job-url-extractor

# Install dependencies
print_status "Installing Python dependencies..."

# Nuclear cleanup - remove everything except our source files
print_status "Performing cleanup of all packages..."
rm -rf requests* beautifulsoup4* bs4* soupsieve* urllib3* certifi* charset_normalizer* idna* typing_extensions* *.dist-info* __pycache__* bin/

# Force clean pip cache
export PIP_NO_CACHE_DIR=1

# Install with Linux platform targeting
print_status "Installing Linux x86_64 compatible packages..."

# Install requests with explicit Linux targeting
pip3 install --no-cache-dir --force-reinstall \
    --platform manylinux2014_x86_64 \
    --implementation cp \
    --python-version 3.9 \
    --abi cp39 \
    --only-binary=:all: \
    --no-deps \
    --target . \
    requests==2.32.4

# Install beautifulsoup4 with Linux targeting
pip3 install --no-cache-dir --force-reinstall \
    --platform manylinux2014_x86_64 \
    --implementation cp \
    --python-version 3.9 \
    --abi cp39 \
    --only-binary=:all: \
    --no-deps \
    --target . \
    beautifulsoup4==4.13.4

# Install remaining dependencies
pip3 install --no-cache-dir --force-reinstall \
    --target . \
    --no-deps \
    soupsieve>=2.7 \
    urllib3>=2.5.0 \
    certifi>=2025.8.3 \
    charset-normalizer>=3.4.2 \
    idna>=3.10 \
    typing-extensions>=4.14.1

# Install boto3 (needed for Lambda runtime)
pip3 install --no-cache-dir --force-reinstall \
    --target . \
    boto3>=1.26.0

# Remove any macOS-specific .so files that might cause issues
print_status "Cleaning up macOS-specific files..."
find . -name "*.cpython-*-darwin.so" -delete 2>/dev/null || true

print_success "Linux-compatible dependencies installed"

# Create deployment package
print_status "Creating deployment package..."
# List what we have before zipping
print_status "Checking installed packages..."
ls -la | grep -E "(requests|bs4|beautifulsoup4)" || echo "No packages found!"

# Create comprehensive zip including all dependencies
zip -r function.zip *.py requirements.txt \
    requests/ bs4/ soupsieve/ urllib3/ certifi/ \
    charset_normalizer/ idna/ typing_extensions.py \
    boto3/ botocore/ s3transfer/ jmespath/ \
    bin/ *.dist-info/ \
    2>/dev/null || true

# Update Lambda function
print_status "Uploading to Lambda function: $FUNCTION_NAME"
aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file fileb://function.zip \
    --no-cli-pager \
    --output table \
    --query 'FunctionName'

# Clean up
print_status "Cleaning up temporary files..."
rm function.zip
# Clean up installed packages (keep only our source files)
rm -rf requests/ bs4/ soupsieve/ urllib3/ certifi/ charset_normalizer/ idna/ typing_extensions.py boto3/ botocore/ s3transfer/ jmespath/ *.dist-info/ __pycache__/ bin/ 2>/dev/null || true
cd ../../..

print_success "✅ Job URL Extractor Lambda function updated successfully!"
print_status "Function: $FUNCTION_NAME"
print_status "🚀 Deployment complete! Your Netflix URL extraction fix is now live."
echo ""