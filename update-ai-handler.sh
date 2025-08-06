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

# Create zip with all Python files
zip -r ai-handler-update.zip *.py *.docx 2>/dev/null

if [ ! -f "ai-handler-update.zip" ]; then
    echo "❌ Error: Failed to create deployment package"
    exit 1
fi

echo "📤 Uploading to Lambda function: $FUNCTION_NAME"

# Update the Lambda function
aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file fileb://ai-handler-update.zip

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
echo "   • Enhanced cover letter prompt to eliminate placeholders"
echo "   • Added company research and real address lookup"
echo "   • Added current date insertion"
echo "   • Added cover letter Word document generation"
echo "   • Added cover letter download URL generation"
echo ""
echo "🧪 Test the changes by:"
echo "   1. Creating a new resume optimization with CV toggle enabled"
echo "   2. Verifying the cover letter has no placeholders"
echo "   3. Testing the cover letter download functionality"
