#!/bin/bash

# Create a directory for the packages
mkdir -p /Volumes/workplace/resume-optimizer/backend/lambda-functions/ai-handler/package

# Install the required packages
pip install python-docx -t /Volumes/workplace/resume-optimizer/backend/lambda-functions/ai-handler/package

# Create a zip file with the packages
cd /Volumes/workplace/resume-optimizer/backend/lambda-functions/ai-handler/package
zip -r ../lambda_layer.zip .

echo "Lambda layer created at /Volumes/workplace/resume-optimizer/backend/lambda-functions/ai-handler/lambda_layer.zip"
