#!/bin/bash

echo "🚀 Updating AI Handler Lambda function with improved content preservation..."

# Navigate to the AI handler directory
cd backend/lambda-functions/ai-handler

# Create deployment package
echo "📦 Creating deployment package..."
zip -r function.zip index.py minimal_word_generator.py enhanced_word_generator.py pdf_generator.py

# Update the Lambda function
echo "⬆️ Updating Lambda function..."
aws lambda update-function-code \
  --function-name ResumeOptimizerAIHandler-dev \
  --zip-file fileb://function.zip

# Check if update was successful
if [ $? -eq 0 ]; then
    echo "✅ Lambda function updated successfully!"
    echo "🔧 Changes made:"
    echo "   - Added PDF generation support using reportlab"
    echo "   - Updated format mapping (docx -> word, txt -> text, pdf -> pdf)"
    echo "   - Enhanced content preservation with all bullet points"
    echo "   - Added structure analysis for better optimization"
else
    echo "❌ Failed to update Lambda function"
    exit 1
fi

# Clean up
rm function.zip

echo "🎉 Deployment complete! The resume optimizer will now preserve all original content."
