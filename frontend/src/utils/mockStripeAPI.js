// Mock Stripe API for testing without backend
// This simulates the backend API calls for development

const MOCK_DELAY = 1500; // Simulate network delay

export const mockCreateCheckoutSession = async (customerId = null) => {
  console.log('🧪 MOCK: Creating checkout session...');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  // Check if Stripe keys are configured
  const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  const priceId = process.env.REACT_APP_STRIPE_PRICE_ID;
  
  if (!publishableKey || publishableKey === 'pk_test_YOUR_PUBLISHABLE_KEY_HERE') {
    throw new Error('Stripe publishable key not configured. Please add your test key to .env file.');
  }
  
  if (!priceId || priceId === 'price_YOUR_PRICE_ID_HERE') {
    throw new Error('Stripe price ID not configured. Please create a product in Stripe Dashboard and add the price ID to .env file.');
  }
  
  // Simulate successful response
  return {
    sessionId: 'cs_test_mock_session_id_' + Date.now(),
    url: 'https://checkout.stripe.com/pay/cs_test_mock_session_id_' + Date.now()
  };
};

export const mockCreatePortalSession = async (customerId) => {
  console.log('🧪 MOCK: Creating portal session...');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  if (!customerId) {
    throw new Error('Customer ID is required for portal session');
  }
  
  // Simulate successful response
  return {
    url: 'https://billing.stripe.com/session/mock_portal_session_' + Date.now()
  };
};

// Mock webhook events for testing subscription status
export const mockWebhookEvents = {
  subscriptionCreated: {
    type: 'customer.subscription.created',
    data: {
      object: {
        id: 'sub_mock_subscription_id',
        customer: 'cus_mock_customer_id',
        status: 'trialing',
        trial_start: Math.floor(Date.now() / 1000),
        trial_end: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
        metadata: {
          user_id: 'mock_user_123'
        }
      }
    }
  },
  
  subscriptionActive: {
    type: 'customer.subscription.updated',
    data: {
      object: {
        id: 'sub_mock_subscription_id',
        customer: 'cus_mock_customer_id',
        status: 'active',
        trial_start: null,
        trial_end: null,
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        metadata: {
          user_id: 'mock_user_123'
        }
      }
    }
  }
};

// Test card numbers for Stripe testing
export const testCards = {
  success: '4242424242424242',
  declined: '4000000000000002',
  requiresAuthentication: '4000002500003155',
  insufficientFunds: '4000000000009995'
};

export const testCardInfo = {
  number: testCards.success,
  exp_month: 12,
  exp_year: 2025,
  cvc: '123'
};
