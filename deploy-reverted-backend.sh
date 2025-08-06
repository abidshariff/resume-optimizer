#!/bin/bash

# Deploy Reverted Backend Lambda Functions
echo "🚀 Deploying Reverted Backend Lambda Functions..."
echo "================================================="

# Set environment (default to prod)
ENV=${1:-prod}
echo "📋 Environment: $ENV"
echo "🔄 Deploying clean code (reverted from CV toggle changes)"

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

# Show current directory contents
echo "📁 Files to deploy:"
ls -la *.py

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
    echo "💡 Make sure the function name 'ResumeOptimizerProcessor-$ENV' exists"
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

# Show current directory contents
echo "📁 Files to deploy:"
ls -la *.py

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
    echo "💡 Make sure the function name 'ResumeOptimizerAIHandler-$ENV' exists"
    exit 1
fi

# Clean up
rm ai-handler-$ENV.zip
echo "🧹 Cleaned up deployment package"

# Return to root directory
cd ../../..

# Verify deployment
echo ""
echo "🔍 Verifying Deployment..."
echo "=========================="

echo "📝 Resume Processor Function Info:"
aws lambda get-function --function-name ResumeOptimizerProcessor-$ENV --region us-east-1 --query 'Configuration.[FunctionName,LastModified,CodeSize]' --output table

echo ""
echo "🤖 AI Handler Function Info:"
aws lambda get-function --function-name ResumeOptimizerAIHandler-$ENV --region us-east-1 --query 'Configuration.[FunctionName,LastModified,CodeSize]' --output table

echo ""
echo "🎉 Backend Deployment Complete!"
echo "==============================="
echo ""
echo "✅ Successfully deployed:"
echo "   📝 Resume Processor Lambda (reverted code)"
echo "   🤖 AI Handler Lambda (reverted code)"
echo ""
echo "🔄 Your backend is now synchronized with the reverted frontend code"
echo ""
echo "🧪 Test your application:"
echo "   1. Upload a resume"
echo "   2. Enter job title (required)"
echo "   3. Enter company name (optional)"
echo "   4. Enter job description (required)"
echo "   5. Click 'Craft Resume'"
echo "   6. Verify resume optimization works correctly"
echo ""
echo "🚀 Your application should now work as it did before the CV toggle implementation!"
