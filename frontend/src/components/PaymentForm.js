import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Star as StarIcon,
  Security as SecurityIcon,
  CreditCard as CardIcon
} from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import { createCheckoutSession, validateStripeConfig } from '../utils/stripe';
import PremiumBadge from './PremiumBadge';
import SubscriptionSuccess from './SubscriptionSuccess';

const PaymentForm = ({ open, onClose, onSuccess, userEmail }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const premiumFeatures = [
    'Unlimited resume optimizations',
    'Real-time preview functionality',
    'Side-by-side comparison tool',
    'Save resumes to your profile',
    'Priority customer support',
    'Advanced AI optimization',
    'Multiple resume templates',
    'ATS compatibility scoring'
  ];

  const handleUpgrade = async () => {
    if (!validateStripeConfig()) {
      setError('Payment system is not properly configured. Please contact support.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create checkout session
      const session = await createCheckoutSession();
      
      // Check if we're in test mode (using mock API)
      if (process.env.REACT_APP_STRIPE_TEST_MODE === 'true') {
        // In test mode, show success modal
        setShowSuccess(true);
        return;
      }
      
      // Real Stripe redirect (only if Stripe is properly initialized)
      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
      
      if (!stripe) {
        throw new Error('Stripe failed to initialize. Please check your configuration.');
      }
      
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: session.sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setShowSuccess(false);
      onClose();
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  return (
    <>
      <Dialog
        open={open && !showSuccess}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }
        }}
      >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#0A66C2', mb: 1 }}>
          Upgrade to JobTailorAI Pro
        </Typography>
        <PremiumBadge variant="logo" size="large" />
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#2e7d32', mb: 1 }}>
            $9.99
            <Typography component="span" variant="h6" sx={{ color: '#666', ml: 1 }}>
              /month
            </Typography>
          </Typography>
          <Typography variant="body1" sx={{ color: '#2e7d32', fontWeight: 500 }}>
            7-day free trial • Cancel anytime
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
          Everything you need to land your dream job
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 250 }}>
            <List dense>
              {premiumFeatures.slice(0, 4).map((feature, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={`• ${feature}`}
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
          <Box sx={{ flex: 1, minWidth: 250 }}>
            <List dense>
              {premiumFeatures.slice(4).map((feature, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={`• ${feature}`}
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #e9ecef' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SecurityIcon sx={{ color: '#6c757d', mr: 1, fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#495057' }}>
              Secure Payment Processing
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#6c757d', fontSize: '0.85rem' }}>
            Powered by Stripe • PCI DSS Level 1 Certified • Your payment information is encrypted and secure
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{ minWidth: 140 }}
          disabled={loading}
        >
          Maybe Later
        </Button>
        <Button
          onClick={handleUpgrade}
          variant="contained"
          sx={{
            minWidth: 140,
            background: 'linear-gradient(45deg, #FFD700 30%, #FFA000 90%)',
            color: '#000',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(45deg, #FFC107 30%, #FF8F00 90%)',
            },
            '&:disabled': {
              background: '#ccc',
              color: '#666',
            }
          }}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Processing...' : 'Start Free Trial'}
        </Button>
      </DialogActions>
    </Dialog>

    <SubscriptionSuccess
      open={showSuccess}
      onClose={handleSuccessClose}
      onContinue={handleSuccessClose}
    />
    </>
  );
};

export default PaymentForm;
