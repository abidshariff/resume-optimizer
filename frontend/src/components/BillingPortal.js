import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Settings as SettingsIcon,
  CreditCard as CardIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { createPortalSession } from '../utils/stripe';
import { useSubscription } from '../contexts/SubscriptionContext';

const BillingPortal = ({ customerId, subscriptionStatus }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { subscriptionTier, isPremium } = useSubscription();

  const handleManageBilling = async () => {
    if (!customerId) {
      setError('Customer ID not found. Please contact support.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const session = await createPortalSession(customerId);
      
      // Redirect to Stripe Customer Portal
      window.location.href = session.url;
    } catch (err) {
      console.error('Billing portal error:', err);
      setError(err.message || 'Failed to open billing portal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trialing':
        return 'info';
      case 'past_due':
        return 'warning';
      case 'canceled':
      case 'unpaid':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'trialing':
        return 'Free Trial';
      case 'past_due':
        return 'Payment Due';
      case 'canceled':
        return 'Canceled';
      case 'unpaid':
        return 'Unpaid';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Subscription & Billing
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body1">
                <strong>Plan:</strong> {isPremium ? 'JobTailorAI Pro' : 'Free Plan'}
              </Typography>
              {subscriptionStatus && (
                <Chip
                  label={getStatusText(subscriptionStatus)}
                  color={getStatusColor(subscriptionStatus)}
                  size="small"
                />
              )}
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isPremium && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
              Manage your subscription, update payment methods, view invoices, and more.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={loading ? <CircularProgress size={16} /> : <SettingsIcon />}
                onClick={handleManageBilling}
                disabled={loading || !customerId}
              >
                {loading ? 'Opening...' : 'Manage Subscription'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<CardIcon />}
                onClick={handleManageBilling}
                disabled={loading || !customerId}
              >
                Update Payment Method
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ReceiptIcon />}
                onClick={handleManageBilling}
                disabled={loading || !customerId}
              >
                View Invoices
              </Button>
            </Box>
          </Box>
        )}

        {!isPremium && (
          <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #e9ecef' }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              You're currently on the free plan with limited features. 
              Upgrade to JobTailorAI Pro for unlimited access to all premium features.
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e9ecef' }}>
          <Typography variant="caption" sx={{ color: '#999' }}>
            All billing is securely processed by Stripe. Your payment information is encrypted and never stored on our servers.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BillingPortal;
