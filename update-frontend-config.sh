#!/bin/bash

# Update the frontend configuration to use the new HTTP API endpoint
echo "Updating frontend configuration to use the new HTTP API endpoint..."

# Find the API endpoint configuration in the frontend code
CONFIG_FILE=$(find /Volumes/workplace/resume-optimizer/frontend/src -type f -name "*.js" -exec grep -l "REACT_APP_API_ENDPOINT" {} \;)

if [ -z "$CONFIG_FILE" ]; then
  echo "Could not find API endpoint configuration in frontend code."
  exit 1
fi

echo "Found API endpoint configuration in $CONFIG_FILE"

# Update the API endpoint URL
NEW_API_ENDPOINT="https://9a3usby37i.execute-api.us-east-1.amazonaws.com/dev/optimize"
sed -i '' "s|https://[^/]*/dev/optimize|$NEW_API_ENDPOINT|g" $CONFIG_FILE

echo "Updated API endpoint to $NEW_API_ENDPOINT"
echo "Please rebuild and redeploy the frontend."
