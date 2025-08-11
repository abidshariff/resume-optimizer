#!/bin/bash

# Deploy using fixed S3 key (overwrites previous)
FUNCTION_NAME="ResumeOptimizerAIHandler-prod"
BUCKET="resume-optimizer-storage-132851953852-prod"
FIXED_KEY="packages/ai-handler-latest.zip"

cd backend/lambda-functions/ai-handler
zip -r ../../../ai-handler-latest.zip .
cd ../../..

# Upload to same S3 key (overwrites)
aws s3 cp ai-handler-latest.zip s3://$BUCKET/$FIXED_KEY

# Update Lambda function
aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --s3-bucket $BUCKET \
    --s3-key $FIXED_KEY

echo "Deployment complete using fixed S3 key!"
