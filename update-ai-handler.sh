#!/bin/bash

# Script to update just the AI Handler Lambda function
# Usage: ./update-ai-handler.sh [environment]

ENVIRONMENT=${1:-prod}
FUNCTION_NAME="ResumeOptimizerAIHandler-${ENVIRONMENT}"
LAMBDA_DIR="backend/lambda-functions/ai-handler"

echo "🚀 Updating AI Handler Lambda function for environment: $ENVIRONMENT"

# Check if the Lambda directory exists
if [ ! -d "$LAMBDA_DIR" ]; then
    echo "❌ Error: Lambda directory $LAMBDA_DIR not found"
    exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."
cd "$LAMBDA_DIR"

# Remove old zip if exists
rm -f ai-handler-update.zip

# Clean up old dependencies first
echo "🧹 Cleaning up old dependencies..."
rm -rf reportlab/ PIL/ Pillow* pillow.libs/ docx/ lxml/ PyPDF2/ *dist-info/ six.py typing_extensions.py fonttools/ fontTools/

# Install dependencies with correct architecture for Lambda
echo "📥 Installing fresh dependencies for Lambda environment..."

# Check if pip is available
if ! command -v pip &> /dev/null; then
    echo "⚠️  pip not found, trying pip3..."
    if ! command -v pip3 &> /dev/null; then
        echo "❌ Neither pip nor pip3 found"
        exit 1
    else
        PIP_CMD="pip3"
    fi
else
    PIP_CMD="pip"
fi

echo "Using $PIP_CMD for installation..."

# Install Lambda-compatible dependencies using proper platform targeting
echo "📦 Installing Lambda-compatible dependencies..."

# Use pure Python PDF library that doesn't require compiled dependencies
echo "📦 Installing fpdf2 (pure Python PDF library)..."
$PIP_CMD install --target . fpdf2==2.7.6 --force-reinstall --no-cache-dir --no-deps

echo "📦 Installing fonttools (required by fpdf2)..."
$PIP_CMD install --target . fonttools==4.59.1 --force-reinstall --no-cache-dir --no-deps

echo "📦 Installing python-docx..."
$PIP_CMD install --target . python-docx==1.1.2 --force-reinstall --no-cache-dir

echo "📦 Installing PyPDF2..."
$PIP_CMD install --target . PyPDF2==3.0.1 --force-reinstall --no-cache-dir

echo "📦 Installing boto3..."
$PIP_CMD install --target . boto3 --force-reinstall --no-cache-dir

# Verify fpdf2 installation
echo "🔍 Verifying fpdf2 installation..."
if [ -d "fpdf" ]; then
    echo "✅ fpdf2 directory found"
    ls -la fpdf/ | head -3
else
    echo "❌ fpdf2 directory not found"
    exit 1
fi

# Fix fonttools case sensitivity issue
echo "🔧 Fixing fonttools case sensitivity..."
if [ -d "fontTools" ] && [ ! -d "fonttools" ]; then
    ln -sf fontTools fonttools
    echo "✅ Created fonttools symlink"
elif [ -d "fonttools" ] && [ ! -d "fontTools" ]; then
    ln -sf fonttools fontTools
    echo "✅ Created fontTools symlink"
elif [ -d "fonttools" ] && [ -d "fontTools" ]; then
    echo "✅ Both fonttools and fontTools directories exist"
else
    echo "⚠️  Neither fontTools nor fonttools found"
fi

# Verify installations
echo "🔍 Verifying all installations..."

if [ -d "docx" ]; then
    echo "✅ python-docx directory found"
else
    echo "❌ python-docx directory not found"
fi

# List all installed packages for debugging
echo "📋 Installed packages:"
ls -la | grep -E "^d.*" | grep -E "(fpdf|PIL|docx|lxml|PyPDF2)" || echo "No package directories found"

# Create zip with all Python files and dependencies (excluding problematic PIL/Pillow)
zip -r ai-handler-update.zip *.py *.docx fpdf/ docx/ lxml/ boto3/ botocore/ dateutil/ jmespath/ s3transfer/ urllib3/ charset_normalizer/ PyPDF2/ fonttools/ fontTools/ defusedxml/ *dist-info/ six.py typing_extensions.py 2>/dev/null

if [ ! -f "ai-handler-update.zip" ]; then
    echo "❌ Error: Failed to create deployment package"
    exit 1
fi

echo "📤 Uploading to Lambda function: $FUNCTION_NAME"

# Update the Lambda function
aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file fileb://ai-handler-update.zip \
    --no-cli-pager

if [ $? -eq 0 ]; then
    echo "✅ Successfully updated AI Handler Lambda function!"
    echo "🔄 The changes will take effect immediately for new requests"
else
    echo "❌ Error: Failed to update Lambda function"
    echo "💡 Make sure you have AWS CLI configured and the function exists"
    exit 1
fi

# Clean up
rm -f ai-handler-update.zip

echo "🎉 AI Handler update complete!"
echo ""
echo "📋 Summary of changes:"
echo "   • Switched PDF generator to use fpdf2 (pure Python)"
echo "   • Removed PIL/ReportLab dependencies to avoid system library issues"
echo "   • Included all dependencies (fpdf2, docx, etc.)"
echo "   • No compiled dependencies required"
echo ""
echo "🧪 Test the changes by:"
echo "   1. Creating a new resume optimization"
echo "   2. Downloading as PDF format"
echo "   3. Verifying proper formatting and layout"