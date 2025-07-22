#!/bin/bash

# Set environment variables
API_ID="3bemzv60ge"
RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query "items[?path=='/optimize'].id" --output text)
ORIGIN="https://main.d16ci5rhuvcide.amplifyapp.com"

echo "API ID: $API_ID"
echo "Resource ID: $RESOURCE_ID"
echo "Origin: $ORIGIN"

# Delete the existing OPTIONS method
echo "Deleting existing OPTIONS method..."
aws apigateway delete-method \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS

# Create a new OPTIONS method
echo "Creating new OPTIONS method..."
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --authorization-type NONE

# Create method response for OPTIONS
echo "Creating method response for OPTIONS..."
aws apigateway put-method-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":true,\"method.response.header.Access-Control-Allow-Methods\":true,\"method.response.header.Access-Control-Allow-Origin\":true}" \
  --response-models "{\"application/json\":\"Empty\"}"

# Create integration for OPTIONS
echo "Creating integration for OPTIONS..."
aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --type MOCK \
  --integration-http-method OPTIONS \
  --request-templates "{\"application/json\":\"{\\\"statusCode\\\": 200}\"}"

# Create integration response for OPTIONS
echo "Creating integration response for OPTIONS..."
aws apigateway put-integration-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\",\"method.response.header.Access-Control-Allow-Methods\":\"'GET,POST,PUT,DELETE,OPTIONS'\",\"method.response.header.Access-Control-Allow-Origin\":\"'$ORIGIN'\"}" \
  --response-templates "{\"application/json\":\"{}\"}"

# Update the POST method to include CORS headers
echo "Updating POST method response..."
aws apigateway put-method-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method POST \
  --status-code 200 \
  --response-parameters "{\"method.response.header.Access-Control-Allow-Origin\":true}" \
  || echo "POST method response already exists"

# Update the POST integration response to include CORS headers
echo "Updating POST integration response..."
aws apigateway put-integration-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method POST \
  --status-code 200 \
  --response-parameters "{\"method.response.header.Access-Control-Allow-Origin\":\"'$ORIGIN'\"}" \
  || echo "POST integration response already exists"

# Update the API Gateway default responses
echo "Updating API Gateway default responses..."
aws apigateway put-gateway-response \
  --rest-api-id $API_ID \
  --response-type DEFAULT_4XX \
  --response-parameters "{\"gatewayresponse.header.Access-Control-Allow-Origin\":\"'$ORIGIN'\"}"

aws apigateway put-gateway-response \
  --rest-api-id $API_ID \
  --response-type DEFAULT_5XX \
  --response-parameters "{\"gatewayresponse.header.Access-Control-Allow-Origin\":\"'$ORIGIN'\"}"

# Deploy the API
echo "Deploying API changes..."
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name dev

echo "CORS configuration updated and API deployed"