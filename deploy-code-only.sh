#!/bin/bash

# Deploy only code changes (no dependencies)
FUNCTION_NAME="ResumeOptimizerAIHandler-prod"
BUCKET="resume-optimizer-storage-132851953852-prod"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

cd backend/lambda-functions/ai-handler

# Create code-only zip (exclude requirements.txt and __pycache__)
zip -r ../../../ai-handler-code-only.zip . -x "requirements.txt" "*__pycache__*" "*.pyc"

cd ../../..

# Upload to S3
aws s3 cp ai-handler-code-only.zip s3://$BUCKET/packages/ai-handler-code-$TIMESTAMP.zip

# Update Lambda function code
aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --s3-bucket $BUCKET \
    --s3-key packages/ai-handler-code-$TIMESTAMP.zip

echo "Code-only deployment complete!"
