#!/bin/bash

# Update Email Template Script
# This script updates the CloudFormation stack to apply the new email verification template

set -e

ENVIRONMENT=${1:-prod}
STACK_NAME="resume-optimizer-stack-${ENVIRONMENT}"
TEMPLATE_FILE="backend/templates/resume-optimizer-stack.yaml"

echo "🚀 Updating email verification template for environment: ${ENVIRONMENT}"
echo "📋 Stack name: ${STACK_NAME}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if the template file exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "❌ Template file not found: $TEMPLATE_FILE"
    exit 1
fi

# Validate the CloudFormation template
echo "🔍 Validating CloudFormation template..."
aws cloudformation validate-template --template-body file://$TEMPLATE_FILE > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ Template validation successful"
else
    echo "❌ Template validation failed"
    exit 1
fi

# Update the CloudFormation stack
echo "📤 Updating CloudFormation stack..."
aws cloudformation update-stack \
    --stack-name $STACK_NAME \
    --template-body file://$TEMPLATE_FILE \
    --capabilities CAPABILITY_IAM \
    --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT

if [ $? -eq 0 ]; then
    echo "✅ Stack update initiated successfully"
    echo "⏳ Waiting for stack update to complete..."
    
    # Wait for the stack update to complete
    aws cloudformation wait stack-update-complete --stack-name $STACK_NAME
    
    if [ $? -eq 0 ]; then
        echo "🎉 Stack update completed successfully!"
        echo "📧 New email verification template is now active"
        echo ""
        echo "📋 Summary of changes:"
        echo "   • Updated email subject to 'Welcome to JobTailorAI'"
        echo "   • Professional HTML email template with branding"
        echo "   • Added feature highlights and statistics"
        echo "   • Improved visual design with gradients and styling"
        echo "   • Added call-to-action button and footer links"
        echo ""
        echo "🔗 Users will now receive the updated email when they sign up!"
    else
        echo "❌ Stack update failed. Please check the AWS CloudFormation console for details."
        exit 1
    fi
else
    echo "❌ Failed to initiate stack update. Please check your AWS credentials and permissions."
    exit 1
fi
