#!/bin/bash

# JobTailorAI Domain Setup Script
echo "🚀 Setting up JobTailorAI domain infrastructure..."

STACK_NAME="jobtailorai-domain"
TEMPLATE_FILE="backend/templates/domain-setup.yaml"

# Deploy the CloudFormation stack
echo "📦 Deploying CloudFormation stack: $STACK_NAME"

if aws cloudformation describe-stacks --stack-name $STACK_NAME --region us-east-1 >/dev/null 2>&1; then
    echo "Stack exists, updating..."
    aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --region us-east-1
else
    echo "Creating new stack..."
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --region us-east-1
fi

# Wait for stack completion
echo "⏳ Waiting for stack deployment to complete..."
aws cloudformation wait stack-create-complete --stack-name $STACK_NAME --region us-east-1 2>/dev/null || \
aws cloudformation wait stack-update-complete --stack-name $STACK_NAME --region us-east-1

# Get stack outputs
echo "📊 Getting stack outputs..."
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region us-east-1 \
    --query "Stacks[0].Outputs"

echo "✅ Domain infrastructure deployment completed!"
echo ""
echo "🔧 Next Steps:"
echo "1. Update nameservers in GoDaddy (see NameServers output above)"
echo "2. Validate SSL certificate in AWS Certificate Manager"
echo "3. Deploy website files to S3 bucket"
echo "4. Test your domain: https://jobtailorai.com"
