#!/bin/bash

# Frontend Deployment Script for S3 + CloudFront
# This script deploys the built frontend to S3 and sets up CloudFront

set -e

# Configuration
BUCKET_NAME="resume-optimizer-frontend-$(date +%s)"
REGION="us-east-1"

echo "🚀 Deploying Frontend to S3 + CloudFront"
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo ""

# Step 1: Create S3 bucket
echo "📦 Step 1: Creating S3 bucket..."
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Step 2: Configure bucket for static website hosting
echo "🌐 Step 2: Configuring static website hosting..."
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html

# Step 3: Set bucket policy for public read access
echo "🔓 Step 3: Setting bucket policy..."
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket $BUCKET_NAME \
  --policy file://bucket-policy.json

rm bucket-policy.json

# Step 4: Upload built files
echo "📤 Step 4: Uploading frontend files..."
aws s3 sync frontend/build/ s3://$BUCKET_NAME \
  --delete \
  --cache-control "max-age=31536000" \
  --exclude "*.html" \
  --exclude "service-worker.js"

# Upload HTML files with no cache
aws s3 sync frontend/build/ s3://$BUCKET_NAME \
  --delete \
  --cache-control "no-cache" \
  --include "*.html" \
  --include "service-worker.js"

# Step 5: Create CloudFront distribution
echo "☁️  Step 5: Creating CloudFront distribution..."
DISTRIBUTION_CONFIG=$(cat << EOF
{
  "CallerReference": "resume-optimizer-$(date +%s)",
  "Comment": "Resume Optimizer Frontend Distribution",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-$BUCKET_NAME",
        "DomainName": "$BUCKET_NAME.s3-website-$REGION.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-$BUCKET_NAME",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "Compress": true
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}
EOF
)

echo "$DISTRIBUTION_CONFIG" > distribution-config.json

DISTRIBUTION_ID=$(aws cloudfront create-distribution \
  --distribution-config file://distribution-config.json \
  --query 'Distribution.Id' \
  --output text)

rm distribution-config.json

# Get distribution domain name
DOMAIN_NAME=$(aws cloudfront get-distribution \
  --id $DISTRIBUTION_ID \
  --query 'Distribution.DomainName' \
  --output text)

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Deployment Details:"
echo "   S3 Bucket: $BUCKET_NAME"
echo "   S3 Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo "   CloudFront Distribution ID: $DISTRIBUTION_ID"
echo "   CloudFront URL: https://$DOMAIN_NAME"
echo ""
echo "⏳ Note: CloudFront distribution may take 15-20 minutes to fully deploy"
echo "🌐 Your app will be available at: https://$DOMAIN_NAME"
