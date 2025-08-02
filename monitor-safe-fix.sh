#!/bin/bash

# Monitor the safe routing fix deployment
APP_ID="d1imtrstzgjc66"
JOB_ID="32"

echo "🔍 Monitoring safe routing fix deployment..."
echo "App ID: $APP_ID"
echo "Job ID: $JOB_ID"
echo "Console: https://console.aws.amazon.com/amplify/home#/$APP_ID/main/$JOB_ID"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[MONITOR]${NC} $1"
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

# Check deployment status
check_status() {
    STATUS=$(aws amplify get-job --app-id "$APP_ID" --branch-name "main" --job-id "$JOB_ID" --query 'job.summary.status' --output text 2>/dev/null)
    echo "$STATUS"
}

# Monitor deployment
while true; do
    STATUS=$(check_status)
    
    if [ "$STATUS" = "SUCCEED" ]; then
        print_success "Safe routing fix deployed successfully!"
        echo ""
        echo "🎉 Deployment completed!"
        echo ""
        echo "✅ What was deployed:"
        echo "   - Enhanced _redirects file with explicit rules"
        echo "   - 200.html backup file for additional routing support"
        echo "   - No changes to main site functionality"
        echo ""
        echo "🧪 Test the fix:"
        echo "1. Go to: https://jobtailorai.com/app/upload"
        echo "2. Refresh the page (Ctrl+R or Cmd+R)"
        echo "3. It should load normally instead of showing 404"
        echo ""
        echo "🔍 If it still shows 404:"
        echo "- Clear browser cache or try incognito mode"
        echo "- Wait 2-3 minutes for CDN propagation"
        echo "- The main site should still work normally"
        echo ""
        break
    elif [ "$STATUS" = "FAILED" ]; then
        print_error "Deployment failed!"
        echo ""
        echo "❌ The safe routing fix deployment failed."
        echo "Check the console for details:"
        echo "https://console.aws.amazon.com/amplify/home#/$APP_ID/main/$JOB_ID"
        echo ""
        echo "Don't worry - your main site should still be working"
        echo "since this was a minimal change."
        break
    elif [ "$STATUS" = "RUNNING" ]; then
        print_status "Deployment in progress... ($(date '+%H:%M:%S'))"
    else
        print_status "Status: $STATUS ($(date '+%H:%M:%S'))"
    fi
    
    sleep 15
done
