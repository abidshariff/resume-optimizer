#!/bin/bash

# Package the Lambda function
cd /Volumes/workplace/resume-optimizer/backend/lambda-functions/resume-processor
zip -r function.zip index.py

# Update the Lambda function code
aws lambda update-function-code \
  --function-name ResumeOptimizerProcessor-dev \
  --zip-file fileb://function.zip \
  --profile resume-optimizer

echo "Lambda function code updated"

# Package the AI Handler Lambda function
cd /Volumes/workplace/resume-optimizer/backend/lambda-functions/ai-handler
zip -r function.zip index.py

# Update the AI Handler Lambda function code
aws lambda update-function-code \
  --function-name ResumeOptimizerAIHandler-dev \
  --zip-file fileb://function.zip \
  --profile resume-optimizer

echo "AI Handler Lambda function code updated"
