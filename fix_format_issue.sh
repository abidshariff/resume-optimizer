#!/bin/bash

# Script to fix the output format issue

echo "🔧 Fixing output format selection issue..."

# Update AI Handler Lambda function
echo "📦 Updating AI Handler Lambda function..."
cd backend/lambda-functions/ai-handler
zip -r ai-handler-format-fix.zip . -x "*.pyc" "__pycache__/*" "*.git*"

aws lambda update-function-code \
    --function-name ResumeOptimizerAIHandler-prod \
    --zip-file fileb://ai-handler-format-fix.zip

if [ $? -eq 0 ]; then
    echo "✅ AI Handler updated successfully!"
else
    echo "❌ Failed to update AI Handler"
    exit 1
fi

# Clean up
rm ai-handler-format-fix.zip

# Update Resume Processor Lambda function
echo "📦 Updating Resume Processor Lambda function..."
cd ../resume-processor
zip -r resume-processor-format-fix.zip . -x "*.pyc" "__pycache__/*" "*.git*"

aws lambda update-function-code \
    --function-name ResumeOptimizerProcessor-prod \
    --zip-file fileb://resume-processor-format-fix.zip

if [ $? -eq 0 ]; then
    echo "✅ Resume Processor updated successfully!"
else
    echo "❌ Failed to update Resume Processor"
    exit 1
fi

# Clean up
rm resume-processor-format-fix.zip

cd ../../..

echo "🎉 Format fix deployment complete!"
echo ""
echo "🔍 Changes applied:"
echo "   • Fixed frontend format selection to use resumeOutputFormat"
echo "   • Fixed SettingsDialog to save to correct localStorage key"
echo "   • Added debugging logs to track format selection"
echo "   • Changed default format from 'word' to 'docx' in resume processor"
echo ""
echo "🧪 Please test the format selection now:"
echo "   1. Go to Settings and set Resume Output Format to 'Word Document (.docx)'"
echo "   2. Submit a resume and check if it downloads as .docx"
echo "   3. Try changing to PDF and test again"
