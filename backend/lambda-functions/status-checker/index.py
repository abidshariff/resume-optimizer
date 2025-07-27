import json
import boto3
import os

s3 = boto3.client('s3')
bucket_name = os.environ.get('STORAGE_BUCKET')

# CORS headers for all responses
CORS_HEADERS = {
    'Access-Control-Allow-Origin': 'https://main.d3tjpmlvy19b2l.amplifyapp.com',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Accept',
    'Access-Control-Allow-Methods': 'OPTIONS,GET',
    'Access-Control-Allow-Credentials': 'true'
}

def lambda_handler(event, context):
    # Print the event for debugging
    print("Received event:", json.dumps(event))
    
    # Handle preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS' or event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({})
        }
    
    try:
        # Get job ID from query parameters
        query_params = event.get('queryStringParameters', {}) or {}
        job_id = query_params.get('jobId')
        
        if not job_id:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({
                    'message': 'jobId is required'
                })
            }
        
        # Get user ID from Cognito authorizer
        user_id = "anonymous"
        if 'requestContext' in event and 'authorizer' in event['requestContext']:
            if 'claims' in event['requestContext']['authorizer']:
                user_id = event['requestContext']['authorizer']['claims'].get('sub', 'anonymous')
        
        # Get status from S3
        status_key = f"users/{user_id}/status/{job_id}/status.json"
        
        try:
            status_obj = s3.get_object(Bucket=bucket_name, Key=status_key)
            status_data = json.loads(status_obj['Body'].read().decode('utf-8'))
        except s3.exceptions.NoSuchKey:
            return {
                'statusCode': 404,
                'headers': CORS_HEADERS,
                'body': json.dumps({
                    'message': 'Job not found'
                })
            }
        except Exception as e:
            print(f"Error retrieving status from S3: {str(e)}")
            return {
                'statusCode': 500,
                'headers': CORS_HEADERS,
                'body': json.dumps({
                    'message': f'Error retrieving job status: {str(e)}'
                })
            }
        
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps(status_data)
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
