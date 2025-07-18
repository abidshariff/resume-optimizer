#!/bin/bash

# Test OPTIONS request
echo "Testing OPTIONS request..."
curl -X OPTIONS \
  -H "Origin: https://main.d16ci5rhuvcide.amplifyapp.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v https://dqypjuueic.execute-api.us-east-1.amazonaws.com/dev/optimize

echo -e "\n\n"

# Test POST request with a dummy token
# Replace YOUR_ID_TOKEN with a valid Cognito ID token
echo "Testing POST request..."
curl -X POST \
  -H "Origin: https://main.d16ci5rhuvcide.amplifyapp.com" \
  -H "Content-Type: application/json" \
  -H "Authorization: YOUR_ID_TOKEN" \
  -d '{"resume":"test","jobDescription":"test"}' \
  -v https://dqypjuueic.execute-api.us-east-1.amazonaws.com/dev/optimize
