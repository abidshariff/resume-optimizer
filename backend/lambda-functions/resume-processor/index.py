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
    'Access-Control-Allow-Origin': 'https://main.d3tjpmlvy19b2l.amplifyapp.com',
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
    
    # Handle GET request - check if it's for download or status
    if event.get('httpMethod') == 'GET':
        path = event.get('path', '')
        if '/download' in path:
            print("Handling GET request for file download")
            return handle_download_request(event)
        else:
            print("Handling GET request for status checking")
            return handle_status_request(event)
    
    # Handle POST request for job submission
    if event.get('httpMethod') == 'POST':
        print("Handling POST request for job submission")
        return handle_job_submission(event)
    
    # If we get here, it's an unsupported method
    return {
        'statusCode': 405,
        'headers': CORS_HEADERS,
        'body': json.dumps({
            'message': 'Method not allowed'
        })
    }

def handle_download_request(event):
    """Handle GET requests for file download"""
    try:
        # Get user ID from Cognito authorizer
        user_id = "anonymous"
        if 'requestContext' in event and 'authorizer' in event['requestContext']:
            if 'claims' in event['requestContext']['authorizer']:
                user_id = event['requestContext']['authorizer']['claims'].get('sub', 'anonymous')
        
        # Get job ID from query parameters
        job_id = None
        if 'queryStringParameters' in event and event['queryStringParameters']:
            job_id = event['queryStringParameters'].get('jobId')
        
        if not job_id:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({
                    'message': 'Job ID is required'
                })
            }
        
        # First check if the job is completed
        status_key = f"users/{user_id}/status/{job_id}/status.json"
        
        try:
            response = s3.get_object(Bucket=bucket_name, Key=status_key)
            status_data = json.loads(response['Body'].read().decode('utf-8'))
            
            if status_data.get('status') != 'COMPLETED':
                return {
                    'statusCode': 400,
                    'headers': CORS_HEADERS,
                    'body': json.dumps({
                        'message': 'Job is not completed yet'
                    })
                }
                
        except Exception as e:
            return {
                'statusCode': 404,
                'headers': CORS_HEADERS,
                'body': json.dumps({
                    'message': 'Job not found'
                })
            }
        
        # Get the optimized resume file
        optimized_key = f"users/{user_id}/optimized/{job_id}/resume.docx"
        
        try:
            # Get the file from S3
            file_response = s3.get_object(Bucket=bucket_name, Key=optimized_key)
            file_content = file_response['Body'].read()
            
            # Get content type from status data or default
            content_type = status_data.get('contentType', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
            download_filename = status_data.get('downloadFilename', f'optimized_resume_{job_id[:8]}.docx')
            
            # For binary files, we need to base64 encode for API Gateway
            # but ensure we're handling it correctly
            file_base64 = base64.b64encode(file_content).decode('utf-8')
            
            print(f"File size: {len(file_content)} bytes")
            print(f"Base64 size: {len(file_base64)} characters")
            print(f"Content type: {content_type}")
            print(f"Download filename: {download_filename}")
            
            return {
                'statusCode': 200,
                'headers': {
                    **CORS_HEADERS,
                    'Content-Type': content_type,
                    'Content-Disposition': f'attachment; filename="{download_filename}"',
                    'Content-Length': str(len(file_content))
                },
                'body': file_base64,
                'isBase64Encoded': True
            }
            
        except Exception as e:
            error_str = str(e)
            if 'NoSuchKey' in error_str or 'Not Found' in error_str or '404' in error_str:
                return {
                    'statusCode': 404,
                    'headers': CORS_HEADERS,
                    'body': json.dumps({
                        'message': 'Optimized resume file not found'
                    })
                }
            else:
                print(f"Error downloading file: {error_str}")
                return {
                    'statusCode': 500,
                    'headers': CORS_HEADERS,
                    'body': json.dumps({
                        'message': 'Error downloading file'
                    })
                }
                
    except Exception as e:
        print(f"Error in download handler: {str(e)}")
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'message': 'Internal server error'
            })
        }

def handle_status_request(event):
    """Handle GET requests for job status"""
    try:
        # Get user ID from Cognito authorizer
        user_id = "anonymous"
        if 'requestContext' in event and 'authorizer' in event['requestContext']:
            if 'claims' in event['requestContext']['authorizer']:
                user_id = event['requestContext']['authorizer']['claims'].get('sub', 'anonymous')
        
        # Get job ID from query parameters
        job_id = None
        if 'queryStringParameters' in event and event['queryStringParameters']:
            job_id = event['queryStringParameters'].get('jobId')
        
        if not job_id:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({
                    'message': 'Job ID is required'
                })
            }
        
        # Get status from S3
        status_key = f"users/{user_id}/status/{job_id}/status.json"
        
        try:
            response = s3.get_object(Bucket=bucket_name, Key=status_key)
            status_data = json.loads(response['Body'].read().decode('utf-8'))
            
            return {
                'statusCode': 200,
                'headers': CORS_HEADERS,
                'body': json.dumps(status_data)
            }
            
        except Exception as e:
            error_str = str(e)
            # Handle specific S3 exceptions
            if 'NoSuchKey' in error_str or 'Not Found' in error_str or '404' in error_str:
                return {
                    'statusCode': 404,
                    'headers': CORS_HEADERS,
                    'body': json.dumps({
                        'message': 'Job not found'
                    })
                }
            else:
                # Log the actual error for debugging but return generic message
                print(f"S3 error for status check: {error_str}")
                return {
                    'statusCode': 500,
                    'headers': CORS_HEADERS,
                    'body': json.dumps({
                        'message': 'Error retrieving job status'
                    })
                }
            
    except Exception as e:
        print(f"Error checking job status: {str(e)}")
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'message': f'Error checking job status: {str(e)}'
            })
        }

def handle_job_submission(event):
    """Handle POST requests for job submission"""
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
        
        # Generate unique job ID
        job_id = str(uuid.uuid4())
        
        # Decode the base64 resume content
        try:
            # Handle data URL format (data:type;base64,content)
            if resume_content_base64.startswith('data:'):
                # Extract the base64 content after the comma
                base64_content = resume_content_base64.split(',')[1]
            else:
                base64_content = resume_content_base64
            
            resume_content = base64.b64decode(base64_content)
        except Exception as e:
            print(f"Error decoding resume content: {str(e)}")
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({
                    'message': 'Invalid resume content encoding'
                })
            }
        
        # Store files in S3
        resume_key = f"users/{user_id}/original/{job_id}/resume.pdf"
        job_desc_key = f"users/{user_id}/original/{job_id}/job_description.txt"
        
        # Upload resume file to S3
        s3.put_object(
            Bucket=bucket_name,
            Key=resume_key,
            Body=resume_content,
            ContentType='application/pdf'
        )
        
        # Upload job description to S3
        s3.put_object(
            Bucket=bucket_name,
            Key=job_desc_key,
            Body=job_description.encode('utf-8'),
            ContentType='text/plain'
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
        
        # Prepare payload for AI handler
        ai_payload = {
            'userId': user_id,
            'jobId': job_id,
            'resumeKey': resume_key,
            'jobDescriptionKey': job_desc_key,
            'statusKey': status_key,
            'outputFormat': output_format
        }
        
        # Invoke AI handler Lambda asynchronously
        lambda_client.invoke(
            FunctionName=ai_handler_function,
            InvocationType='Event',  # Asynchronous invocation
            Payload=json.dumps(ai_payload)
        )
        
        print(f"Invoked AI handler for job {job_id}")
        
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
                'message': f'Internal server error: {str(e)}'
            })
        }
