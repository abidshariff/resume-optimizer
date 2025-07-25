#!/bin/bash

# Resume Optimizer - New AWS Account Deployment Script with Profile Support
# Usage: ./deploy-to-new-account-with-profile.sh [profile-name]

set -e  # Exit on any error

# Configuration
STACK_NAME="resume-optimizer-stack"
TEMPLATE_FILE="backend/templates/resume-optimizer-stack.yaml"
ENVIRONMENT="dev"
REGION="us-east-1"
AWS_PROFILE=${1:-"default"}  # Use provided profile or default

echo "🚀 Starting Resume Optimizer deployment to new AWS account..."
echo "AWS Profile: $AWS_PROFILE"
echo "Region: $REGION"
echo "Environment: $ENVIRONMENT"
echo ""

# Step 1: Verify AWS CLI configuration
echo "📋 Step 1: Verifying AWS CLI configuration..."
aws sts get-caller-identity --profile $AWS_PROFILE
if [ $? -ne 0 ]; then
    echo "❌ AWS CLI not configured properly for profile '$AWS_PROFILE'."
    echo "Please run: aws configure --profile $AWS_PROFILE"
    exit 1
fi
echo "✅ AWS CLI configured successfully"
echo ""

# Step 2: Deploy CloudFormation stack
echo "🏗️  Step 2: Deploying backend infrastructure..."
echo "Deploying CloudFormation stack: $STACK_NAME"

# Check if stack exists
aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --profile $AWS_PROFILE > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "Stack exists, updating..."
  aws cloudformation update-stack \
    --stack-name $STACK_NAME \
    --template-body file://$TEMPLATE_FILE \
    --capabilities CAPABILITY_IAM \
    --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
    --region $REGION \
    --profile $AWS_PROFILE
  
  echo "Waiting for stack update to complete..."
  aws cloudformation wait stack-update-complete --stack-name $STACK_NAME --region $REGION --profile $AWS_PROFILE
else
  echo "Stack does not exist, creating..."
  aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-body file://$TEMPLATE_FILE \
    --capabilities CAPABILITY_IAM \
    --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
    --region $REGION \
    --profile $AWS_PROFILE
  
  echo "Waiting for stack creation to complete..."
  aws cloudformation wait stack-create-complete --stack-name $STACK_NAME --region $REGION --profile $AWS_PROFILE
fi

echo "✅ Backend infrastructure deployed successfully"
echo ""

# Step 3: Get stack outputs
echo "📊 Step 3: Getting deployment outputs..."
OUTPUTS=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --profile $AWS_PROFILE \
  --query "Stacks[0].Outputs")

echo "Stack Outputs:"
echo "$OUTPUTS"

# Extract specific values for frontend configuration
API_ENDPOINT=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="ApiEndpoint") | .OutputValue')
USER_POOL_ID=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="UserPoolId") | .OutputValue')
USER_POOL_CLIENT_ID=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="UserPoolClientId") | .OutputValue')
STORAGE_BUCKET=$(echo "$OUTPUTS" | jq -r '.[] | select(.OutputKey=="StorageBucket") | .OutputValue')

echo ""
echo "🔧 Step 4: Frontend Configuration Values"
echo "Copy these values for your frontend configuration:"
echo ""
echo "REACT_APP_AWS_REGION=$REGION"
echo "REACT_APP_USER_POOL_ID=$USER_POOL_ID"
echo "REACT_APP_USER_POOL_WEB_CLIENT_ID=$USER_POOL_CLIENT_ID"
echo "REACT_APP_API_ENDPOINT=$API_ENDPOINT"
echo ""

# Step 5: Update Lambda functions
echo "🔄 Step 5: Updating Lambda functions with actual code..."

# Package and update Resume Processor Lambda
echo "Updating Resume Processor Lambda..."
cd backend/lambda-functions/resume-processor
zip -r function.zip index.py > /dev/null
aws lambda update-function-code \
  --function-name "ResumeOptimizerProcessor-$ENVIRONMENT" \
  --zip-file fileb://function.zip \
  --region $REGION \
  --profile $AWS_PROFILE > /dev/null
rm function.zip
cd ../../..

# Package and update AI Handler Lambda
echo "Updating AI Handler Lambda..."
cd backend/lambda-functions/ai-handler
zip -r function.zip index.py > /dev/null
aws lambda update-function-code \
  --function-name "ResumeOptimizerAIHandler-$ENVIRONMENT" \
  --zip-file fileb://function.zip \
  --region $REGION \
  --profile $AWS_PROFILE > /dev/null
rm function.zip
cd ../../..

echo "✅ Lambda functions updated successfully"
echo ""

# Step 6: Create environment file for frontend
echo "📝 Step 6: Creating frontend environment file..."
cat > frontend/.env << EOF
REACT_APP_AWS_REGION=$REGION
REACT_APP_USER_POOL_ID=$USER_POOL_ID
REACT_APP_USER_POOL_WEB_CLIENT_ID=$USER_POOL_CLIENT_ID
REACT_APP_API_ENDPOINT=$API_ENDPOINT
EOF

echo "✅ Frontend .env file created"
echo ""

# Step 7: Build frontend
echo "🏗️  Step 7: Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Frontend built successfully"
echo ""

echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Your backend is deployed and ready"
echo "2. Frontend is built in the 'frontend/build' directory"
echo "3. Deploy frontend using AWS Amplify or S3+CloudFront"
echo ""
echo "🔗 Backend Resources:"
echo "   AWS Account: $(aws sts get-caller-identity --profile $AWS_PROFILE --query Account --output text)"
echo "   API Endpoint: $API_ENDPOINT"
echo "   User Pool ID: $USER_POOL_ID"
echo "   Storage Bucket: $STORAGE_BUCKET"
