#!/bin/bash

# Set environment variables
API_ID="3bemzv60ge"
API_ENDPOINT="https://${API_ID}.execute-api.us-east-1.amazonaws.com/dev/optimize"

echo "Testing API endpoint: ${API_ENDPOINT}"

# Make a simple OPTIONS request to test CORS
echo "Testing OPTIONS request (CORS preflight)..."
curl -v -X OPTIONS ${API_ENDPOINT} \
  -H "Origin: https://main.d16ci5rhuvcide.amplifyapp.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"

echo -e "\n\nTesting POST request..."
curl -v -X POST ${API_ENDPOINT} \
  -H "Origin: https://main.d16ci5rhuvcide.amplifyapp.com" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'