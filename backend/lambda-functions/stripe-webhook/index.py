import json
import os
import boto3
import stripe
from datetime import datetime

# Initialize Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET')

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
customers_table = dynamodb.Table(os.environ.get('CUSTOMERS_TABLE', 'resume-optimizer-customers'))
subscriptions_table = dynamodb.Table(os.environ.get('SUBSCRIPTIONS_TABLE', 'resume-optimizer-subscriptions'))

def lambda_handler(event, context):
    """
    Handle Stripe webhook events
    """
    try:
        # Get the raw body and signature
        payload = event.get('body', '')
        sig_header = event.get('headers', {}).get('stripe-signature')
        
        if not sig_header:
            print("Missing Stripe signature header")
            return create_response(400, {'error': 'Missing signature'})
        
        # Verify webhook signature
        try:
            stripe_event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except ValueError as e:
            print(f"Invalid payload: {e}")
            return create_response(400, {'error': 'Invalid payload'})
        except stripe.error.SignatureVerificationError as e:
            print(f"Invalid signature: {e}")
            return create_response(400, {'error': 'Invalid signature'})
        
        # Handle the event
        event_type = stripe_event['type']
        event_data = stripe_event['data']['object']
        
        print(f"Handling Stripe event: {event_type}")
        
        # Handle different event types
        if event_type == 'checkout.session.completed':
            handle_checkout_completed(event_data)
        
        elif event_type == 'customer.subscription.created':
            handle_subscription_created(event_data)
        
        elif event_type == 'customer.subscription.updated':
            handle_subscription_updated(event_data)
        
        elif event_type == 'customer.subscription.deleted':
            handle_subscription_deleted(event_data)
        
        elif event_type == 'invoice.payment_succeeded':
            handle_payment_succeeded(event_data)
        
        elif event_type == 'invoice.payment_failed':
            handle_payment_failed(event_data)
        
        else:
            print(f"Unhandled event type: {event_type}")
        
        return create_response(200, {'received': True})
        
    except Exception as e:
        print(f"Webhook error: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})

def handle_checkout_completed(session):
    """
    Handle successful checkout completion
    """
    try:
        customer_id = session.get('customer')
        subscription_id = session.get('subscription')
        user_id = session.get('metadata', {}).get('user_id')
        
        if not user_id:
            print("No user_id in checkout session metadata")
            return
        
        # Update customer record
        customers_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression='SET stripe_customer_id = :customer_id, subscription_id = :sub_id, updated_at = :updated_at',
            ExpressionAttributeValues={
                ':customer_id': customer_id,
                ':sub_id': subscription_id,
                ':updated_at': int(datetime.now().timestamp())
            }
        )
        
        print(f"Updated customer record for user {user_id}")
        
    except Exception as e:
        print(f"Error handling checkout completed: {str(e)}")

def handle_subscription_created(subscription):
    """
    Handle subscription creation
    """
    try:
        user_id = subscription.get('metadata', {}).get('user_id')
        if not user_id:
            print("No user_id in subscription metadata")
            return
        
        # Store subscription details
        subscriptions_table.put_item(
            Item={
                'user_id': user_id,
                'subscription_id': subscription['id'],
                'customer_id': subscription['customer'],
                'status': subscription['status'],
                'current_period_start': subscription['current_period_start'],
                'current_period_end': subscription['current_period_end'],
                'trial_start': subscription.get('trial_start'),
                'trial_end': subscription.get('trial_end'),
                'created_at': subscription['created'],
                'updated_at': int(datetime.now().timestamp())
            }
        )
        
        print(f"Created subscription record for user {user_id}")
        
    except Exception as e:
        print(f"Error handling subscription created: {str(e)}")

def handle_subscription_updated(subscription):
    """
    Handle subscription updates
    """
    try:
        user_id = subscription.get('metadata', {}).get('user_id')
        if not user_id:
            print("No user_id in subscription metadata")
            return
        
        # Update subscription details
        subscriptions_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression='''SET 
                subscription_status = :status,
                current_period_start = :period_start,
                current_period_end = :period_end,
                trial_start = :trial_start,
                trial_end = :trial_end,
                updated_at = :updated_at''',
            ExpressionAttributeValues={
                ':status': subscription['status'],
                ':period_start': subscription['current_period_start'],
                ':period_end': subscription['current_period_end'],
                ':trial_start': subscription.get('trial_start'),
                ':trial_end': subscription.get('trial_end'),
                ':updated_at': int(datetime.now().timestamp())
            }
        )
        
        print(f"Updated subscription for user {user_id} to status {subscription['status']}")
        
    except Exception as e:
        print(f"Error handling subscription updated: {str(e)}")

def handle_subscription_deleted(subscription):
    """
    Handle subscription cancellation
    """
    try:
        user_id = subscription.get('metadata', {}).get('user_id')
        if not user_id:
            print("No user_id in subscription metadata")
            return
        
        # Update subscription status
        subscriptions_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression='SET subscription_status = :status, updated_at = :updated_at',
            ExpressionAttributeValues={
                ':status': 'canceled',
                ':updated_at': int(datetime.now().timestamp())
            }
        )
        
        print(f"Canceled subscription for user {user_id}")
        
    except Exception as e:
        print(f"Error handling subscription deleted: {str(e)}")

def handle_payment_succeeded(invoice):
    """
    Handle successful payment
    """
    try:
        subscription_id = invoice.get('subscription')
        if not subscription_id:
            return
        
        # Get subscription to find user_id
        subscription = stripe.Subscription.retrieve(subscription_id)
        user_id = subscription.metadata.get('user_id')
        
        if not user_id:
            print("No user_id in subscription metadata")
            return
        
        # Update payment status
        subscriptions_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression='SET last_payment_date = :payment_date, updated_at = :updated_at',
            ExpressionAttributeValues={
                ':payment_date': invoice['created'],
                ':updated_at': int(datetime.now().timestamp())
            }
        )
        
        print(f"Payment succeeded for user {user_id}")
        
    except Exception as e:
        print(f"Error handling payment succeeded: {str(e)}")

def handle_payment_failed(invoice):
    """
    Handle failed payment
    """
    try:
        subscription_id = invoice.get('subscription')
        if not subscription_id:
            return
        
        # Get subscription to find user_id
        subscription = stripe.Subscription.retrieve(subscription_id)
        user_id = subscription.metadata.get('user_id')
        
        if not user_id:
            print("No user_id in subscription metadata")
            return
        
        print(f"Payment failed for user {user_id}")
        # You might want to send an email notification here
        
    except Exception as e:
        print(f"Error handling payment failed: {str(e)}")

def create_response(status_code, body):
    """
    Create standardized API response
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
        },
        'body': json.dumps(body)
    }
