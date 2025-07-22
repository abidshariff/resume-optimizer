#!/bin/bash

# Set environment variables
API_ID="3bemzv60ge"
RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query "items[?path=='/optimize'].id" --output text)
ORIGIN="https://main.d16ci5rhuvcide.amplifyapp.com"

echo "API ID: $API_ID"
echo "Resource ID: $RESOURCE_ID"
echo "Origin: $ORIGIN"

# Delete the existing OPTIONS method if it exists
echo "Checking if OPTIONS method exists..."
OPTIONS_EXISTS=$(aws apigateway get-method --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS 2>/dev/null && echo "EXISTS" || echo "NOT_EXISTS")

if [[ $OPTIONS_EXISTS == "EXISTS" ]]; then
  echo "Deleting existing OPTIONS method..."
  aws apigateway delete-method \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method OPTIONS
fi

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
  --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":true,\"method.response.header.Access-Control-Allow-Methods\":true,\"method.response.header.Access-Control-Allow-Origin\":true,\"method.response.header.Access-Control-Allow-Credentials\":true}" \
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
  --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\",\"method.response.header.Access-Control-Allow-Methods\":\"'GET,POST,PUT,DELETE,OPTIONS'\",\"method.response.header.Access-Control-Allow-Origin\":\"'$ORIGIN'\",\"method.response.header.Access-Control-Allow-Credentials\":\"'true'\"}" \
  --response-templates "{\"application/json\":\"{}\"}"

# Update the POST method response to include CORS headers
echo "Updating POST method response..."
aws apigateway put-method-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method POST \
  --status-code 200 \
  --response-parameters "{\"method.response.header.Access-Control-Allow-Origin\":true,\"method.response.header.Access-Control-Allow-Headers\":true,\"method.response.header.Access-Control-Allow-Methods\":true,\"method.response.header.Access-Control-Allow-Credentials\":true}" \
  || echo "POST method response already exists"

# Deploy the API
echo "Deploying API changes..."
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name dev

echo "CORS configuration updated and API deployed"

# Test the OPTIONS method
echo "Testing OPTIONS method..."
curl -v -X OPTIONS "https://$API_ID.execute-api.us-east-1.amazonaws.com/dev/optimize" \
  -H "Origin: $ORIGIN" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"