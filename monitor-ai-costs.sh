#!/bin/bash

# AI Cost Monitoring Script
# This script helps monitor which AI models are being used and estimates costs

set -e

# Configuration
ENVIRONMENT=${1:-prod}
FUNCTION_NAME="ResumeOptimizerAIHandler-${ENVIRONMENT}"
HOURS_BACK=${2:-24}

echo "📊 AI Model Usage and Cost Analysis"
echo "Environment: $ENVIRONMENT"
echo "Function: $FUNCTION_NAME"
echo "Time Range: Last $HOURS_BACK hours"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Get CloudWatch logs
LOG_GROUP="/aws/lambda/$FUNCTION_NAME"
START_TIME=$(date -u -v-${HOURS_BACK}H +%s)000
END_TIME=$(date -u +%s)000

echo "🔍 Analyzing CloudWatch logs..."

# Check if log group exists
if ! aws logs describe-log-groups --log-group-name-prefix "$LOG_GROUP" --query 'logGroups[0].logGroupName' --output text | grep -q "$LOG_GROUP"; then
    echo "❌ Log group '$LOG_GROUP' not found."
    echo "The function may not have been invoked recently or doesn't exist."
    exit 1
fi

# Create temporary file for log analysis
TEMP_LOG=$(mktemp)

# Get recent logs
echo "📥 Fetching logs from CloudWatch..."
aws logs filter-log-events \
    --log-group-name "$LOG_GROUP" \
    --start-time "$START_TIME" \
    --end-time "$END_TIME" \
    --filter-pattern "Successfully used" \
    --query 'events[*].message' \
    --output text > "$TEMP_LOG" 2>/dev/null || echo "No successful model usage found in logs"

# Also get cost estimation logs
TEMP_COST_LOG=$(mktemp)
aws logs filter-log-events \
    --log-group-name "$LOG_GROUP" \
    --start-time "$START_TIME" \
    --end-time "$END_TIME" \
    --filter-pattern "Estimated cost" \
    --query 'events[*].message' \
    --output text > "$TEMP_COST_LOG" 2>/dev/null || echo "No cost estimation logs found"

# Analyze model usage
echo ""
echo "🤖 Model Usage Summary:"
echo "========================"

if [ -s "$TEMP_LOG" ]; then
    # Count usage by model
    echo "Model Usage Count:"
    grep -o "Successfully used [^[:space:]]*" "$TEMP_LOG" | sed 's/Successfully used //' | sort | uniq -c | sort -nr | while read count model; do
        echo "  $model: $count times"
    done
    
    echo ""
    echo "📈 Usage Pattern:"
    grep -o "Successfully used [^[:space:]]*" "$TEMP_LOG" | sed 's/Successfully used //' | tail -10 | nl -w2 -s'. ' | sed 's/^/  Recent: /'
else
    echo "  No successful model usage found in the last $HOURS_BACK hours"
fi

echo ""
echo "💰 Cost Analysis:"
echo "=================="

if [ -s "$TEMP_COST_LOG" ]; then
    # Extract and sum costs
    total_cost=0
    cost_count=0
    
    echo "Recent Cost Estimates:"
    grep -o "Estimated cost: \$[0-9.]*" "$TEMP_COST_LOG" | tail -10 | while read line; do
        cost=$(echo "$line" | grep -o "[0-9.]*")
        echo "  $line"
    done
    
    # Calculate total estimated cost
    total_cost=$(grep -o "Estimated cost: \$[0-9.]*" "$TEMP_COST_LOG" | grep -o "[0-9.]*" | awk '{sum += $1} END {print sum}')
    cost_count=$(grep -c "Estimated cost:" "$TEMP_COST_LOG")
    
    if [ -n "$total_cost" ] && [ "$cost_count" -gt 0 ]; then
        avg_cost=$(echo "scale=4; $total_cost / $cost_count" | bc -l 2>/dev/null || echo "0")
        echo ""
        echo "Summary:"
        echo "  Total Estimated Cost: \$$(printf "%.4f" "$total_cost")"
        echo "  Number of Requests: $cost_count"
        echo "  Average Cost per Request: \$$(printf "%.4f" "$avg_cost")"
        
        # Project monthly cost
        if [ "$cost_count" -gt 0 ]; then
            hourly_rate=$(echo "scale=6; $total_cost / $HOURS_BACK" | bc -l 2>/dev/null || echo "0")
            daily_projection=$(echo "scale=4; $hourly_rate * 24" | bc -l 2>/dev/null || echo "0")
            monthly_projection=$(echo "scale=2; $daily_projection * 30" | bc -l 2>/dev/null || echo "0")
            
            echo ""
            echo "📊 Cost Projections (based on current usage):"
            echo "  Hourly: \$$(printf "%.4f" "$hourly_rate")"
            echo "  Daily: \$$(printf "%.4f" "$daily_projection")"
            echo "  Monthly: \$$(printf "%.2f" "$monthly_projection")"
        fi
    fi
else
    echo "  No cost estimation data found in the last $HOURS_BACK hours"
fi

# Check for errors and fallbacks
echo ""
echo "🚨 Error Analysis:"
echo "=================="

TEMP_ERROR_LOG=$(mktemp)
aws logs filter-log-events \
    --log-group-name "$LOG_GROUP" \
    --start-time "$START_TIME" \
    --end-time "$END_TIME" \
    --filter-pattern "failed:" \
    --query 'events[*].message' \
    --output text > "$TEMP_ERROR_LOG" 2>/dev/null || echo "No errors found"

if [ -s "$TEMP_ERROR_LOG" ]; then
    echo "Recent Model Failures:"
    grep -o "[^[:space:]]* failed:" "$TEMP_ERROR_LOG" | sort | uniq -c | sort -nr | while read count error; do
        echo "  $error $count times"
    done
    
    echo ""
    echo "Common Error Types:"
    grep -o "failed: [^[:space:]]*" "$TEMP_ERROR_LOG" | sed 's/failed: //' | sort | uniq -c | sort -nr | head -5 | while read count error; do
        echo "  $error: $count occurrences"
    done
else
    echo "  No model failures found in the last $HOURS_BACK hours ✅"
fi

# Model availability check
echo ""
echo "🔧 Model Availability Check:"
echo "============================"

# Test each model's availability (this is a basic check)
models=(
    "amazon.nova-pro-v1:0"
    "anthropic.claude-3-haiku-20240307-v1:0"
    "amazon.nova-lite-v1:0"
    "meta.llama3-2-3b-instruct-v1:0"
    "amazon.titan-text-lite-v1"
    "amazon.nova-micro-v1:0"
    "mistral.mistral-7b-instruct-v0:2"
)

for model in "${models[@]}"; do
    # Try to get model info (this will show if model is accessible)
    if aws bedrock get-foundation-model --model-identifier "$model" > /dev/null 2>&1; then
        echo "  ✅ $model - Available"
    else
        echo "  ❌ $model - Not available or access denied"
    fi
done

# Recommendations
echo ""
echo "💡 Recommendations:"
echo "==================="

if [ -s "$TEMP_LOG" ]; then
    primary_model=$(grep -o "Successfully used [^[:space:]]*" "$TEMP_LOG" | sed 's/Successfully used //' | sort | uniq -c | sort -nr | head -1 | awk '{print $2}')
    echo "  Most used model: $primary_model"
    
    # Check if we're using expensive models frequently
    expensive_usage=$(grep -c "Successfully used Amazon Nova Pro\|Successfully used Claude" "$TEMP_LOG" 2>/dev/null || echo "0")
    total_usage=$(wc -l < "$TEMP_LOG")
    
    if [ "$expensive_usage" -gt 0 ] && [ "$total_usage" -gt 0 ]; then
        expensive_percentage=$(echo "scale=1; $expensive_usage * 100 / $total_usage" | bc -l 2>/dev/null || echo "0")
        echo "  Expensive model usage: $expensive_percentage% of requests"
        
        if [ "$(echo "$expensive_percentage > 50" | bc -l 2>/dev/null)" = "1" ]; then
            echo "  ⚠️  Consider optimizing prompts to work better with cheaper models"
        fi
    fi
fi

echo "  📊 Monitor this dashboard regularly to optimize costs"
echo "  🔄 Consider adjusting model hierarchy based on success rates"
echo "  💰 Review AWS Cost Explorer for detailed billing information"

# Cleanup
rm -f "$TEMP_LOG" "$TEMP_COST_LOG" "$TEMP_ERROR_LOG"

echo ""
echo "📋 For detailed logs, run:"
echo "   aws logs tail $LOG_GROUP --follow"
echo ""
echo "💳 For billing details, check AWS Cost Explorer:"
echo "   https://console.aws.amazon.com/cost-management/home#/cost-explorer"
echo ""
