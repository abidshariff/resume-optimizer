import json
import boto3
import os
import uuid
import base64
import datetime

s3 = boto3.client('s3')
lambda_client = boto3.client('lambda')
bucket_name = os.environ.get('STORAGE_BUCKET')
ai_handler_function = os.environ.get('AI_HANDLER_FUNCTION')

# CORS headers for all responses
CORS_HEADERS = {
    'Access-Control-Allow-Origin': 'https://main.d16ci5rhuvcide.amplifyapp.com',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
    'Access-Control-Allow-Credentials': 'true'
}

def lambda_handler(event, context):
    # Print the event for debugging
    print("Received event:", json.dumps(event))
    
    # Handle preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS' or event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
        print("Handling OPTIONS request")
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({})
        }
    
    try:
        # Parse the request body
        if 'body' in event:
            # Handle base64-encoded body
            if event.get('isBase64Encoded', False):
                body_str = base64.b64decode(event['body']).decode('utf-8')
                body = json.loads(body_str)
            else:
                body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        else:
            body = event
        
        # Extract data from the request
        resume_content_base64 = body.get('resume')
        job_description = body.get('jobDescription')
        output_format = body.get('outputFormat', 'word')  # Default to Word format now
        
        # Get user ID from Cognito authorizer if available
        user_id = "anonymous"
        if 'requestContext' in event and 'authorizer' in event['requestContext']:
            if 'claims' in event['requestContext']['authorizer']:
                user_id = event['requestContext']['authorizer']['claims'].get('sub', 'anonymous')
        
        # Validate inputs
        if not resume_content_base64:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({
                    'message': 'Resume content is required'
                })
            }
        
        if not job_description:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({
                    'message': 'Job description is required'
                })
            }
        
        # Decode base64 resume content
        try:
            # Remove data URL prefix if present
            if ',' in resume_content_base64:
                resume_content_base64 = resume_content_base64.split(',')[1]
            
            resume_content = base64.b64decode(resume_content_base64)
        except Exception as e:
            print(f"Error decoding resume content: {str(e)}")
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({
                    'message': f'Invalid resume content format: {str(e)}'
                })
            }
        
        # Generate unique IDs for the files
        job_id = str(uuid.uuid4())
        
        # Store original files in S3
        resume_key = f"users/{user_id}/original/{job_id}/resume.pdf"
        job_desc_key = f"users/{user_id}/original/{job_id}/job_description.txt"
        
        s3.put_object(
            Bucket=bucket_name,
            Key=resume_key,
            Body=resume_content
        )
        
        s3.put_object(
            Bucket=bucket_name,
            Key=job_desc_key,
            Body=job_description.encode('utf-8')
        )
        
        print(f"Stored original files in S3: {resume_key} and {job_desc_key}")
        
        # Store initial job status
        status_key = f"users/{user_id}/status/{job_id}/status.json"
        status_data = {
            'status': 'PROCESSING',
            'message': 'Job submitted and processing started',
            'timestamp': datetime.datetime.now().isoformat(),
            'jobId': job_id
        }
        
        s3.put_object(
            Bucket=bucket_name,
            Key=status_key,
            Body=json.dumps(status_data).encode('utf-8'),
            ContentType='application/json'
        )
        
        # Call AI Handler Lambda asynchronously
        ai_payload = {
            'userId': user_id,
            'jobId': job_id,
            'resumeKey': resume_key,
            'jobDescriptionKey': job_desc_key,
            'statusKey': status_key,
            'outputFormat': output_format
        }
        
        print(f"Invoking AI Handler Lambda asynchronously: {ai_handler_function}")
        lambda_client.invoke(
            FunctionName=ai_handler_function,
            InvocationType='Event',  # Asynchronous invocation
            Payload=json.dumps(ai_payload)
        )
        
        # Return job ID immediately
        return {
            'statusCode': 202,  # Accepted
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'message': 'Resume optimization job submitted',
                'jobId': job_id,
                'status': 'PROCESSING'
            })
        }
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'message': f'Error processing request: {str(e)}'
            })
        }
