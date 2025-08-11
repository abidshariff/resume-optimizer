#!/bin/bash

# Create Lambda layer for dependencies (run once)
LAYER_NAME="resume-optimizer-dependencies"
REGION="us-east-1"

# Create layer directory
mkdir -p layer/python

# Install dependencies to layer
pip install -r backend/lambda-functions/ai-handler/requirements.txt -t layer/python/

# Create layer zip
cd layer && zip -r ../dependencies-layer.zip . && cd ..

# Upload layer to AWS
aws lambda publish-layer-version \
    --layer-name $LAYER_NAME \
    --zip-file fileb://dependencies-layer.zip \
    --compatible-runtimes python3.9 python3.10 python3.11 \
    --region $REGION

echo "Layer created. Update your Lambda function to use this layer."
