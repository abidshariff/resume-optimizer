#!/bin/bash

# Set variables
STACK_NAME="resume-optimizer-stack"
TEMPLATE_FILE="backend/templates/resume-optimizer-stack.yaml"
ENVIRONMENT="dev"

echo "Deploying CloudFormation stack: $STACK_NAME"

# Check if stack exists
aws cloudformation describe-stacks --stack-name $STACK_NAME > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "Stack exists, updating..."
  # Update existing stack
  aws cloudformation update-stack \
    --stack-name $STACK_NAME \
    --template-body file://$TEMPLATE_FILE \
    --capabilities CAPABILITY_IAM \
    --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT
else
  echo "Stack does not exist, creating..."
  # Create new stack
  aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-body file://$TEMPLATE_FILE \
    --capabilities CAPABILITY_IAM \
    --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT
fi

echo "Stack deployment initiated. Waiting for completion..."

# Wait for stack operation to complete
aws cloudformation wait stack-create-complete --stack-name $STACK_NAME 2>/dev/null || \
aws cloudformation wait stack-update-complete --stack-name $STACK_NAME 2>/dev/null

# Get the outputs from the CloudFormation stack
echo "Getting stack outputs..."
aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs"

echo "Stack deployment completed."