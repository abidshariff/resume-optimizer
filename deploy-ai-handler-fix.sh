#!/bin/bash

# Deploy AI Handler Lambda function with company name preservation fix
echo "🚨 Deploying CRITICAL BUG FIX: Company name preservation"
echo "📦 Updating AI Handler Lambda function..."

cd backend/lambda-functions/ai-handler

# Create deployment package
zip -r ai-handler-fix.zip . -x "*.pyc" "__pycache__/*"

# Update Lambda function
aws lambda update-function-code \
    --function-name ResumeOptimizerAIHandler-prod \
    --zip-file fileb://ai-handler-fix.zip

# Clean up
rm ai-handler-fix.zip

echo "✅ AI Handler updated successfully!"
echo "🔒 Company names in work history are now protected from modification"
