#!/bin/bash

# Deploy Optional Job Description Update
echo "🚀 Deploying Optional Job Description Update..."
echo "==============================================="

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
echo "🎉 Optional Job Description Update Deployed Successfully!"
echo "========================================================"
echo ""
echo "✅ Changes Deployed:"
echo "   📝 Job description is now optional in frontend"
echo "   🔧 Backend validation updated to allow empty job descriptions"
echo "   🤖 AI handler updated to handle optional job descriptions"
echo "   📄 Cover letter generation works with or without job description"
echo "   🎯 Resume optimization works with job title only"
echo ""
echo "📋 New Behavior:"
echo "   1. Job description field shows '(Optional)' label"
echo "   2. Users can submit with just job title and company name"
echo "   3. AI optimizes resume based on job title when no description provided"
echo "   4. Cover letter generation adapts to available information"
echo "   5. Skills extraction skipped when no job description provided"
echo ""
echo "🧪 Test the updated functionality:"
echo "   1. Upload a resume"
echo "   2. Enter job title only (leave job description empty)"
echo "   3. Optionally enable Generate CV and enter company name"
echo "   4. Click 'Craft Resume'"
echo "   5. Verify resume optimization works without job description"
echo ""
echo "🚀 Frontend build is ready in ./frontend/build/"
echo "📊 Backend Lambda functions updated and active"
