import json
import boto3
import os

s3 = boto3.client('s3')
bucket_name = os.environ.get('STORAGE_BUCKET')

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
        # Extract job ID from path parameters
        path_parameters = event.get('pathParameters', {})
        if not path_parameters or 'jobId' not in path_parameters:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({
                    'message': 'Job ID is required'
                })
            }
        
        job_id = path_parameters['jobId']
        
        # Get user ID from Cognito authorizer if available
        user_id = "anonymous"
        if 'requestContext' in event and 'authorizer' in event['requestContext']:
            if 'claims' in event['requestContext']['authorizer']:
                user_id = event['requestContext']['authorizer']['claims'].get('sub', 'anonymous')
        
        # Check if the optimized resume exists
        expected_output_key = f"users/{user_id}/optimized/{job_id}/resume.txt"
        
        try:
            # Check if the file exists
            s3.head_object(Bucket=bucket_name, Key=expected_output_key)
            
            # File exists, generate a pre-signed URL
            optimized_url = s3.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': bucket_name,
                    'Key': expected_output_key,
                    'ResponseContentType': 'text/plain',
                    'ResponseContentDisposition': f"attachment; filename*=UTF-8''optimized_resume.txt"
                },
                ExpiresIn=3600  # URL valid for 1 hour
            )
            
            return {
                'statusCode': 200,
                'headers': CORS_HEADERS,
                'body': json.dumps({
                    'status': 'completed',
                    'message': 'Resume optimization complete',
                    'optimizedResumeUrl': optimized_url,
                    'jobId': job_id,
                    'fileType': 'txt',
                    'contentType': 'text/plain',
                    'downloadFilename': f"optimized_resume_{job_id[:8]}.txt"
                })
            }
        except s3.exceptions.ClientError as e:
            if e.response['Error']['Code'] == '404':
                # File doesn't exist yet, still processing
                return {
                    'statusCode': 200,
                    'headers': CORS_HEADERS,
                    'body': json.dumps({
                        'status': 'processing',
                        'message': 'Resume optimization in progress',
                        'jobId': job_id
                    })
                }
            else:
                # Some other error
                raise
    
    except Exception as e:
        print(f"Error checking status: {str(e)}")
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'message': f'Error checking status: {str(e)}'
            })
        }
