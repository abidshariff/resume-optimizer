#!/bin/bash

# Quick AI Handler Lambda Update Script
set -e

# Configuration
ENVIRONMENT=${1:-prod}
FUNCTION_NAME="ResumeOptimizerAIHandler-$ENVIRONMENT"

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

print_status "🔧 Updating AI Handler Lambda function..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    print_error "AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Navigate to AI handler directory
cd backend/lambda-functions/ai-handler

# Install dependencies
print_status "Installing Python dependencies..."

# Nuclear cleanup - remove everything
print_status "Performing nuclear cleanup of all packages..."
rm -rf PIL* pillow* Pillow* reportlab* docx* lxml* python_docx* boto3* botocore* s3transfer* jmespath* urllib3* six* typing_extensions* PyPDF2* python_dateutil* charset_normalizer* *.dist-info* __pycache__* bin/

# Force clean pip cache
export PIP_NO_CACHE_DIR=1

# Install with very specific Linux platform targeting
print_status "Installing Linux x86_64 compatible packages..."

# Install Pillow with explicit Linux targeting - this should create PIL/ directory
pip3 install --no-cache-dir --force-reinstall \
    --platform manylinux2014_x86_64 \
    --implementation cp \
    --python-version 3.9 \
    --abi cp39 \
    --only-binary=:all: \
    --no-deps \
    --target . \
    pillow==11.3.0

# Verify PIL directory was created
if [ ! -d "PIL" ]; then
    print_error "PIL directory not created! Trying alternative approach..."
    # Try without platform restrictions to get the module structure
    pip3 install --no-cache-dir --force-reinstall --target . --no-deps pillow==11.3.0
fi

# Install python-docx with Linux targeting
pip3 install --no-cache-dir --force-reinstall \
    --platform manylinux2014_x86_64 \
    --implementation cp \
    --python-version 3.9 \
    --abi cp39 \
    --only-binary=:all: \
    --no-deps \
    --target . \
    python-docx==1.2.0

# Install reportlab
pip3 install --no-cache-dir --force-reinstall \
    --target . \
    --no-deps \
    reportlab==4.4.3

# Install remaining dependencies with Linux targeting where possible
pip3 install --no-cache-dir --force-reinstall \
    --target . \
    boto3>=1.26.0 \
    PyPDF2>=3.0.1 \
    typing_extensions>=4.0.0 \
    python-dateutil>=2.8.0

# Remove any macOS-specific .so files that might cause issues
print_status "Cleaning up macOS-specific files..."
find . -name "*.cpython-*-darwin.so" -delete 2>/dev/null || true

print_success "Linux-compatible dependencies installed"

# Create deployment package
print_status "Creating deployment package..."
# List what we have before zipping
print_status "Checking installed packages..."
ls -la | grep -E "(PIL|reportlab|docx)" || echo "No packages found!"

# Create comprehensive zip including all dependencies
zip -r function.zip *.py *.docx requirements.txt \
    PIL/ pillow.libs/ reportlab/ docx/ lxml/ \
    boto3/ botocore/ s3transfer/ jmespath/ urllib3/ \
    PyPDF2/ dateutil/ six.py typing_extensions.py \
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
rm -rf reportlab/ Pillow* PIL* *.dist-info/ __pycache__/ 2>/dev/null || true
cd ../../..

print_success "✅ AI Handler Lambda function updated successfully!"
print_status "Function: $FUNCTION_NAME"
print_status "🚀 Deployment complete! Your changes are now live."
echo ""