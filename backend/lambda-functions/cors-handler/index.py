import json

def lambda_handler(event, context):
    # Get the origin from the request headers
    origin = None
    if 'headers' in event:
        origin = event['headers'].get('Origin') or event['headers'].get('origin')
    
    # List of allowed origins
    allowed_origins = [
        'https://main.d3tjpmlvy19b2l.amplifyapp.com',
        'https://jobtailorai.com',
        'http://localhost:3000'
    ]
    
    # Determine which origin to return
    if origin and origin in allowed_origins:
        cors_origin = origin
    else:
        cors_origin = '*'  # Fallback for development
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': cors_origin,
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
            'Access-Control-Allow-Credentials': 'true'
        },
        'body': json.dumps({})
    }
