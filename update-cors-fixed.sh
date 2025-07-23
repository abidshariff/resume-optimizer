#!/bin/bash

# Set environment variables
API_ID="3bemzv60ge"
RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query "items[?path=='/optimize'].id" --output text)
ORIGIN="https://main.d16ci5rhuvcide.amplifyapp.com"

echo "API ID: $API_ID"
echo "Resource ID: $RESOURCE_ID"
echo "Origin: $ORIGIN"

# 1. Update the OPTIONS method
echo "Updating OPTIONS method..."

# Check if OPTIONS method exists
OPTIONS_EXISTS=$(aws apigateway get-method --rest-api-id $API_ID --resource-id $RESOURCE_ID --http-method OPTIONS 2>/dev/null || echo "NOT_EXISTS")

if [[ $OPTIONS_EXISTS == "NOT_EXISTS" ]]; then
  echo "Creating OPTIONS method..."
  aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $RESOURCE_ID \
    --http-method OPTIONS \
    --authorization-type NONE
fi

# Create method response for OPTIONS
echo "Creating method response for OPTIONS..."
aws apigateway put-method-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":true,\"method.response.header.Access-Control-Allow-Methods\":true,\"method.response.header.Access-Control-Allow-Origin\":true,\"method.response.header.Access-Control-Allow-Credentials\":true}" \
  --response-models "{\"application/json\":\"Empty\"}" \
  || echo "Method response already exists"

# Create integration for OPTIONS
echo "Creating integration for OPTIONS..."
aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --type MOCK \
  --request-templates "{\"application/json\":\"{\\\"statusCode\\\": 200}\"}" \
  || echo "Integration already exists"

# Create integration response for OPTIONS
echo "Creating integration response for OPTIONS..."
aws apigateway put-integration-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters "{\"method.response.header.Access-Control-Allow-Headers\":\"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'\",\"method.response.header.Access-Control-Allow-Methods\":\"'GET,POST,PUT,DELETE,OPTIONS'\",\"method.response.header.Access-Control-Allow-Origin\":\"'$ORIGIN'\",\"method.response.header.Access-Control-Allow-Credentials\":\"'true'\"}" \
  --response-templates "{\"application/json\":\"\"}" \
  || echo "Integration response already exists"

# 2. Update the POST method response
echo "Updating POST method response..."
aws apigateway put-method-response \
  --rest-api-id $API_ID \
  --resource-id $RESOURCE_ID \
  --http-method POST \
  --status-code 200 \
  --response-parameters "{\"method.response.header.Access-Control-Allow-Origin\":true,\"method.response.header.Access-Control-Allow-Headers\":true,\"method.response.header.Access-Control-Allow-Methods\":true,\"method.response.header.Access-Control-Allow-Credentials\":true}" \
  || echo "POST method response already exists"

# 3. Enable CORS for the entire API
echo "Enabling CORS for the entire API..."
aws apigateway update-rest-api \
  --rest-api-id $API_ID \
  --patch-operations op=replace,path=/defaultResponseHeaders/Access-Control-Allow-Origin,value="'$ORIGIN'" \
  op=replace,path=/defaultResponseHeaders/Access-Control-Allow-Headers,value="'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'" \
  op=replace,path=/defaultResponseHeaders/Access-Control-Allow-Methods,value="'GET,POST,PUT,DELETE,OPTIONS'" \
  op=replace,path=/defaultResponseHeaders/Access-Control-Allow-Credentials,value="'true'" \
  || echo "Could not update default response headers"

# 4. Deploy the API
echo "Deploying API changes..."
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name dev

echo "CORS configuration updated and API deployed"

# 5. Update Lambda functions with CORS headers
echo "Updating Lambda functions with CORS headers..."

# Get the Lambda function ARNs
RESUME_PROCESSOR_FUNCTION="ResumeOptimizerProcessor-dev"
AI_HANDLER_FUNCTION="ResumeOptimizerAIHandler-dev"

# Create a temporary policy file for Lambda functions
cat > cors_policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:SourceOrigin": "$ORIGIN"
        }
      }
    }
  ]
}
EOF

# Add resource-based policy to Lambda functions to allow invocation from the specific origin
echo "Adding resource-based policy to Lambda functions..."
aws lambda add-permission \
  --function-name $RESUME_PROCESSOR_FUNCTION \
  --statement-id AllowAPIGatewayInvoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:*:$API_ID/*/POST/optimize" \
  || echo "Permission already exists for Resume Processor"

aws lambda add-permission \
  --function-name $AI_HANDLER_FUNCTION \
  --statement-id AllowAPIGatewayInvoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:*:$API_ID/*/POST/optimize" \
  || echo "Permission already exists for AI Handler"

# Clean up
rm -f cors_policy.json

echo "All CORS configurations have been updated!"