#!/bin/bash

# Set environment variables
ENVIRONMENT="dev"
RESUME_PROCESSOR_FUNCTION="ResumeOptimizerProcessor-${ENVIRONMENT}"

echo "Updating Lambda function with CORS fixes..."

# Package and update Resume Processor Lambda
echo "Packaging Resume Processor Lambda..."
cd backend/lambda-functions/resume-processor
zip -r function.zip index.py
echo "Updating Resume Processor Lambda..."
aws lambda update-function-code \
  --function-name ${RESUME_PROCESSOR_FUNCTION} \
  --zip-file fileb://function.zip
if [ $? -eq 0 ]; then
  echo "Resume Processor Lambda updated successfully."
else
  echo "Error updating Resume Processor Lambda."
  exit 1
fi

cd ../../..

echo "Lambda function updated successfully!"