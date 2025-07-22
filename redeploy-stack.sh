#!/bin/bash

# Set variables
STACK_NAME="resume-optimizer-stack"
TEMPLATE_FILE="backend/templates/resume-optimizer-stack.yaml"
ENVIRONMENT="dev"

echo "Redeploying CloudFormation stack: $STACK_NAME"

# Deploy the CloudFormation stack
aws cloudformation deploy \
  --template-file $TEMPLATE_FILE \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides Environment=$ENVIRONMENT

echo "Stack deployment initiated. Checking status..."

# Get the outputs from the CloudFormation stack
echo "Getting stack outputs..."
aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs"

echo "Stack deployment completed."