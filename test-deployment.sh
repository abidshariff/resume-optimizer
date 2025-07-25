#!/bin/bash

echo "🧪 Testing Resume Optimizer Deployment"
echo "======================================"

# Test API Gateway endpoint
echo "1. Testing API Gateway endpoint..."
API_ENDPOINT="https://x62c0f3cme.execute-api.us-east-1.amazonaws.com/dev/optimize"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$API_ENDPOINT" || echo "❌ API endpoint not reachable"

# Test Cognito User Pool
echo "2. Testing Cognito User Pool..."
aws cognito-idp describe-user-pool --user-pool-id us-east-1_RFsEVrGxp --region us-east-1 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Cognito User Pool is accessible"
else
    echo "❌ Cognito User Pool not accessible"
fi

# Test S3 bucket
echo "3. Testing S3 storage bucket..."
aws s3 ls s3://resume-optimizer-storage-066148155043-dev --region us-east-1 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ S3 bucket is accessible"
else
    echo "❌ S3 bucket not accessible"
fi

# Test Lambda functions
echo "4. Testing Lambda functions..."
aws lambda get-function --function-name ResumeOptimizerProcessor-dev --region us-east-1 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Resume Processor Lambda is deployed"
else
    echo "❌ Resume Processor Lambda not found"
fi

aws lambda get-function --function-name ResumeOptimizerAIHandler-dev --region us-east-1 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ AI Handler Lambda is deployed"
else
    echo "❌ AI Handler Lambda not found"
fi

# Check Amplify app status
echo "5. Checking Amplify app status..."
aws amplify get-app --app-id d3tjpmlvy19b2l --region us-east-1 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Amplify app is created"
    echo "🌐 Frontend URL: https://main.d3tjpmlvy19b2l.amplifyapp.com"
    echo "📱 Amplify Console: https://console.aws.amazon.com/amplify/home?region=us-east-1#/d3tjpmlvy19b2l"
else
    echo "❌ Amplify app not found"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Connect GitHub repository in Amplify Console"
echo "2. Wait for build to complete"
echo "3. Test the application at: https://main.d3tjpmlvy19b2l.amplifyapp.com"
echo "4. Run this script again to verify all components"
