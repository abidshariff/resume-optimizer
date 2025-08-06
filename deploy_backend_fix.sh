#!/bin/bash

# Deploy backend fix for cover letter issue
# This script updates the AI Handler Lambda function with the fixed code

set -e

echo "🚀 Deploying backend fix for cover letter download issue..."

# Set environment (default to prod)
ENVIRONMENT=${1:-prod}
echo "Environment: $ENVIRONMENT"

# Set the AI Handler function name directly
AI_HANDLER_FUNCTION="ResumeOptimizerAIHandler-${ENVIRONMENT}"
echo "AI Handler function: $AI_HANDLER_FUNCTION"

# Create deployment package
echo "Creating deployment package..."
cd backend/lambda-functions/ai-handler

# Create a temporary directory for the deployment package
TEMP_DIR=$(mktemp -d)
echo "Temporary directory: $TEMP_DIR"

# Copy all files to temp directory
cp -r * $TEMP_DIR/

# Create the zip file
cd $TEMP_DIR
zip -r deployment-package.zip . -x "*.pyc" "__pycache__/*" "*.git*"

# Update the Lambda function
echo "Updating Lambda function code..."
aws lambda update-function-code \
    --function-name $AI_HANDLER_FUNCTION \
    --zip-file fileb://deployment-package.zip

# Wait for the update to complete
echo "Waiting for function update to complete..."
aws lambda wait function-updated \
    --function-name $AI_HANDLER_FUNCTION

# Clean up
rm -rf $TEMP_DIR

echo "✅ Backend fix deployed successfully!"
echo ""
echo "🔍 To test the fix:"
echo "1. Go to your application"
echo "2. Enable 'Generate Cover Letter' toggle"
echo "3. Provide a company name"
echo "4. Generate a resume"
echo "5. Check if the cover letter download URL is now available"
echo ""
echo "📊 To check logs:"
echo "aws logs tail /aws/lambda/$AI_HANDLER_FUNCTION --follow"
