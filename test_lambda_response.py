#!/usr/bin/env python3

import json

def test_lambda_response():
    """Test the Lambda function response format"""
    
    # Create a test event similar to what API Gateway sends
    test_event = {
        "httpMethod": "POST",
        "body": json.dumps({
            "resume": "data:text/plain;base64,VGVzdCByZXN1bWUgY29udGVudA==",
            "jobDescription": "test",
            "outputFormat": "word"
        }),
        "requestContext": {
            "authorizer": {
                "claims": {
                    "sub": "test-user-id",
                    "email": "test@example.com"
                }
            }
        },
        "headers": {
            "Content-Type": "application/json"
        }
    }
    
    # Simulate the Lambda function logic
    import uuid
    import datetime
    
    job_id = str(uuid.uuid4())
    
    # This is what the Lambda function should return
    lambda_response = {
        'statusCode': 202,
        'headers': {
            'Access-Control-Allow-Origin': 'https://main.d3tjpmlvy19b2l.amplifyapp.com',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
            'Access-Control-Allow-Credentials': 'true'
        },
        'body': json.dumps({
            'message': 'Resume optimization job submitted',
            'jobId': job_id,
            'status': 'PROCESSING'
        })
    }
    
    print("Expected Lambda Response:")
    print(json.dumps(lambda_response, indent=2))
    
    # Test JSON parsing
    try:
        body_data = json.loads(lambda_response['body'])
        print("\nParsed body:")
        print(json.dumps(body_data, indent=2))
        print(f"\nJob ID: {body_data.get('jobId')}")
        print(f"Status: {body_data.get('status')}")
    except Exception as e:
        print(f"Error parsing response body: {e}")

if __name__ == "__main__":
    test_lambda_response()
