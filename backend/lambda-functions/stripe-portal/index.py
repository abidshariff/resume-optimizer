import json
import os
import boto3
import stripe

# Initialize Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
customers_table = dynamodb.Table(os.environ.get('CUSTOMERS_TABLE', 'resume-optimizer-customers'))

def lambda_handler(event, context):
    """
    Create Stripe Customer Portal Session
    """
    try:
        # Parse request body
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})
        
        # Extract parameters
        customer_id = body.get('customerId')
        return_url = body.get('returnUrl')
        
        # Get user info from JWT token
        user_id = extract_user_id_from_token(event)
        if not user_id:
            return create_response(401, {'error': 'Unauthorized'})
        
        # Validate required parameters
        if not return_url:
            return create_response(400, {'error': 'Return URL is required'})
        
        # Get Stripe customer ID
        stripe_customer_id = get_customer_id(user_id, customer_id)
        if not stripe_customer_id:
            return create_response(404, {'error': 'Customer not found'})
        
        # Create portal session
        portal_session = stripe.billing_portal.Session.create(
            customer=stripe_customer_id,
            return_url=return_url,
        )
        
        return create_response(200, {
            'url': portal_session.url
        })
        
    except stripe.error.StripeError as e:
        print(f"Stripe error: {str(e)}")
        return create_response(400, {'error': f'Payment processing error: {str(e)}'})
    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})

def extract_user_id_from_token(event):
    """
    Extract user ID from JWT token in Authorization header
    """
    try:
        headers = event.get('headers', {})
        auth_header = headers.get('Authorization') or headers.get('authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        # For now, return a mock user ID
        # In production, decode and validate the JWT token
        return 'user_123'  # Replace with actual JWT decoding
        
    except Exception as e:
        print(f"Error extracting user ID: {str(e)}")
        return None

def get_customer_id(user_id, provided_customer_id=None):
    """
    Get Stripe customer ID from DynamoDB or use provided ID
    """
    try:
        if provided_customer_id:
            # Verify the customer belongs to this user
            try:
                customer = stripe.Customer.retrieve(provided_customer_id)
                if customer.metadata.get('user_id') == user_id:
                    return provided_customer_id
            except stripe.error.InvalidRequestError:
                pass
        
        # Get from DynamoDB
        response = customers_table.get_item(Key={'user_id': user_id})
        if 'Item' in response and 'stripe_customer_id' in response['Item']:
            return response['Item']['stripe_customer_id']
        
        return None
        
    except Exception as e:
        print(f"Error getting customer ID: {str(e)}")
        return None

def create_response(status_code, body):
    """
    Create standardized API response
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'POST,OPTIONS'
        },
        'body': json.dumps(body)
    }
