#!/bin/bash

# Set environment variables
API_ID="3bemzv60ge"
RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query "items[?path=='/optimize'].id" --output text)
ORIGIN="https://main.d16ci5rhuvcide.amplifyapp.com"

echo "API ID: $API_ID"
echo "Resource ID: $RESOURCE_ID"
echo "Origin: $ORIGIN"

# Enable CORS for the API Gateway
echo "Enabling CORS for API Gateway..."
aws apigateway enable-cors \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --allow-origins "'$ORIGIN'" \
  --allow-headers "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'" \
  --allow-methods "'OPTIONS,POST,GET,PUT,DELETE'" \
  --max-age "'3600'"

# Deploy the API
echo "Deploying API changes..."
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name dev

echo "CORS configuration updated and API deployed"