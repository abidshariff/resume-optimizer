#!/bin/bash

# Set variables
STACK_NAME="resume-optimizer-stack"
TEMPLATE_FILE="backend/templates/resume-optimizer-stack.yaml"
ENVIRONMENT="dev"

echo "Checking stack status..."
STACK_STATUS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].StackStatus" --output text 2>/dev/null || echo "DOES_NOT_EXIST")

echo "Current stack status: $STACK_STATUS"

if [ "$STACK_STATUS" == "DELETE_FAILED" ]; then
  echo "Stack is in DELETE_FAILED state. Attempting to delete with retain resources..."
  
  # Get resources that might be causing deletion failure
  RESOURCES=$(aws cloudformation list-stack-resources --stack-name $STACK_NAME --query "StackResourceSummaries[?ResourceStatus=='DELETE_FAILED'].LogicalResourceId" --output text)
  
  echo "Resources that might be causing deletion failure: $RESOURCES"
  
  # Delete stack with retain resources option
  aws cloudformation delete-stack --stack-name $STACK_NAME --retain-resources $RESOURCES
  
  echo "Waiting for stack deletion..."
  aws cloudformation wait stack-delete-complete --stack-name $STACK_NAME || true
  
  echo "Creating new stack..."
  aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-body file://$TEMPLATE_FILE \
    --capabilities CAPABILITY_IAM \
    --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT
    
  echo "Waiting for stack creation..."
  aws cloudformation wait stack-create-complete --stack-name $STACK_NAME
  
elif [ "$STACK_STATUS" == "DOES_NOT_EXIST" ]; then
  echo "Stack does not exist. Creating new stack..."
  
  aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-body file://$TEMPLATE_FILE \
    --capabilities CAPABILITY_IAM \
    --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT
    
  echo "Waiting for stack creation..."
  aws cloudformation wait stack-create-complete --stack-name $STACK_NAME
  
else
  echo "Updating existing stack..."
  
  aws cloudformation update-stack \
    --stack-name $STACK_NAME \
    --template-body file://$TEMPLATE_FILE \
    --capabilities CAPABILITY_IAM \
    --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT
    
  echo "Waiting for stack update..."
  aws cloudformation wait stack-update-complete --stack-name $STACK_NAME
fi

# Get the outputs from the CloudFormation stack
echo "Getting stack outputs..."
aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query "Stacks[0].Outputs"

echo "Stack deployment completed."