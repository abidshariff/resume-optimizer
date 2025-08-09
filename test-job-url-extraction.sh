#!/bin/bash

# Test Job URL Extraction
# This script tests the job URL extractor function directly

set -e

# Configuration
ENVIRONMENT=${1:-dev}
STACK_NAME="resume-optimizer-stack-${ENVIRONMENT}"
REGION="us-east-1"
JOB_URL="https://careers.mastercard.com/us/en/job/MASRUSR252285EXTERNALENUS/Manager-Data-Engineering?utm_source=linkedin&utm_medium=phenom-feeds&source=LINKEDIN"

echo "🧪 Testing Job URL Extraction"
echo "Environment: $ENVIRONMENT"
echo "Job URL: $JOB_URL"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Get function name
JOB_URL_EXTRACTOR_FUNCTION="ResumeOptimizerJobUrlExtractor-${ENVIRONMENT}"

echo "📋 Function: $JOB_URL_EXTRACTOR_FUNCTION"
echo ""

# Create test payload
TEST_PAYLOAD=$(cat <<EOF
{
  "jobUrl": "$JOB_URL"
}
EOF
)

echo "📤 Test Payload:"
echo "$TEST_PAYLOAD"
echo ""

# Test the function
echo "🚀 Invoking Lambda function..."
echo ""

# Create temporary file for response
RESPONSE_FILE=$(mktemp)

# Invoke the function and capture response
aws lambda invoke \
    --function-name "$JOB_URL_EXTRACTOR_FUNCTION" \
    --payload "$TEST_PAYLOAD" \
    --region "$REGION" \
    "$RESPONSE_FILE"

echo "📥 Response:"
cat "$RESPONSE_FILE" | jq '.' 2>/dev/null || cat "$RESPONSE_FILE"
echo ""

# Check if extraction was successful
if cat "$RESPONSE_FILE" | jq -e '.success' > /dev/null 2>&1; then
    echo "✅ Job URL extraction successful!"
    echo ""
    echo "📊 Extracted Data:"
    cat "$RESPONSE_FILE" | jq '.data' 2>/dev/null || echo "Could not parse data"
else
    echo "❌ Job URL extraction failed"
    echo ""
    echo "🔍 Error Details:"
    cat "$RESPONSE_FILE" | jq '.error' 2>/dev/null || echo "Could not parse error"
fi

# Clean up
rm -f "$RESPONSE_FILE"

echo ""
echo "🔍 To check detailed logs:"
echo "aws logs tail /aws/lambda/$JOB_URL_EXTRACTOR_FUNCTION --follow --region $REGION"
echo ""
echo "💡 If extraction failed, check:"
echo "  1. Function deployment status"
echo "  2. CloudWatch logs for detailed errors"
echo "  3. Network connectivity and timeouts"
echo "  4. Website structure changes"
