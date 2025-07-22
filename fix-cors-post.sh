#!/bin/bash

# Set environment variables
API_ID="3bemzv60ge"  # API ID from the error message

echo "Updating API Gateway CORS configuration for POST method..."

# Get the resource ID for the /optimize endpoint
RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query "items[?path=='/optimize'].id" --output text)
echo "Resource ID for /optimize endpoint: $RESOURCE_ID"

# First, get the current integration ID for the POST method
INTEGRATION_ID=$(aws apigateway get-integration \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method POST \
  --query "integrationId" \
  --output text)

echo "Integration ID for POST method: $INTEGRATION_ID"

# Now, try to get the current integration response
aws apigateway get-integration-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method POST \
  --status-code 200

# Create or update the integration response for POST method
echo "Creating/updating integration response for POST method..."
aws apigateway put-integration-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method POST \
  --status-code 200 \
  --response-parameters "{\"method.response.header.Access-Control-Allow-Origin\":\"'https://main.d16ci5rhuvcide.amplifyapp.com'\",\"method.response.header.Access-Control-Allow-Headers\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\",\"method.response.header.Access-Control-Allow-Methods\":\"'GET,POST,PUT,DELETE,OPTIONS'\"}"

# Deploy the API
echo "Deploying API changes..."
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name dev

echo "CORS configuration updated and API deployed"