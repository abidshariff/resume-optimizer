#!/bin/bash

# Script to deploy Lambda functions for the Resume Optimizer application

# Set environment variables
ENVIRONMENT="dev"
RESUME_PROCESSOR_FUNCTION="ResumeOptimizerProcessor-${ENVIRONMENT}"
AI_HANDLER_FUNCTION="ResumeOptimizerAIHandler-${ENVIRONMENT}"

echo "Deploying Lambda functions for Resume Optimizer (${ENVIRONMENT})..."

# Package and update Resume Processor Lambda
echo "Packaging Resume Processor Lambda..."
cd lambda-functions/resume-processor
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
zip -r function.zip index.py
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

echo "Deployment completed successfully!"
