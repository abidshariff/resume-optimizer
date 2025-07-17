#!/bin/bash

# Variables
BUCKET_NAME="resume-optimizer-frontend-$(aws sts get-caller-identity --query Account --output text)"
REGION="us-east-1"
PROFILE="resume-optimizer-poc"

# Create S3 bucket
echo "Creating S3 bucket for frontend hosting..."
aws s3 mb s3://$BUCKET_NAME --region $REGION --profile $PROFILE

# Configure bucket for website hosting
echo "Configuring bucket for website hosting..."
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html \
  --profile $PROFILE

# Set bucket policy for public access
echo "Setting bucket policy for public access..."
cat > /tmp/bucket-policy.json << EOF
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
  --policy file:///tmp/bucket-policy.json \
  --profile $PROFILE

# Upload website files
echo "Uploading website files..."
aws s3 sync frontend/build/ s3://$BUCKET_NAME \
  --profile $PROFILE

# Create CloudFront distribution
echo "Creating CloudFront distribution..."
DISTRIBUTION_ID=$(aws cloudfront create-distribution \
  --origin-domain-name $BUCKET_NAME.s3.amazonaws.com \
  --default-root-object index.html \
  --profile $PROFILE \
  --query "Distribution.Id" \
  --output text)

# Create CloudFront invalidation to ensure fresh content
echo "Creating CloudFront invalidation..."
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  --profile $PROFILE

echo "Frontend deployment complete!"
echo "S3 website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo "CloudFront URL will be available soon. Check the AWS Console for the distribution domain name."
