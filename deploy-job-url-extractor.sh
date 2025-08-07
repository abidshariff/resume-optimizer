#!/bin/bash

# Deploy Job URL Extractor Lambda Function
# This script deploys only the new job URL extractor functionality for testing

set -e

ENVIRONMENT=${1:-dev}
STACK_NAME="resume-optimizer-stack-${ENVIRONMENT}"

echo "🚀 Deploying Job URL Extractor Lambda Function..."
echo "Environment: $ENVIRONMENT"
echo "Stack Name: $STACK_NAME"

# Check if stack exists
if aws cloudformation describe-stacks --stack-name "$STACK_NAME" >/dev/null 2>&1; then
    echo "✅ Stack exists, updating..."
    
    # Update the CloudFormation stack
    aws cloudformation update-stack \
        --stack-name "$STACK_NAME" \
        --template-body file://backend/templates/resume-optimizer-stack.yaml \
        --parameters ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
        --capabilities CAPABILITY_IAM
    
    echo "⏳ Waiting for stack update to complete..."
    aws cloudformation wait stack-update-complete --stack-name "$STACK_NAME"
    
else
    echo "❌ Stack does not exist. Please run the main deploy.sh script first."
    exit 1
fi

# Get the function name
FUNCTION_NAME="ResumeOptimizerJobUrlExtractor-${ENVIRONMENT}"

echo "📦 Packaging Job URL Extractor Lambda function..."

# Create deployment package
cd backend/lambda-functions/job-url-extractor
zip -r ../../../job-url-extractor-deployment.zip . -x "*.pyc" "__pycache__/*"
cd ../../..

echo "🔄 Updating Lambda function code..."

# Update the Lambda function code
aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file fileb://job-url-extractor-deployment.zip

echo "⏳ Waiting for function update to complete..."
aws lambda wait function-updated --function-name "$FUNCTION_NAME"

# Clean up
rm job-url-extractor-deployment.zip

echo "✅ Job URL Extractor Lambda function deployed successfully!"

# Get API endpoint
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
    --output text)

if [ ! -z "$API_ENDPOINT" ]; then
    # Replace /optimize with base URL
    BASE_URL=$(echo "$API_ENDPOINT" | sed 's|/optimize||')
    echo ""
    echo "🌐 API Endpoints:"
    echo "   Job URL Extractor: ${BASE_URL}/extract-job-url"
    echo ""
    echo "📝 Test the endpoint:"
    echo "   curl -X POST ${BASE_URL}/extract-job-url \\"
    echo "        -H 'Content-Type: application/json' \\"
    echo "        -H 'Authorization: Bearer YOUR_TOKEN' \\"
    echo "        -d '{\"jobUrl\": \"https://careers.mastercard.com/us/en/job/...\"}'"
fi

echo ""
echo "🎉 Deployment complete! The Job URL Extractor is ready for testing."
