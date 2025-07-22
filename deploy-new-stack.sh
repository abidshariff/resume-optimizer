#!/bin/bash

# Set environment variables
ENVIRONMENT="dev"
RESUME_PROCESSOR_FUNCTION="ResumeOptimizerProcessor-${ENVIRONMENT}"
AI_HANDLER_FUNCTION="ResumeOptimizerAIHandler-${ENVIRONMENT}"
API_ID="3bemzv60ge"

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

cd ../../../

# Get the resource ID for the /optimize endpoint
RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query "items[?path=='/optimize'].id" --output text)
echo "Resource ID for /optimize endpoint: $RESOURCE_ID"

# Enable binary support for API Gateway
echo "Enabling binary support for API Gateway..."
aws apigateway update-rest-api \
  --rest-api-id $API_ID \
  --patch-operations op=replace,path=/binaryMediaTypes/~1*~1*,value='*/*'

# Update the API Gateway CORS configuration
echo "Updating API Gateway CORS configuration..."
aws apigateway put-gateway-response \
  --rest-api-id $API_ID \
  --response-type DEFAULT_4XX \
  --response-parameters "{\"gatewayresponse.header.Access-Control-Allow-Origin\":\"'https://main.d16ci5rhuvcide.amplifyapp.com'\",\"gatewayresponse.header.Access-Control-Allow-Headers\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\",\"gatewayresponse.header.Access-Control-Allow-Methods\":\"'GET,POST,PUT,DELETE,OPTIONS'\"}"

aws apigateway put-gateway-response \
  --rest-api-id $API_ID \
  --response-type DEFAULT_5XX \
  --response-parameters "{\"gatewayresponse.header.Access-Control-Allow-Origin\":\"'https://main.d16ci5rhuvcide.amplifyapp.com'\",\"gatewayresponse.header.Access-Control-Allow-Headers\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\",\"gatewayresponse.header.Access-Control-Allow-Methods\":\"'GET,POST,PUT,DELETE,OPTIONS'\"}"

# Deploy the API
echo "Deploying API changes..."
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name dev

echo "All updates completed successfully!"