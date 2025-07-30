#!/bin/bash

# JobTailorAI Website Deployment Script
echo "🌐 Deploying JobTailorAI website to S3..."

BUCKET_NAME="jobtailorai.com-website"
BUILD_DIR="frontend/build"
CLOUDFRONT_DISTRIBUTION_ID=""

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory not found. Running npm build..."
    cd frontend && npm run build && cd ..
fi

# Sync files to S3
echo "📤 Uploading files to S3 bucket: $BUCKET_NAME"
aws s3 sync $BUILD_DIR s3://$BUCKET_NAME --delete --region us-east-1

# Set proper content types
echo "🔧 Setting content types..."
aws s3 cp s3://$BUCKET_NAME s3://$BUCKET_NAME --recursive \
    --exclude "*" --include "*.html" \
    --content-type "text/html" \
    --cache-control "no-cache" \
    --region us-east-1

aws s3 cp s3://$BUCKET_NAME s3://$BUCKET_NAME --recursive \
    --exclude "*" --include "*.js" \
    --content-type "application/javascript" \
    --cache-control "max-age=31536000" \
    --region us-east-1

aws s3 cp s3://$BUCKET_NAME s3://$BUCKET_NAME --recursive \
    --exclude "*" --include "*.css" \
    --content-type "text/css" \
    --cache-control "max-age=31536000" \
    --region us-east-1

# Get CloudFront distribution ID
echo "🔍 Getting CloudFront distribution ID..."
CLOUDFRONT_DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name jobtailorai-domain \
    --region us-east-1 \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
    --output text)

if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo "🔄 Creating CloudFront invalidation..."
    aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*" \
        --region us-east-1
    echo "✅ CloudFront cache invalidated"
else
    echo "⚠️  Could not find CloudFront distribution ID"
fi

echo "🎉 Website deployment completed!"
echo "🌐 Your website should be available at: https://jobtailorai.com"
echo "🌐 And also at: https://www.jobtailorai.com"
