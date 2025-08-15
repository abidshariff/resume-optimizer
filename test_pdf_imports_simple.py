#!/usr/bin/env python3
"""
Simple test to check if PDF imports are working in Lambda
"""

import json
import boto3

def test_pdf_imports():
    """Test Lambda function with a simple import test"""
    
    # Create Lambda client
    lambda_client = boto3.client('lambda', region_name='us-east-1')
    
    # Simple test payload that should trigger import testing
    test_payload = {
        "test_imports": True,  # Special flag to test imports only
        "userId": "test-user",
        "jobId": "import-test",
        "resumeKey": "test.txt",
        "statusKey": "status.json"
    }
    
    try:
        print("🧪 Testing Lambda PDF imports...")
        
        # Invoke the Lambda function
        response = lambda_client.invoke(
            FunctionName='ResumeOptimizerAIHandler-prod',
            Payload=json.dumps(test_payload)
        )
        
        # Parse response
        response_payload = json.loads(response['Payload'].read())
        
        print("📋 Lambda Response:")
        print(json.dumps(response_payload, indent=2))
        
        # Check if we got an error about imports
        if 'error' in response_payload:
            error_msg = response_payload['error']
            if 'import' in error_msg.lower() or 'pil' in error_msg.lower() or 'reportlab' in error_msg.lower():
                print("❌ Import error detected!")
                return False
            else:
                print("✅ No import errors detected (got different error as expected)")
                return True
        else:
            print("✅ No errors - imports likely working!")
            return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_pdf_imports()
    if success:
        print("\n🎉 PDF imports appear to be working!")
    else:
        print("\n💥 PDF import issues detected!")