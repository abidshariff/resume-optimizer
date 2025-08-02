#!/bin/bash

# Emergency Recovery Script
# This script reverts all routing changes and restores the working state

set -e

echo "🚨 EMERGENCY RECOVERY: Reverting all routing changes..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[RECOVERY]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Step 1: Revert local files to working state
print_status "Reverting local files to working state..."

# Revert amplify.yml to basic working configuration
cat > amplify.yml << 'EOF'
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/build
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
EOF

# Revert _redirects to basic working configuration
echo "/*    /index.html   200" > frontend/public/_redirects

print_success "Local files reverted to working state"

# Step 2: Remove custom rules from Amplify app
print_status "Removing custom rules from Amplify app..."

aws amplify update-app \
    --app-id "d1imtrstzgjc66" \
    --custom-rules "[]" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_success "Custom rules removed from Amplify app"
else
    print_warning "Could not remove custom rules (may already be removed)"
fi

# Step 3: Check rollback deployment status
print_status "Checking rollback deployment status..."

STATUS=$(aws amplify get-job --app-id "d1imtrstzgjc66" --branch-name "main" --job-id "31" --query 'job.summary.status' --output text 2>/dev/null)

if [ "$STATUS" = "SUCCEED" ]; then
    print_success "Rollback deployment completed successfully!"
elif [ "$STATUS" = "RUNNING" ]; then
    print_status "Rollback deployment still in progress..."
    print_status "Monitor at: https://console.aws.amazon.com/amplify/home#/d1imtrstzgjc66/main/31"
elif [ "$STATUS" = "FAILED" ]; then
    print_error "Rollback deployment failed!"
    print_status "Check console: https://console.aws.amazon.com/amplify/home#/d1imtrstzgjc66/main/31"
else
    print_status "Rollback status: $STATUS"
fi

# Step 4: Commit the recovery changes
print_status "Committing recovery changes..."

git add amplify.yml frontend/public/_redirects
git commit -m "Emergency recovery: Revert all routing changes to working state

- Reverted amplify.yml to basic working configuration
- Reverted _redirects to simple working rule
- Removed custom Amplify rules via AWS CLI
- This should restore the main website functionality"

print_success "Recovery changes committed"

# Step 5: Push recovery changes
print_status "Pushing recovery changes to trigger new deployment..."

git push origin main

if [ $? -eq 0 ]; then
    print_success "Recovery changes pushed successfully!"
    print_status "New deployment will start automatically"
else
    print_error "Failed to push recovery changes"
    exit 1
fi

echo ""
print_success "🎉 EMERGENCY RECOVERY COMPLETED!"
echo ""
echo "What was done:"
echo "✅ Reverted amplify.yml to basic working configuration"
echo "✅ Reverted _redirects to simple working rule"
echo "✅ Removed problematic custom Amplify rules"
echo "✅ Committed and pushed recovery changes"
echo ""
echo "Next steps:"
echo "1. Wait for the new deployment to complete (2-5 minutes)"
echo "2. Test the main website: https://jobtailorai.com"
echo "3. Verify it loads normally"
echo ""
echo "The original routing issue (/app/upload refresh) will still exist,"
echo "but the main website should be working again."
echo ""
echo "Monitor deployment at:"
echo "https://console.aws.amazon.com/amplify/home#/d1imtrstzgjc66"
