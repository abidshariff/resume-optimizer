#!/bin/bash

# Set environment variables
API_ENDPOINT="https://3bemzv60ge.execute-api.us-east-1.amazonaws.com/dev/optimize"
ORIGIN="https://main.d16ci5rhuvcide.amplifyapp.com"

# Replace with a valid token if you have one
AUTH_TOKEN="YOUR_AUTH_TOKEN"

echo "Testing API endpoint with authentication: ${API_ENDPOINT}"

# Make a simple OPTIONS request to test CORS
echo "Testing OPTIONS request (CORS preflight)..."
curl -v -X OPTIONS ${API_ENDPOINT} \
  -H "Origin: ${ORIGIN}" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"

echo -e "\n\nTesting POST request with authentication..."
curl -v -X POST ${API_ENDPOINT} \
  -H "Origin: ${ORIGIN}" \
  -H "Content-Type: application/json" \
  -H "Authorization: ${AUTH_TOKEN}" \
  -d '{"resume": "base64data", "jobDescription": "Sample job description"}'