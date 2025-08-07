#!/bin/bash

# Deploy Job URL Integration Updates
# This script updates the backend to handle job URL extraction during processing

set -e

# Configuration
ENVIRONMENT=${1:-dev}
STACK_NAME="resume-optimizer-stack-${ENVIRONMENT}"
REGION="us-east-1"

echo "🚀 Deploying Job URL Integration Updates for environment: $ENVIRONMENT"
echo "Stack: $STACK_NAME"
echo "Region: $REGION"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq is required but not installed. Please install jq first."
    exit 1
fi

# Check if stack exists
if ! aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" > /dev/null 2>&1; then
    echo "❌ Stack $STACK_NAME does not exist. Please deploy the main stack first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Update CloudFormation stack (this will update the environment variables and permissions)
echo "📦 Updating CloudFormation stack..."
aws cloudformation update-stack \
    --stack-name "$STACK_NAME" \
    --template-body file://backend/templates/resume-optimizer-stack.yaml \
    --parameters ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
    --capabilities CAPABILITY_IAM \
    --region "$REGION"

echo "⏳ Waiting for stack update to complete..."
aws cloudformation wait stack-update-complete \
    --stack-name "$STACK_NAME" \
    --region "$REGION"

if [ $? -eq 0 ]; then
    echo "✅ CloudFormation stack updated successfully"
else
    echo "❌ CloudFormation stack update failed"
    exit 1
fi

# Get function names from CloudFormation outputs
echo "📋 Getting function names..."
RESUME_PROCESSOR_FUNCTION=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='ResumeProcessorFunction'].OutputValue" \
    --output text)

AI_HANDLER_FUNCTION=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='AIHandlerFunction'].OutputValue" \
    --output text)

echo "Resume Processor Function: $RESUME_PROCESSOR_FUNCTION"
echo "AI Handler Function: $AI_HANDLER_FUNCTION"

# Update Resume Processor Lambda function
echo "🔄 Updating Resume Processor Lambda function..."
cd backend/lambda-functions/resume-processor
zip -r ../../../resume-processor-deployment.zip . -x "*.pyc" "__pycache__/*"
cd ../../..

aws lambda update-function-code \
    --function-name "$RESUME_PROCESSOR_FUNCTION" \
    --zip-file fileb://resume-processor-deployment.zip \
    --region "$REGION"

echo "✅ Resume Processor function updated"

# Update AI Handler Lambda function
echo "🔄 Updating AI Handler Lambda function..."
cd backend/lambda-functions/ai-handler
zip -r ../../../ai-handler-deployment.zip . -x "*.pyc" "__pycache__/*"
cd ../../..

aws lambda update-function-code \
    --function-name "$AI_HANDLER_FUNCTION" \
    --zip-file fileb://ai-handler-deployment.zip \
    --region "$REGION"

echo "✅ AI Handler function updated"

# Clean up deployment files
rm -f resume-processor-deployment.zip ai-handler-deployment.zip

# Get API endpoint for testing
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
    --output text)

echo ""
echo "🎉 Job URL Integration deployment completed successfully!"
echo ""
echo "📋 Updated Components:"
echo "  ✅ CloudFormation stack (added JOB_URL_EXTRACTOR_FUNCTION env var)"
echo "  ✅ AI Handler permissions (can now invoke Job URL Extractor)"
echo "  ✅ Resume Processor (handles job URL in payload)"
echo "  ✅ AI Handler (extracts job data during processing)"
echo ""
echo "🔗 API Endpoint: $API_ENDPOINT"
echo ""
echo "🧪 Test the new workflow:"
echo "  1. Frontend sends job URL in payload"
echo "  2. Resume Processor validates and passes to AI Handler"
echo "  3. AI Handler extracts job data from URL"
echo "  4. AI Handler processes resume with extracted data"
echo ""
echo "✨ Ready for testing with the updated frontend!"
