#!/bin/bash

# Deploy Generate CV Feature - Incremental Update
echo "🚀 Deploying Generate CV Feature..."
echo "===================================="

# Set environment (default to prod)
ENV=${1:-prod}
echo "📋 Environment: $ENV"

# Function to check if AWS CLI is configured
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        echo "❌ AWS CLI not found. Please install AWS CLI first."
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        echo "❌ AWS CLI not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    echo "✅ AWS CLI configured and ready"
}

# Check AWS CLI
check_aws_cli

# Deploy Resume Processor Lambda
echo ""
echo "📝 Deploying Resume Processor Lambda..."
echo "======================================="
cd backend/lambda-functions/resume-processor

# Create deployment package
echo "📦 Creating deployment package..."
zip -r resume-processor-$ENV.zip . -x "*.pyc" "__pycache__/*" "*.git*" "*.DS_Store"

# Check if zip was created successfully
if [ ! -f "resume-processor-$ENV.zip" ]; then
    echo "❌ Failed to create deployment package"
    exit 1
fi

echo "📊 Package size: $(du -h resume-processor-$ENV.zip | cut -f1)"

# Update Lambda function
echo "🚀 Updating Lambda function..."
aws lambda update-function-code \
    --function-name ResumeOptimizerProcessor-$ENV \
    --zip-file fileb://resume-processor-$ENV.zip \
    --region us-east-1

if [ $? -eq 0 ]; then
    echo "✅ Resume Processor updated successfully"
else
    echo "❌ Failed to update Resume Processor"
    exit 1
fi

# Clean up
rm resume-processor-$ENV.zip
echo "🧹 Cleaned up deployment package"

# Deploy AI Handler Lambda
echo ""
echo "🤖 Deploying AI Handler Lambda..."
echo "================================="
cd ../ai-handler

# Create deployment package
echo "📦 Creating deployment package..."
zip -r ai-handler-$ENV.zip . -x "*.pyc" "__pycache__/*" "*.git*" "*.DS_Store"

# Check if zip was created successfully
if [ ! -f "ai-handler-$ENV.zip" ]; then
    echo "❌ Failed to create deployment package"
    exit 1
fi

echo "📊 Package size: $(du -h ai-handler-$ENV.zip | cut -f1)"

# Update Lambda function
echo "🚀 Updating Lambda function..."
aws lambda update-function-code \
    --function-name ResumeOptimizerAIHandler-$ENV \
    --zip-file fileb://ai-handler-$ENV.zip \
    --region us-east-1

if [ $? -eq 0 ]; then
    echo "✅ AI Handler updated successfully"
else
    echo "❌ Failed to update AI Handler"
    exit 1
fi

# Clean up
rm ai-handler-$ENV.zip
echo "🧹 Cleaned up deployment package"

# Return to root directory
cd ../../..

echo ""
echo "🎉 Generate CV Feature Deployed Successfully!"
echo "============================================="
echo ""
echo "✅ Features Deployed:"
echo "   📝 Generate CV toggle in frontend"
echo "   🏢 Company name becomes mandatory when CV enabled"
echo "   📄 Cover letter generation using Bedrock"
echo "   ⚙️  Updated user settings (document formats)"
echo "   🔧 Backend validation and processing"
echo ""
echo "📋 New Functionality:"
echo "   1. Generate CV toggle on job description page"
echo "   2. Dynamic company name field (required when CV enabled)"
echo "   3. Professional cover letter generation"
echo "   4. Cover letter preview dialog"
echo "   5. Document format settings for resume and cover letter"
echo ""
echo "🧪 Test the new features:"
echo "   1. Upload a resume"
echo "   2. Enter job title and job description"
echo "   3. Enable 'Generate Cover Letter' toggle"
echo "   4. Enter company name (now required)"
echo "   5. Click 'Craft Resume'"
echo "   6. Check for 'Preview Cover Letter' button on results"
echo ""
echo "🚀 Frontend build is ready in ./frontend/build/"
echo "📊 Backend Lambda functions updated and active"
