#!/bin/bash

# Resume Optimizer Asynchronous Deployment Script
set -e

ENVIRONMENT=${1:-dev}
STACK_NAME="resume-optimizer-async-stack"
REGION="us-east-1"

echo "Deploying Resume Optimizer with Asynchronous Processing..."
echo "Environment: $ENVIRONMENT"
echo "Stack Name: $STACK_NAME"
echo "Region: $REGION"

# Deploy the CloudFormation template
echo "1. Deploying CloudFormation stack..."
aws cloudformation deploy \
  --template-file backend/templates/resume-optimizer-async-stack.yaml \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides Environment=$ENVIRONMENT \
  --region $REGION

echo "2. Packaging and updating Lambda functions..."

# Package and update Resume Processor Lambda
echo "   - Updating Resume Processor Lambda..."
cd backend/lambda-functions/resume-processor
cp index_async.py index.py
zip -r function.zip index.py
aws lambda update-function-code \
  --function-name ResumeOptimizerProcessor-$ENVIRONMENT \
  --zip-file fileb://function.zip \
  --region $REGION
rm function.zip
cd ../../..

# Package and update AI Handler Lambda
echo "   - Updating AI Handler Lambda..."
cd backend/lambda-functions/ai-handler
cp index_async.py index.py
zip -r function.zip index.py
aws lambda update-function-code \
  --function-name ResumeOptimizerAIHandler-$ENVIRONMENT \
  --zip-file fileb://function.zip \
  --region $REGION
rm function.zip
cd ../../..

# Package and update Status Checker Lambda
echo "   - Updating Status Checker Lambda..."
cd backend/lambda-functions/status-checker
zip -r function.zip index.py
aws lambda update-function-code \
  --function-name ResumeOptimizerStatusChecker-$ENVIRONMENT \
  --zip-file fileb://function.zip \
  --region $REGION
rm function.zip
cd ../../..

echo "3. Getting stack outputs..."
aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs" \
  --region $REGION

echo ""
echo "Deployment complete!"
echo ""
echo "Your new asynchronous API endpoints:"
echo "- Optimize: https://[API-ID].execute-api.$REGION.amazonaws.com/$ENVIRONMENT/optimize"
echo "- Status:   https://[API-ID].execute-api.$REGION.amazonaws.com/$ENVIRONMENT/status"
echo ""
echo "Key changes in the asynchronous version:"
echo "1. The /optimize endpoint now returns immediately with a job ID"
echo "2. Use the /status endpoint to check job progress"
echo "3. No more timeout issues - jobs can run for up to 5 minutes"
echo "4. Better user experience with real-time status updates"
echo ""
echo "Next steps:"
echo "1. Update your frontend to use the new asynchronous flow"
echo "2. Test the new endpoints"
echo "3. Update your Amplify environment variables with the new API endpoints"
