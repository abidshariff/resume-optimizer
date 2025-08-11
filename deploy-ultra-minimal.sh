#!/bin/bash

# Deploy only essential Python files
FUNCTION_NAME="ResumeOptimizerAIHandler-prod"
BUCKET="resume-optimizer-storage-132851953852-prod"
FIXED_KEY="packages/ai-handler-latest.zip"

cd backend/lambda-functions/ai-handler

# Create ultra-minimal zip with only Python files
zip -r ../../../ai-handler-latest.zip \
  index.py \
  prompt_template.py \
  enhanced_word_generator.py \
  pdf_generator.py \
  skills_manager.py \
  minimal_word_generator.py \
  professional_resume_template.docx

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

echo "Ultra-minimal deployment complete!"
