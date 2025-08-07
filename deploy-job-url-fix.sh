#!/bin/bash

# Deploy Job URL Extractor Fix
# This script updates the job URL extractor to handle direct Lambda invocations

set -e

# Configuration
ENVIRONMENT=${1:-dev}
STACK_NAME="resume-optimizer-stack-${ENVIRONMENT}"
REGION="us-east-1"

echo "🚀 Deploying Job URL Extractor Fix for environment: $ENVIRONMENT"
echo "Stack: $STACK_NAME"
echo "Region: $REGION"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Check if stack exists
if ! aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" > /dev/null 2>&1; then
    echo "❌ Stack $STACK_NAME does not exist. Please deploy the main stack first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Get function names from CloudFormation outputs
echo "📋 Getting function names..."
JOB_URL_EXTRACTOR_FUNCTION=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='JobUrlExtractorFunction'].OutputValue" \
    --output text 2>/dev/null || echo "")

AI_HANDLER_FUNCTION=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='AIHandlerFunction'].OutputValue" \
    --output text 2>/dev/null || echo "")

# If outputs don't exist, try to get function names directly
if [ -z "$JOB_URL_EXTRACTOR_FUNCTION" ]; then
    JOB_URL_EXTRACTOR_FUNCTION="ResumeOptimizerJobUrlExtractor-${ENVIRONMENT}"
fi

if [ -z "$AI_HANDLER_FUNCTION" ]; then
    AI_HANDLER_FUNCTION="ResumeOptimizerAIHandler-${ENVIRONMENT}"
fi

echo "Job URL Extractor Function: $JOB_URL_EXTRACTOR_FUNCTION"
echo "AI Handler Function: $AI_HANDLER_FUNCTION"

# Update Job URL Extractor Lambda function
echo "🔄 Updating Job URL Extractor Lambda function..."
cd backend/lambda-functions/job-url-extractor
zip -r ../../../job-url-extractor-deployment.zip . -x "*.pyc" "__pycache__/*"
cd ../../..

aws lambda update-function-code \
    --function-name "$JOB_URL_EXTRACTOR_FUNCTION" \
    --zip-file fileb://job-url-extractor-deployment.zip \
    --region "$REGION"

echo "✅ Job URL Extractor function updated"

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
rm -f job-url-extractor-deployment.zip ai-handler-deployment.zip

echo ""
echo "🎉 Job URL Extractor fix deployed successfully!"
echo ""
echo "📋 Fixed Issues:"
echo "  ✅ Job URL Extractor now handles direct Lambda invocations"
echo "  ✅ AI Handler has better error handling and debugging"
echo "  ✅ Both API Gateway and Lambda-to-Lambda calls supported"
echo ""
echo "🧪 Test the job URL extraction now:"
echo "  1. Enter a job URL in the frontend"
echo "  2. Click 'Craft Resume'"
echo "  3. Check CloudWatch logs for detailed debugging info"
echo ""
echo "📊 Monitor logs:"
echo "  - Job URL Extractor: /aws/lambda/$JOB_URL_EXTRACTOR_FUNCTION"
echo "  - AI Handler: /aws/lambda/$AI_HANDLER_FUNCTION"
echo ""
echo "✨ The job URL extraction should now work properly!"
