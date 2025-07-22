#!/bin/bash

# Set variables
STACK_NAME="resume-optimizer-stack"
TEMPLATE_FILE="backend/templates/resume-optimizer-stack.yaml"
ENVIRONMENT="dev"

echo "Deleting existing CloudFormation stack: $STACK_NAME"

# Delete the existing stack
aws cloudformation delete-stack --stack-name $STACK_NAME

echo "Waiting for stack deletion to complete..."
aws cloudformation wait stack-delete-complete --stack-name $STACK_NAME

echo "Creating new CloudFormation stack: $STACK_NAME"

# Create a new stack
aws cloudformation create-stack \
  --stack-name $STACK_NAME \
  --template-body file://$TEMPLATE_FILE \
  --capabilities CAPABILITY_IAM \
  --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT

echo "Waiting for stack creation to complete..."
aws cloudformation wait stack-create-complete --stack-name $STACK_NAME

# Get the outputs from the CloudFormation stack
echo "Getting stack outputs..."
aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs"

echo "Stack deployment completed."