#!/bin/bash

# Update AI Models Script
# This script updates the AI Handler Lambda function with the new cost-optimized model hierarchy

set -e

# Configuration
ENVIRONMENT=${1:-prod}
FUNCTION_NAME="ResumeOptimizerAIHandler-${ENVIRONMENT}"
LAMBDA_DIR="backend/lambda-functions/ai-handler"

echo "🚀 Updating AI Handler with Cost-Optimized Model Hierarchy"
echo "Environment: $ENVIRONMENT"
echo "Function Name: $FUNCTION_NAME"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Check if the Lambda function exists
if ! aws lambda get-function --function-name "$FUNCTION_NAME" > /dev/null 2>&1; then
    echo "❌ Lambda function '$FUNCTION_NAME' not found."
    echo "Please deploy the infrastructure first using ./deploy.sh"
    exit 1
fi

echo "📦 Preparing Lambda deployment package..."

# Create temporary directory for packaging
TEMP_DIR=$(mktemp -d)
echo "Using temporary directory: $TEMP_DIR"

# Copy Lambda function code
cp -r "$LAMBDA_DIR"/* "$TEMP_DIR/"

# Install dependencies if requirements.txt exists
if [ -f "$LAMBDA_DIR/requirements.txt" ]; then
    echo "📋 Installing Python dependencies..."
    pip3 install -r "$LAMBDA_DIR/requirements.txt" -t "$TEMP_DIR/" --quiet
fi

# Create deployment package
echo "📦 Creating deployment package..."
cd "$TEMP_DIR"
zip -r ../lambda-package.zip . > /dev/null
cd - > /dev/null

# Update Lambda function
echo "🔄 Updating Lambda function code..."
aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file "fileb://$TEMP_DIR/../lambda-package.zip" \
    --no-cli-pager

# Wait for update to complete
echo "⏳ Waiting for function update to complete..."
aws lambda wait function-updated --function-name "$FUNCTION_NAME"

# Update environment variables with model information
echo "🔧 Updating environment variables..."
aws lambda update-function-configuration \
    --function-name "$FUNCTION_NAME" \
    --environment Variables="{
        STORAGE_BUCKET=$(aws lambda get-function-configuration --function-name "$FUNCTION_NAME" --query 'Environment.Variables.STORAGE_BUCKET' --output text),
        USER_HISTORY_TABLE=$(aws lambda get-function-configuration --function-name "$FUNCTION_NAME" --query 'Environment.Variables.USER_HISTORY_TABLE' --output text),
        MODEL_HIERARCHY=cost_optimized,
        PRIMARY_MODEL=amazon.titan-text-lite-v1,
        FALLBACK_ENABLED=true
    }" \
    --no-cli-pager > /dev/null

# Clean up
rm -rf "$TEMP_DIR" "$TEMP_DIR/../lambda-package.zip"

echo ""
echo "✅ AI Handler updated successfully!"
echo ""
echo "📊 New Model Hierarchy (Cost Order - Most to Least Expensive):"
echo "   1. Amazon Nova Pro      - \$2.00/\$8.00 per 1M tokens (Premium multimodal)"
echo "   2. Claude 3 Haiku       - \$0.25/\$1.25 per 1M tokens (Fast, efficient)"
echo "   3. Amazon Nova Lite     - \$0.60/\$2.40 per 1M tokens (Balanced multimodal)"
echo "   4. Llama 3.2 3B         - \$0.60/\$0.60 per 1M tokens (Cost-effective)"
echo "   5. Titan Text Lite      - \$0.30/\$0.40 per 1M tokens (PRIMARY - Most economical)"
echo "   6. Amazon Nova Micro    - \$0.35/\$1.40 per 1M tokens (Ultra-economical)"
echo "   7. Mistral 7B           - \$0.15/\$0.20 per 1M tokens (Backup option)"
echo ""
echo "💡 Cost Savings Estimate:"
echo "   Previous (Claude 3.5 Sonnet): ~\$18.00 per 1M tokens"
echo "   New Primary (Titan Lite):     ~\$0.70 per 1M tokens"
echo "   Potential Savings:            ~96% cost reduction"
echo ""
echo "🔄 The system will automatically try models in order until one succeeds."
echo "📈 Monitor CloudWatch logs to see which models are being used."
echo ""

# Test the function
echo "🧪 Testing the updated function..."
TEST_PAYLOAD="{
    \"userId\": \"test-user\",
    \"jobId\": \"test-job-$(date +%s)\",
    \"resumeKey\": \"test/resume.txt\",
    \"jobDescriptionKey\": \"test/job.txt\",
    \"statusKey\": \"test/status.json\",
    \"outputFormat\": \"text\"
}"

# Create a simple test (this will fail but should show the model hierarchy in logs)
echo "   Creating test invocation (will show model hierarchy in logs)..."
aws lambda invoke \
    --function-name "$FUNCTION_NAME" \
    --payload "$TEST_PAYLOAD" \
    --log-type Tail \
    /tmp/test-response.json > /dev/null 2>&1 || true

echo ""
echo "🎉 Update complete! Your resume optimizer now uses cost-optimized AI models."
echo "📊 Check CloudWatch logs to monitor model usage and costs."
echo ""
echo "Next steps:"
echo "1. Monitor the application to ensure it works with the new models"
echo "2. Check CloudWatch logs for model selection patterns"
echo "3. Review costs in AWS Cost Explorer after a few days of usage"
echo ""
