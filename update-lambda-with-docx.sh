#!/bin/bash

# Set environment variables
ENVIRONMENT="dev"
RESUME_PROCESSOR_FUNCTION="ResumeOptimizerProcessor-${ENVIRONMENT}"
AI_HANDLER_FUNCTION="ResumeOptimizerAIHandler-${ENVIRONMENT}"

echo "Updating Lambda functions with CORS fixes..."

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

# Package and update AI Handler Lambda
echo "Packaging AI Handler Lambda..."
cd ../ai-handler
zip -r function.zip index.py resume_template.py
echo "Updating AI Handler Lambda..."
aws lambda update-function-code \
  --function-name ${AI_HANDLER_FUNCTION} \
  --zip-file fileb://function.zip
if [ $? -eq 0 ]; then
  echo "AI Handler Lambda updated successfully."
else
  echo "Error updating AI Handler Lambda."
  exit 1
fi

cd ../../..

echo "Lambda functions updated successfully!"