#!/bin/bash

# Get the API ID
API_ID="3bemzv60ge"  # Your actual API ID
STAGE_NAME="dev"
RESOURCE_PATH="/optimize"

echo "Enabling CORS for API Gateway..."

# Get the resource ID for the specified path
RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query "items[?path=='$RESOURCE_PATH'].id" --output text)
echo "Resource ID: $RESOURCE_ID"

# Read CORS configuration from file
CORS_CONFIG=$(cat cors-config.json)
ALLOW_ORIGINS=$(echo $CORS_CONFIG | jq -r '.allowOrigins | join(",")')
ALLOW_METHODS=$(echo $CORS_CONFIG | jq -r '.allowMethods | join(",")')
ALLOW_HEADERS=$(echo $CORS_CONFIG | jq -r '.allowHeaders | join(",")')
ALLOW_CREDENTIALS=$(echo $CORS_CONFIG | jq -r '.allowCredentials')

echo "CORS Configuration:"
echo "Allow Origins: $ALLOW_ORIGINS"
echo "Allow Methods: $ALLOW_METHODS"
echo "Allow Headers: $ALLOW_HEADERS"
echo "Allow Credentials: $ALLOW_CREDENTIALS"

# Update the OPTIONS method response
echo "Updating OPTIONS method response..."
aws apigateway put-method-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters "{\"method.response.header.Access-Control-Allow-Origin\":true,\"method.response.header.Access-Control-Allow-Methods\":true,\"method.response.header.Access-Control-Allow-Headers\":true,\"method.response.header.Access-Control-Allow-Credentials\":true}" \
  || echo "OPTIONS method response already exists"

# Update the OPTIONS integration response
echo "Updating OPTIONS integration response..."
aws apigateway put-integration-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters "{\"method.response.header.Access-Control-Allow-Origin\":\"'$ALLOW_ORIGINS'\",\"method.response.header.Access-Control-Allow-Methods\":\"'$ALLOW_METHODS'\",\"method.response.header.Access-Control-Allow-Headers\":\"'$ALLOW_HEADERS'\",\"method.response.header.Access-Control-Allow-Credentials\":\"'$ALLOW_CREDENTIALS'\"}" \
  || echo "OPTIONS integration response already exists"

# Update the POST method response
echo "Updating POST method response..."
aws apigateway put-method-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method POST \
  --status-code 200 \
  --response-parameters "{\"method.response.header.Access-Control-Allow-Origin\":true,\"method.response.header.Access-Control-Allow-Methods\":true,\"method.response.header.Access-Control-Allow-Headers\":true,\"method.response.header.Access-Control-Allow-Credentials\":true}" \
  || echo "POST method response already exists"

# Get the current integration ID for the POST method
INTEGRATION_ID=$(aws apigateway get-integration \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method POST \
  --query "id" \
  --output text 2>/dev/null || echo "")

if [ -n "$INTEGRATION_ID" ]; then
  echo "Found integration ID: $INTEGRATION_ID"
  
  # Update the POST integration response
  echo "Updating POST integration response..."
  aws apigateway put-integration-response \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method POST \
    --status-code 200 \
    --response-parameters "{\"method.response.header.Access-Control-Allow-Origin\":\"'$ALLOW_ORIGINS'\",\"method.response.header.Access-Control-Allow-Methods\":\"'$ALLOW_METHODS'\",\"method.response.header.Access-Control-Allow-Headers\":\"'$ALLOW_HEADERS'\",\"method.response.header.Access-Control-Allow-Credentials\":\"'$ALLOW_CREDENTIALS'\"}" \
    || echo "Could not update POST integration response"
else
  echo "Could not find integration ID for POST method"
fi

# Deploy the API
echo "Deploying API changes..."
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name $STAGE_NAME

echo "CORS configuration updated and API deployed"