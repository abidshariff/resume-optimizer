import { loadStripe } from '@stripe/stripe-js';

// Safe Stripe initialization - only load if key is valid
const getStripePromise = () => {
  const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  
  // Don't initialize Stripe if key is missing or placeholder
  if (!publishableKey || 
      publishableKey === 'pk_test_YOUR_PUBLISHABLE_KEY_HERE' || 
      !publishableKey.startsWith('pk_')) {
    console.warn('⚠️ Stripe not initialized: Invalid or missing publishable key');
    return null;
  }
  
  return loadStripe(publishableKey);
};

const stripePromise = getStripePromise();

export default stripePromise;

// Stripe configuration
export const stripeConfig = {
  publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
  priceId: process.env.REACT_APP_STRIPE_PRICE_ID,
  successUrl: `${window.location.origin}/#/app/upload?payment=success`,
  cancelUrl: `${window.location.origin}/#/app/upload?payment=cancelled`,
  testMode: process.env.REACT_APP_STRIPE_TEST_MODE === 'true',
};

// Validate Stripe configuration
export const validateStripeConfig = () => {
  const { publishableKey, priceId } = stripeConfig;
  
  if (!publishableKey || publishableKey === 'pk_test_YOUR_PUBLISHABLE_KEY_HERE') {
    console.error('❌ Stripe publishable key is missing or not configured');
    console.log('💡 To fix: Get your key from https://dashboard.stripe.com/test/apikeys');
    return false;
  }
  
  if (!priceId || priceId === 'price_YOUR_PRICE_ID_HERE') {
    console.error('❌ Stripe price ID is missing or not configured');
    console.log('💡 To fix: Create a product in Stripe Dashboard and get the price ID');
    return false;
  }
  
  if (!publishableKey.startsWith('pk_')) {
    console.error('❌ Invalid Stripe publishable key format');
    return false;
  }
  
  console.log('✅ Stripe configuration is valid');
  return true;
};

// Mock functions for testing
const mockCreateCheckoutSession = async (customerId = null) => {
  console.log('🧪 MOCK: Creating checkout session...');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
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

const mockCreatePortalSession = async (customerId) => {
  console.log('🧪 MOCK: Creating portal session...');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (!customerId) {
    throw new Error('Customer ID is required for portal session');
  }
  
  // Simulate successful response
  return {
    url: 'https://billing.stripe.com/session/mock_portal_session_' + Date.now()
  };
};

// Create checkout session
export const createCheckoutSession = async (customerId = null) => {
  try {
    // Use mock API in test mode or when backend is not available
    if (stripeConfig.testMode || process.env.NODE_ENV === 'development') {
      console.log('🧪 Using mock Stripe API for testing');
      return await mockCreateCheckoutSession(customerId);
    }
    
    // Real API call (when backend is deployed)
    const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({
        priceId: stripeConfig.priceId,
        customerId,
        successUrl: stripeConfig.successUrl,
        cancelUrl: stripeConfig.cancelUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Create customer portal session
export const createPortalSession = async (customerId) => {
  try {
    // Use mock API in test mode or when backend is not available
    if (stripeConfig.testMode || process.env.NODE_ENV === 'development') {
      console.log('🧪 Using mock Stripe API for testing');
      return await mockCreatePortalSession(customerId);
    }
    
    // Real API call (when backend is deployed)
    const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({
        customerId,
        returnUrl: `${window.location.origin}/#/app/profile`,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};
