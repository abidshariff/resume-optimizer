#!/bin/bash

# AI Handler Deployment Verification Script
set -e

# Configuration
FUNCTION_NAME="ResumeOptimizerAIHandler"
ENVIRONMENT=${1:-prod}
REGION=${AWS_DEFAULT_REGION:-us-east-1}

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

print_status "🔍 Verifying AI Handler deployment..."

# Check function exists and get info
FUNCTION_INFO=$(aws lambda get-function \
    --function-name "${FUNCTION_NAME}-${ENVIRONMENT}" \
    --region ${REGION} 2>/dev/null)

if [ $? -eq 0 ]; then
    print_success "✅ Function exists: ${FUNCTION_NAME}-${ENVIRONMENT}"
    
    # Extract key information
    CODE_SIZE=$(echo "$FUNCTION_INFO" | jq -r '.Configuration.CodeSize')
    RUNTIME=$(echo "$FUNCTION_INFO" | jq -r '.Configuration.Runtime')
    LAST_MODIFIED=$(echo "$FUNCTION_INFO" | jq -r '.Configuration.LastModified')
    
    print_status "Code Size: $(echo "scale=2; $CODE_SIZE/1024/1024" | bc) MB"
    print_status "Runtime: $RUNTIME"
    print_status "Last Modified: $LAST_MODIFIED"
    
    # Test function with a simple invocation
    print_status "🧪 Testing function invocation..."
    
    TEST_PAYLOAD='{"test": true, "action": "health_check"}'
    
    aws lambda invoke \
        --function-name "${FUNCTION_NAME}-${ENVIRONMENT}" \
        --payload "$TEST_PAYLOAD" \
        --region ${REGION} \
        response.json > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        print_success "✅ Function invocation successful"
        if [ -f response.json ]; then
            print_status "Response preview:"
            head -c 200 response.json
            echo ""
            rm -f response.json
        fi
    else
        print_error "❌ Function invocation failed"
    fi
    
else
    print_error "❌ Function not found: ${FUNCTION_NAME}-${ENVIRONMENT}"
    exit 1
fi

print_success "🎉 Verification complete!"
