#!/bin/bash

# Set environment variables
API_ID="3bemzv60ge"
RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query "items[?path=='/optimize'].id" --output text)
ORIGIN="https://main.d16ci5rhuvcide.amplifyapp.com"
LAMBDA_ARN=$(aws lambda get-function --function-name ResumeOptimizerProcessor-dev --query "Configuration.FunctionArn" --output text)

echo "API ID: $API_ID"
echo "Resource ID: $RESOURCE_ID"
echo "Origin: $ORIGIN"
echo "Lambda ARN: $LAMBDA_ARN"

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

# Create Lambda proxy integration for OPTIONS
echo "Creating Lambda proxy integration for OPTIONS..."
aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations"

# Deploy the API
echo "Deploying API changes..."
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name dev

echo "CORS configuration updated and API deployed"