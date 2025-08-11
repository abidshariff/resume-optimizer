#!/bin/bash

# Deploy minimal code without heavy dependencies
FUNCTION_NAME="ResumeOptimizerAIHandler-prod"
BUCKET="resume-optimizer-storage-132851953852-prod"
FIXED_KEY="packages/ai-handler-latest.zip"

cd backend/lambda-functions/ai-handler

# Create minimal zip excluding heavy dependencies
zip -r ../../../ai-handler-latest.zip . \
  -x "reportlab/*" \
  -x "lxml/*" \
  -x "docx/*" \
  -x "boto3/*" \
  -x "botocore/*" \
  -x "s3transfer/*" \
  -x "*__pycache__*" \
  -x "*.pyc" \
  -x "*.dist-info/*"

cd ../../..

echo "Package size:"
ls -lh ai-handler-latest.zip

# Upload to S3
aws s3 cp ai-handler-latest.zip s3://$BUCKET/$FIXED_KEY

# Update Lambda function
aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --s3-bucket $BUCKET \
    --s3-key $FIXED_KEY

echo "Minimal deployment complete!"
