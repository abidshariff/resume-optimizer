#!/bin/bash

# Set environment variables
API_ID="3bemzv60ge"
LAMBDA_NAME="ResumeOptimizerProcessor-dev"
ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)

echo "API ID: $API_ID"
echo "Lambda Name: $LAMBDA_NAME"
echo "Account ID: $ACCOUNT_ID"

# Add permission for API Gateway to invoke Lambda for OPTIONS method
echo "Adding permission for API Gateway to invoke Lambda for OPTIONS method..."
aws lambda add-permission \
  --function-name $LAMBDA_NAME \
  --statement-id apigateway-options-test-2 \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:$ACCOUNT_ID:$API_ID/*/OPTIONS/optimize"

# Deploy the API
echo "Deploying API changes..."
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name dev

echo "CORS configuration updated and API deployed"