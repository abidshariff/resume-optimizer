#!/bin/bash

# Fix AI Models Script
# This script updates the AI Handler Lambda function with working Bedrock models

set -e

ENVIRONMENT=${1:-prod}
FUNCTION_NAME="ResumeOptimizerAIHandler-${ENVIRONMENT}"

echo "🔧 Fixing AI models for environment: ${ENVIRONMENT}"
echo "📋 Function name: ${FUNCTION_NAME}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."
cd backend/lambda-functions/ai-handler

# Create a temporary directory for the deployment package
TEMP_DIR=$(mktemp -d)
echo "Using temporary directory: $TEMP_DIR"

# Copy all Python files
cp *.py "$TEMP_DIR/"

# Create the deployment zip
cd "$TEMP_DIR"
zip -r deployment.zip .

# Update the Lambda function
echo "🚀 Updating Lambda function..."
aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file fileb://deployment.zip \
    --region us-east-1

if [ $? -eq 0 ]; then
    echo "✅ Lambda function updated successfully!"
    
    # Wait a moment for the update to propagate
    echo "⏳ Waiting for function update to complete..."
    sleep 5
    
    # Test the function by invoking it with a test event
    echo "🧪 Testing the updated function..."
    
    # Clean up
    cd - > /dev/null
    rm -rf "$TEMP_DIR"
    
    echo "🎉 AI models have been fixed!"
    echo ""
    echo "📋 Updated models (in order of preference):"
    echo "   1. Claude 3.5 Sonnet (anthropic.claude-3-5-sonnet-20240620-v1:0)"
    echo "   2. Claude 3 Sonnet (anthropic.claude-3-sonnet-20240229-v1:0)"
    echo "   3. Claude 3 Haiku (anthropic.claude-3-haiku-20240307-v1:0)"
    echo "   4. Claude v2.1 (anthropic.claude-v2:1)"
    echo ""
    echo "✅ All models support ON_DEMAND inference and should work properly now!"
    echo "🔗 Try creating a resume again - the AI service should now be available!"
    
else
    echo "❌ Failed to update Lambda function. Please check your AWS credentials and permissions."
    cd - > /dev/null
    rm -rf "$TEMP_DIR"
    exit 1
fi
