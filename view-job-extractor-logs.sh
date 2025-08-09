#!/bin/bash

# Script to view Job URL Extractor Lambda function logs
# This will show the detailed logging we added to see all extracted variables

LOG_GROUP="/aws/lambda/ResumeOptimizerJobUrlExtractor-prod"
REGION="us-east-1"

echo "=========================================="
echo "JOB URL EXTRACTOR - CLOUDWATCH LOGS"
echo "=========================================="
echo "Log Group: $LOG_GROUP"
echo "Region: $REGION"
echo "=========================================="

# Check if AWS CLI is available
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI first."
    exit 1
fi

# Check if user wants to follow logs or view recent logs
if [ "$1" = "--follow" ] || [ "$1" = "-f" ]; then
    echo "📡 Following logs in real-time (press Ctrl+C to stop)..."
    echo "Run your test in another terminal to see live logs."
    echo "=========================================="
    aws logs tail "$LOG_GROUP" --follow --region "$REGION"
elif [ "$1" = "--recent" ] || [ "$1" = "-r" ]; then
    echo "📋 Showing recent logs from the last 10 minutes..."
    echo "=========================================="
    aws logs tail "$LOG_GROUP" --since 10m --region "$REGION"
else
    echo "Usage:"
    echo "  $0 --follow    # Follow logs in real-time"
    echo "  $0 --recent    # Show recent logs (last 10 minutes)"
    echo ""
    echo "Examples:"
    echo "  $0 --follow"
    echo "  $0 --recent"
    echo ""
    echo "📋 Showing recent logs from the last 5 minutes by default..."
    echo "=========================================="
    aws logs tail "$LOG_GROUP" --since 5m --region "$REGION"
fi
