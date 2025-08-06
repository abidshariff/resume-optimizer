#!/bin/bash

# Script to update the AI Handler Lambda function with the cover letter fix

echo "🔧 Updating AI Handler Lambda function with cover letter download fix..."

# Use the known function name
FUNCTION_NAME="ResumeOptimizerAIHandler-prod"

echo "📝 Found AI Handler function: $FUNCTION_NAME"

# Navigate to the AI handler directory
cd backend/lambda-functions/ai-handler

# Create a deployment package
echo "📦 Creating deployment package..."
zip -r ai-handler-update.zip . -x "*.pyc" "__pycache__/*" "*.git*"

# Update the Lambda function
echo "🚀 Updating Lambda function code..."
aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://ai-handler-update.zip

if [ $? -eq 0 ]; then
    echo "✅ AI Handler Lambda function updated successfully!"
    echo "🔍 The following fixes were applied:"
    echo "   • Fixed cover letter generation when company name is not provided"
    echo "   • Added create_pdf_from_text function for PDF cover letters"
    echo "   • Improved error handling for cover letter file creation"
    echo ""
    echo "🧪 Test the cover letter download functionality now!"
else
    echo "❌ Failed to update Lambda function"
    exit 1
fi

# Clean up
rm ai-handler-update.zip

echo "🎉 Update complete! Cover letter download should now work properly."
