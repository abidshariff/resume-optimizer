#!/bin/bash

# Get the API ID
API_ID="dqypjuueic"  # Replace with your actual API ID if different
RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query "items[?path=='/optimize'].id" --output text --profile resume-optimizer)

echo "Updating CORS configuration for API Gateway resource: $RESOURCE_ID"

# Enable CORS for the resource
aws apigateway put-integration-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --selection-pattern "" \
  --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\"}" \
  --response-parameters "{\"method.response.header.Access-Control-Allow-Methods\":\"'GET,POST,PUT,DELETE,OPTIONS'\"}" \
  --response-parameters "{\"method.response.header.Access-Control-Allow-Origin\":\"'*'\"}" \
  --profile resume-optimizer

# Create OPTIONS method if it doesn't exist
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --authorization-type NONE \
  --profile resume-optimizer

# Create method response for OPTIONS
aws apigateway put-method-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":true,\"method.response.header.Access-Control-Allow-Methods\":true,\"method.response.header.Access-Control-Allow-Origin\":true}" \
  --profile resume-optimizer

# Create integration for OPTIONS
aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --type MOCK \
  --request-templates "{\"application/json\":\"{\\\"statusCode\\\": 200}\"}" \
  --profile resume-optimizer

# Create integration response for OPTIONS
aws apigateway put-integration-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\",\"method.response.header.Access-Control-Allow-Methods\":\"'GET,POST,PUT,DELETE,OPTIONS'\",\"method.response.header.Access-Control-Allow-Origin\":\"'*'\"}" \
  --profile resume-optimizer

# Deploy the API
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name dev \
  --profile resume-optimizer

echo "CORS configuration updated and API deployed"
