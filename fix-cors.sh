#!/bin/bash

# Set environment variables
API_ID="3bemzv60ge"  # API ID from the error message

echo "Updating API Gateway CORS configuration..."

# Get the resource ID for the /optimize endpoint
RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query "items[?path=='/optimize'].id" --output text)
echo "Resource ID for /optimize endpoint: $RESOURCE_ID"

# Update OPTIONS integration response
echo "Updating OPTIONS integration response..."
aws apigateway put-integration-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\",\"method.response.header.Access-Control-Allow-Methods\":\"'GET,POST,PUT,DELETE,OPTIONS'\",\"method.response.header.Access-Control-Allow-Origin\":\"'https://main.d16ci5rhuvcide.amplifyapp.com'\"}"

# Update POST integration response
echo "Updating POST integration response..."
aws apigateway update-integration-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method POST \
  --status-code 200 \
  --patch-operations "[{\"op\":\"add\",\"path\":\"/responseParameters/method.response.header.Access-Control-Allow-Origin\",\"value\":\"'https://main.d16ci5rhuvcide.amplifyapp.com'\"},{\"op\":\"add\",\"path\":\"/responseParameters/method.response.header.Access-Control-Allow-Headers\",\"value\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\"},{\"op\":\"add\",\"path\":\"/responseParameters/method.response.header.Access-Control-Allow-Methods\",\"value\":\"'GET,POST,PUT,DELETE,OPTIONS'\"}]"

# Deploy the API
echo "Deploying API changes..."
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name dev

echo "CORS configuration updated and API deployed"