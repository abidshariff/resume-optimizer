import json
import boto3
import os
import uuid
import base64

s3 = boto3.client('s3')
lambda_client = boto3.client('lambda')
bucket_name = os.environ.get('STORAGE_BUCKET')
ai_handler_function = os.environ.get('AI_HANDLER_FUNCTION')

# CORS headers for all responses
CORS_HEADERS = {
    'Access-Control-Allow-Origin': 'https://main.d16ci5rhuvcide.amplifyapp.com',  # Specific domain for your Amplify app
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
    'Access-Control-Allow-Credentials': 'true'
}

def lambda_handler(event, context):
    # Handle preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({})
        }
    
    try:
        print("Received event:", json.dumps(event))
        
        # Parse the request body
        if 'body' in event:
            body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        else:
            body = event
        
        # Extract data from the request
        resume_content_base64 = body.get('resume')
        job_description = body.get('jobDescription')
        
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
        
        # Call AI Handler Lambda
        ai_payload = {
            'userId': user_id,
            'jobId': job_id,
            'resumeKey': resume_key,
            'jobDescriptionKey': job_desc_key
        }
        
        print(f"Invoking AI Handler Lambda: {ai_handler_function}")
        ai_response = lambda_client.invoke(
            FunctionName=ai_handler_function,
            InvocationType='RequestResponse',
            Payload=json.dumps(ai_payload)
        )
        
        ai_result = json.loads(ai_response['Payload'].read().decode())
        print(f"AI Handler response: {json.dumps(ai_result)}")
        
        # Check if AI handler returned an error
        if 'error' in ai_result:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({
                    'message': ai_result['error'],
                    'jobId': job_id
                })
            }
        
        # Default file type if not provided by AI handler
        default_file_type = 'txt'
        
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'message': 'Resume optimization complete',
                'optimizedResumeUrl': ai_result.get('optimizedResumeUrl'),
                'jobId': job_id,
                'fileType': ai_result.get('fileType', default_file_type),
                'contentType': ai_result.get('contentType', 'text/plain'),
                'downloadFilename': ai_result.get('downloadFilename', f"optimized_resume.{default_file_type}")
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
