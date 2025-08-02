#!/bin/bash

# Monitor Amplify deployment completion
APP_ID="d1imtrstzgjc66"
JOB_ID="30"

echo "🔍 Monitoring Amplify deployment..."
echo "App ID: $APP_ID"
echo "Job ID: $JOB_ID"
echo "URL: https://console.aws.amazon.com/amplify/home#/$APP_ID/main/$JOB_ID"
echo ""

while true; do
    STATUS=$(aws amplify get-job --app-id "$APP_ID" --branch-name "main" --job-id "$JOB_ID" --query 'job.summary.status' --output text 2>/dev/null)
    
    if [ "$STATUS" = "SUCCEED" ]; then
        echo "✅ Deployment completed successfully!"
        echo ""
        echo "🎉 Your routing fix is now live!"
        echo "Test it by visiting: https://jobtailorai.com/app/upload"
        echo "Refresh the page - it should no longer show a white screen."
        break
    elif [ "$STATUS" = "FAILED" ]; then
        echo "❌ Deployment failed!"
        echo "Check the Amplify console for details:"
        echo "https://console.aws.amazon.com/amplify/home#/$APP_ID/main/$JOB_ID"
        break
    elif [ "$STATUS" = "RUNNING" ]; then
        echo "⏳ Deployment still running... ($(date '+%H:%M:%S'))"
    else
        echo "📊 Status: $STATUS ($(date '+%H:%M:%S'))"
    fi
    
    sleep 30
done
