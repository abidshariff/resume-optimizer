#!/bin/bash

# Create a temporary directory for the Lambda package
mkdir -p /tmp/lambda-package
cd /tmp/lambda-package

# Copy the Lambda function code
cp /Volumes/workplace/resume-optimizer/backend/lambda-functions/ai-handler/index.py .

# Install python-docx
pip install python-docx -t .

# Create a zip file with the Lambda function and dependencies
zip -r lambda_package.zip .

# Update the Lambda function
aws lambda update-function-code \
  --function-name ResumeOptimizerAIHandler-dev \
  --zip-file fileb://lambda_package.zip

echo "Lambda function updated with python-docx package"

# Clean up
cd -
rm -rf /tmp/lambda-package
