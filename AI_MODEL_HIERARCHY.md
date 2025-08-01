# AI Model Hierarchy - Cost-Optimized Resume Optimization

## Overview

Your resume optimizer now uses a **cost-optimized AI model hierarchy** that automatically tries models from most expensive to least expensive, ensuring the best balance between quality and cost. The system will use the most capable model available while falling back to more economical options if needed.

## 🏗️ Model Hierarchy (Cost Order)

### Tier 1: Premium Performance
**Amazon Nova Pro** (`amazon.nova-pro-v1:0`)
- **Cost**: $2.00/$8.00 per 1M tokens (input/output)
- **Capabilities**: Text, Image, Video processing
- **Use Case**: Complex resumes requiring advanced multimodal analysis
- **When Used**: First attempt for all requests

### Tier 2: Excellent Value
**Claude 3 Haiku** (`anthropic.claude-3-haiku-20240307-v1:0`)
- **Cost**: $0.25/$1.25 per 1M tokens
- **Capabilities**: Text, Image processing
- **Use Case**: Standard resume optimization with high quality
- **When Used**: Fallback from Nova Pro

### Tier 3: Balanced Performance
**Amazon Nova Lite** (`amazon.nova-lite-v1:0`)
- **Cost**: $0.60/$2.40 per 1M tokens
- **Capabilities**: Text, Image, Video processing
- **Use Case**: Multimodal processing at moderate cost
- **When Used**: Third-tier fallback

### Tier 4: Cost-Effective Text
**Llama 3.2 3B Instruct** (`meta.llama3-2-3b-instruct-v1:0`)
- **Cost**: $0.60/$0.60 per 1M tokens
- **Capabilities**: Text-only processing
- **Use Case**: Text-only resume optimization with good quality
- **When Used**: Fourth-tier fallback

### Tier 5: Primary Economical (⭐ PRIMARY)
**Amazon Titan Text Lite** (`amazon.titan-text-lite-v1`)
- **Cost**: $0.30/$0.40 per 1M tokens
- **Capabilities**: Text processing
- **Use Case**: Primary model for most resume optimizations
- **When Used**: Fifth-tier fallback, designed to handle most requests

### Tier 6: Ultra-Economical
**Amazon Nova Micro** (`amazon.nova-micro-v1:0`)
- **Cost**: $0.35/$1.40 per 1M tokens
- **Capabilities**: Text processing
- **Use Case**: High-volume, cost-sensitive processing
- **When Used**: Sixth-tier fallback

### Tier 7: Backup Option
**Mistral 7B Instruct** (`mistral.mistral-7b-instruct-v0:2`)
- **Cost**: $0.15/$0.20 per 1M tokens
- **Capabilities**: Text processing
- **Use Case**: Final fallback for basic resume optimization
- **When Used**: Last resort fallback

## 💰 Cost Analysis

### Previous vs New System
- **Previous (Claude 3.5 Sonnet)**: ~$18.00 per 1M tokens
- **New Primary (Titan Lite)**: ~$0.70 per 1M tokens
- **Potential Savings**: ~**96% cost reduction**

### Typical Request Costs
For a standard resume optimization (~2,000 input tokens, ~1,500 output tokens):

| Model | Cost per Request | Monthly Cost (1,000 requests) |
|-------|------------------|-------------------------------|
| Nova Pro | ~$0.016 | ~$16.00 |
| Claude Haiku | ~$0.002 | ~$2.00 |
| Nova Lite | ~$0.005 | ~$5.00 |
| Llama 3.2 3B | ~$0.002 | ~$2.00 |
| **Titan Lite** | ~**$0.001** | ~**$1.00** |
| Nova Micro | ~$0.003 | ~$3.00 |
| Mistral 7B | ~$0.0007 | ~$0.70 |

## 🚀 Deployment

### Update Your System
```bash
# Deploy the new model hierarchy
./update-ai-models.sh prod

# For development environment
./update-ai-models.sh dev
```

### Monitor Usage and Costs
```bash
# Check recent usage and costs
./monitor-ai-costs.sh prod

# Check last 48 hours
./monitor-ai-costs.sh prod 48
```

## 📊 Monitoring & Analytics

### CloudWatch Logs
The system logs detailed information about:
- Which model was used for each request
- Cost estimates for each request
- Fallback patterns and failures
- Performance metrics

### Key Metrics to Monitor
1. **Model Usage Distribution**: Which models are being used most
2. **Cost per Request**: Average cost across all requests
3. **Success Rates**: How often each model succeeds
4. **Fallback Frequency**: How often fallbacks occur

### Sample Log Output
```
✅ Successfully used Amazon Nova Pro
Response length: 2,847 characters
Estimated cost: $0.0156 (Input: ~1,950 tokens, Output: ~1,423 tokens)
```

## 🔧 Configuration

### Model Configuration File
The system uses `ai-model-config.json` for easy configuration management:

```json
{
  "model_hierarchy": {
    "models": [
      {
        "id": "amazon.nova-pro-v1:0",
        "enabled": true,
        "tier": 1,
        "cost_per_1m_input": 2.00
      }
    ]
  }
}
```

### Environment Variables
- `MODEL_HIERARCHY`: Set to `cost_optimized`
- `PRIMARY_MODEL`: Set to `amazon.titan-text-lite-v1`
- `FALLBACK_ENABLED`: Set to `true`

## 🎯 Optimization Strategies

### Automatic Fallback Logic
1. **Try Premium Models First**: Start with highest quality
2. **Graceful Degradation**: Fall back on errors or unavailability
3. **Cost-Aware Selection**: Balance quality with cost
4. **Error Recovery**: Comprehensive error handling

### When Models Are Used
- **Nova Pro**: Complex resumes, first attempt
- **Claude Haiku**: Standard optimization, excellent reliability
- **Nova Lite**: Multimodal content processing
- **Llama 3.2**: Text-heavy resumes
- **Titan Lite**: Most common use case (PRIMARY)
- **Nova Micro**: High-volume periods
- **Mistral**: Emergency fallback

## 🚨 Troubleshooting

### Common Issues

#### All Models Failing
```bash
# Check model availability
aws bedrock list-foundation-models --region us-east-1

# Verify permissions
aws iam get-role-policy --role-name ResumeOptimizerLambdaRole --policy-name BedrockAccess
```

#### High Costs
```bash
# Monitor usage patterns
./monitor-ai-costs.sh prod 168  # Last week

# Check for expensive model overuse
aws logs filter-log-events \
  --log-group-name "/aws/lambda/ResumeOptimizerAIHandler-prod" \
  --filter-pattern "Successfully used Amazon Nova Pro"
```

#### Poor Quality Results
- Check if cheaper models are being used too frequently
- Consider adjusting the model hierarchy
- Review prompt optimization for lower-tier models

### Error Codes
- `AccessDeniedException`: Model not enabled in your account
- `ThrottlingException`: Rate limits exceeded
- `ModelNotReadyException`: Model temporarily unavailable
- `ValidationException`: Invalid request format

## 📈 Performance Optimization

### Best Practices
1. **Monitor Daily**: Check usage patterns and costs
2. **Adjust Hierarchy**: Based on success rates and quality
3. **Optimize Prompts**: Ensure they work well with cheaper models
4. **Set Budgets**: Use AWS Cost Explorer for budget alerts

### Quality Assurance
- The system preserves all original resume content
- Each model uses optimized prompts for its capabilities
- Fallback ensures high availability
- Cost estimation helps with budget planning

## 🔄 Future Enhancements

### Planned Features
1. **Dynamic Model Selection**: Based on resume complexity
2. **Cost-Based Routing**: Automatic budget management
3. **A/B Testing**: Compare model performance
4. **Custom Model Training**: Fine-tuned models for specific use cases

### Configuration Updates
The model hierarchy can be easily updated by:
1. Modifying `ai-model-config.json`
2. Running `./update-ai-models.sh`
3. Monitoring the results with `./monitor-ai-costs.sh`

## 📞 Support

### Getting Help
1. **Check Logs**: Use CloudWatch or the monitoring script
2. **Review Costs**: Use AWS Cost Explorer
3. **Test Models**: Use the AWS CLI to test individual models
4. **Update Configuration**: Modify the model hierarchy as needed

### Useful Commands
```bash
# Test a specific model
aws bedrock invoke-model \
  --model-id amazon.titan-text-lite-v1 \
  --body '{"inputText":"Test prompt"}' \
  output.json

# Check function configuration
aws lambda get-function-configuration \
  --function-name ResumeOptimizerAIHandler-prod

# View recent logs
aws logs tail /aws/lambda/ResumeOptimizerAIHandler-prod --follow
```

---

**🎉 Your resume optimizer is now cost-optimized and ready to deliver high-quality results at a fraction of the previous cost!**
