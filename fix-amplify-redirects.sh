#!/bin/bash

# Fix Amplify redirects via AWS CLI
# This script directly configures redirects in your Amplify app

set -e

echo "🔧 Configuring AWS Amplify redirects directly..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

print_status "Looking for your Amplify app..."

# Find the Amplify app ID for jobtailorai.com
APP_ID=$(aws amplify list-apps --query 'apps[?contains(defaultDomain, `jobtailorai`) || contains(name, `jobtailorai`)].appId' --output text 2>/dev/null || echo "")

if [ -z "$APP_ID" ]; then
    print_error "Could not find Amplify app for jobtailorai.com"
    print_status "Available apps:"
    aws amplify list-apps --query 'apps[].{Name:name,Domain:defaultDomain,AppId:appId}' --output table
    echo ""
    read -p "Please enter your Amplify App ID: " APP_ID
fi

print_success "Found Amplify App ID: $APP_ID"

# Get current app configuration
print_status "Getting current app configuration..."
aws amplify get-app --app-id "$APP_ID" > /tmp/amplify-app.json

# Update the app with custom rules for redirects
print_status "Configuring custom redirect rules..."

# Create the redirect rules JSON
cat > /tmp/redirect-rules.json << 'EOF'
[
    {
        "source": "/<*>",
        "target": "/index.html",
        "status": "200"
    }
]
EOF

# Apply the redirect rules
print_status "Applying redirect rules to Amplify app..."

aws amplify update-app \
    --app-id "$APP_ID" \
    --custom-rules file:///tmp/redirect-rules.json

if [ $? -eq 0 ]; then
    print_success "Redirect rules applied successfully!"
else
    print_error "Failed to apply redirect rules"
    exit 1
fi

# Trigger a new deployment
print_status "Triggering new deployment..."

# Get the main branch name
BRANCH_NAME=$(aws amplify list-branches --app-id "$APP_ID" --query 'branches[0].branchName' --output text)

print_status "Triggering deployment for branch: $BRANCH_NAME"

JOB_ID=$(aws amplify start-job \
    --app-id "$APP_ID" \
    --branch-name "$BRANCH_NAME" \
    --job-type RELEASE \
    --query 'jobSummary.jobId' \
    --output text)

print_success "Deployment started with Job ID: $JOB_ID"

print_status "You can monitor the deployment at:"
echo "https://console.aws.amazon.com/amplify/home#/$APP_ID/$BRANCH_NAME/$JOB_ID"

print_status "Deployment typically takes 2-5 minutes."
print_status "After deployment completes, test by refreshing https://jobtailorai.com/app/upload"

# Clean up temp files
rm -f /tmp/amplify-app.json /tmp/redirect-rules.json

print_success "Amplify redirect configuration completed!"
