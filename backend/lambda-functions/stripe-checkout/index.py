import json
import os
import boto3
import stripe
from decimal import Decimal

# Initialize Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
customers_table = dynamodb.Table(os.environ.get('CUSTOMERS_TABLE', 'resume-optimizer-customers'))

def lambda_handler(event, context):
    """
    Create Stripe Checkout Session for subscription
    """
    try:
        # Parse request body
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})
        
        # Extract parameters
        price_id = body.get('priceId')
        customer_id = body.get('customerId')
        success_url = body.get('successUrl')
        cancel_url = body.get('cancelUrl')
        
        # Get user info from JWT token (simplified for now)
        user_id = extract_user_id_from_token(event)
        if not user_id:
            return create_response(401, {'error': 'Unauthorized'})
        
        # Validate required parameters
        if not price_id:
            return create_response(400, {'error': 'Price ID is required'})
        
        if not success_url or not cancel_url:
            return create_response(400, {'error': 'Success and cancel URLs are required'})
        
        # Get or create Stripe customer
        stripe_customer = get_or_create_customer(user_id, customer_id)
        
        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=stripe_customer['id'],
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
            allow_promotion_codes=True,
            billing_address_collection='required',
            metadata={
                'user_id': user_id,
            },
            subscription_data={
                'trial_period_days': 7,
                'metadata': {
                    'user_id': user_id,
                }
            }
        )
        
        # Store session info in DynamoDB
        store_checkout_session(user_id, checkout_session)
        
        return create_response(200, {
            'sessionId': checkout_session.id,
            'url': checkout_session.url
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
    This is a simplified version - implement proper JWT validation
    """
    try:
        # Get Authorization header
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

def get_or_create_customer(user_id, existing_customer_id=None):
    """
    Get existing Stripe customer or create a new one
    """
    try:
        # Check if customer exists in our database
        if existing_customer_id:
            try:
                customer = stripe.Customer.retrieve(existing_customer_id)
                return customer
            except stripe.error.InvalidRequestError:
                pass  # Customer doesn't exist, create new one
        
        # Check DynamoDB for existing customer
        try:
            response = customers_table.get_item(Key={'user_id': user_id})
            if 'Item' in response and 'stripe_customer_id' in response['Item']:
                customer_id = response['Item']['stripe_customer_id']
                customer = stripe.Customer.retrieve(customer_id)
                return customer
        except Exception as e:
            print(f"Error checking existing customer: {str(e)}")
        
        # Create new Stripe customer
        customer = stripe.Customer.create(
            metadata={'user_id': user_id}
        )
        
        # Store in DynamoDB
        customers_table.put_item(
            Item={
                'user_id': user_id,
                'stripe_customer_id': customer.id,
                'created_at': customer.created,
                'email': customer.email or '',
            }
        )
        
        return customer
        
    except Exception as e:
        print(f"Error creating customer: {str(e)}")
        raise

def store_checkout_session(user_id, session):
    """
    Store checkout session info in DynamoDB
    """
    try:
        customers_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression='SET checkout_session_id = :session_id, checkout_created_at = :created_at',
            ExpressionAttributeValues={
                ':session_id': session.id,
                ':created_at': session.created
            }
        )
    except Exception as e:
        print(f"Error storing checkout session: {str(e)}")

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
