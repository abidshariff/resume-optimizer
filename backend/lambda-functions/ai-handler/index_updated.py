# Updated DeepSeek configuration and implementation
# Replace the AI_MODELS configuration and the call_ai_with_fallback function

# AI Model Configuration - Models are tried in order of preference
AI_MODELS = [
    {
        'id': 'us.deepseek.r1-v1:0',
        'name': 'DeepSeek R1',
        'max_tokens': 4000,
        'cost_tier': 1,
        'cost_per_1m_input': 0.55,
        'cost_per_1m_output': 2.19,
        'description': 'Primary model - DeepSeek R1 for advanced reasoning and resume optimization',
        'is_bedrock': True
    },
    {
        'id': 'anthropic.claude-3-5-haiku-20241022-v1:0',
        'name': 'Claude 3.5 Haiku',
        'max_tokens': 4000,
        'cost_tier': 2,
        'cost_per_1m_input': 1.00,
        'cost_per_1m_output': 5.00,
        'description': 'Fallback model - Fast and efficient for resume optimization',
        'is_bedrock': True
    }
]

def call_ai_with_fallback(prompt, max_retries=3):
    """
    Call AI models with automatic fallback.
    Uses DeepSeek R1 via AWS Bedrock first, then Claude models.
    """
    
    for model_index, model in enumerate(AI_MODELS):
        for attempt in range(max_retries):
            try:
                print(f"\\n🤖 Attempting model {model_index + 1}/{len(AI_MODELS)}: {model['name']} (attempt {attempt + 1}/{max_retries})")
                print(f"  Model ID: {model['id']}")
                print(f"  Cost Tier: {model['cost_tier']} - ${model['cost_per_1m_input']:.2f}/${model['cost_per_1m_output']:.2f} per 1M tokens")
                print(f"  Description: {model['description']}")
                
                # All models now use AWS Bedrock
                if model['id'] == 'us.deepseek.r1-v1:0':
                    # DeepSeek R1 via Bedrock
                    formatted_prompt = f"""
<｜begin▁of▁sentence｜><｜User｜>{prompt}<｜Assistant｜><think>
"""
                    
                    request_body = {
                        "prompt": formatted_prompt,
                        "max_tokens": model['max_tokens'],
                        "temperature": 0.5,
                        "top_p": 0.9
                    }
                    
                    response = bedrock_runtime.invoke_model(
                        modelId=model['id'],
                        body=json.dumps(request_body)
                    )
                    
                    response_data = json.loads(response['body'].read())
                    optimized_resume = response_data['choices'][0]['text']
                    
                else:
                    # Anthropic models via Bedrock
                    request_body = {
                        "anthropic_version": "bedrock-2023-05-31",
                        "max_tokens": model['max_tokens'],
                        "temperature": 0.5,
                        "system": "You are an expert ATS resume optimizer that preserves document formatting.",
                        "messages": [
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ]
                    }
                    
                    response = bedrock_runtime.invoke_model(
                        modelId=model['id'],
                        body=json.dumps(request_body)
                    )
                    
                    response_data = json.loads(response['body'].read())
                    optimized_resume = response_data['content'][0]['text']
                
                print(f"   -> ✅ Success with {model['name']}")
                return optimized_resume, model
                
            except Exception as e:
                print(f"   -> ❌ Error with {model['name']} (attempt {attempt + 1}): {str(e)}")
                if attempt == max_retries - 1:
                    print(f"   -> 🚫 Max retries reached for {model['name']}, trying next model...")
                else:
                    print(f"   -> 🔄 Retrying {model['name']} in 2 seconds...")
                    time.sleep(2)
    
    raise Exception("All AI models failed after maximum retries")
