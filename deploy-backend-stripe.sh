#!/bin/bash

# JobTailorAI Pro - Stripe Backend Deployment Script
# This script deploys the Stripe webhook handlers and subscription management

set -e

echo "🔧 Deploying Stripe Backend Infrastructure..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check environment
ENVIRONMENT=${1:-prod}
print_status "Deploying to environment: $ENVIRONMENT"

# Step 1: Create Stripe secrets in AWS Secrets Manager
print_status "Setting up Stripe secrets..."

# Check if AWS CLI is configured
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI not found! Please install and configure AWS CLI"
    exit 1
fi

# Create secrets (user will need to update these manually)
SECRET_NAME="stripe-keys-${ENVIRONMENT}"

print_status "Creating AWS Secrets Manager entry for Stripe keys..."
aws secretsmanager create-secret \
    --name "$SECRET_NAME" \
    --description "Stripe API keys for JobTailorAI Pro - $ENVIRONMENT" \
    --secret-string '{"secret_key":"sk_live_REPLACE_WITH_YOUR_SECRET_KEY","webhook_secret":"whsec_REPLACE_WITH_YOUR_WEBHOOK_SECRET"}' \
    --region us-east-1 || print_warning "Secret may already exist"

print_warning "⚠️  IMPORTANT: Update the secret with your actual Stripe keys:"
echo "aws secretsmanager update-secret --secret-id $SECRET_NAME --secret-string '{\"secret_key\":\"sk_live_YOUR_KEY\",\"webhook_secret\":\"whsec_YOUR_WEBHOOK_SECRET\"}'"

# Step 2: Deploy CloudFormation stack with Stripe resources
print_status "Deploying CloudFormation stack with Stripe resources..."

aws cloudformation deploy \
    --template-file backend/templates/resume-optimizer-stack.yaml \
    --stack-name "resume-optimizer-stack-${ENVIRONMENT}" \
    --parameter-overrides Environment=$ENVIRONMENT \
    --capabilities CAPABILITY_IAM \
    --region us-east-1

if [ $? -eq 0 ]; then
    print_success "CloudFormation stack deployed successfully!"
else
    print_error "CloudFormation deployment failed"
    exit 1
fi

# Step 3: Update Lambda function code
print_status "Updating Lambda function code..."

# Package and deploy Stripe Checkout Lambda
cd backend/lambda-functions/stripe-checkout
zip -r stripe-checkout.zip . -x "*.pyc" "__pycache__/*"
aws lambda update-function-code \
    --function-name "ResumeOptimizerStripeCheckout-${ENVIRONMENT}" \
    --zip-file fileb://stripe-checkout.zip \
    --region us-east-1

# Package and deploy Stripe Portal Lambda
cd ../stripe-portal
zip -r stripe-portal.zip . -x "*.pyc" "__pycache__/*"
aws lambda update-function-code \
    --function-name "ResumeOptimizerStripePortal-${ENVIRONMENT}" \
    --zip-file fileb://stripe-portal.zip \
    --region us-east-1

# Package and deploy Stripe Webhook Lambda
cd ../stripe-webhook
zip -r stripe-webhook.zip . -x "*.pyc" "__pycache__/*"
aws lambda update-function-code \
    --function-name "ResumeOptimizerStripeWebhook-${ENVIRONMENT}" \
    --zip-file fileb://stripe-webhook.zip \
    --region us-east-1

cd ../../..

print_success "Lambda functions updated successfully!"

# Step 4: Get API Gateway endpoints
print_status "Getting API Gateway endpoints..."

API_ID=$(aws cloudformation describe-stacks \
    --stack-name "resume-optimizer-stack-${ENVIRONMENT}" \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayId`].OutputValue' \
    --output text \
    --region us-east-1)

if [ -n "$API_ID" ]; then
    WEBHOOK_URL="https://${API_ID}.execute-api.us-east-1.amazonaws.com/prod/stripe-webhook"
    print_success "Webhook URL: $WEBHOOK_URL"
    
    print_status "Next steps:"
    echo "1. Update Stripe secrets with your actual keys"
    echo "2. Configure webhook endpoint in Stripe Dashboard:"
    echo "   URL: $WEBHOOK_URL"
    echo "   Events: customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.payment_succeeded, invoice.payment_failed"
    echo "3. Test the webhook endpoint"
else
    print_error "Could not retrieve API Gateway ID"
fi

print_success "🎉 Stripe backend deployment completed!"
print_status "Don't forget to:"
echo "• Update AWS Secrets Manager with your live Stripe keys"
echo "• Configure webhook endpoint in Stripe Dashboard"
echo "• Test the complete payment flow"
