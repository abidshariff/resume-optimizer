import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Star as StarIcon,
  Visibility as PreviewIcon,
  Compare as CompareIcon,
  Save as SaveIcon,
  AllInclusive as InfinityIcon
} from '@mui/icons-material';
import { useSubscription } from '../contexts/SubscriptionContext';
import PremiumBadge from './PremiumBadge';
import PaymentForm from './PaymentForm';

const PaywallModal = ({ open, onClose, feature, onUpgrade, userEmail }) => {
  const { getRemainingEdits, resumeEditsUsed } = useSubscription();
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const featureMessages = {
    resume_edit: {
      title: 'Resume Edit Limit Reached',
      message: `You've used all 3 free resume edits. Upgrade to JobTailorAI Pro for unlimited edits!`,
      icon: <InfinityIcon sx={{ color: '#FFD700' }} />
    },
    preview: {
      title: 'Preview Feature',
      message: 'Resume preview is available with JobTailorAI Pro',
      icon: <PreviewIcon sx={{ color: '#FFD700' }} />
    },
    compare: {
      title: 'Compare Feature',
      message: 'Side-by-side comparison is available with JobTailorAI Pro',
      icon: <CompareIcon sx={{ color: '#FFD700' }} />
    },
    save_to_profile: {
      title: 'Save to Profile',
      message: 'Save resumes to your profile with JobTailorAI Pro',
      icon: <SaveIcon sx={{ color: '#FFD700' }} />
    }
  };

  const currentFeature = featureMessages[feature] || featureMessages.resume_edit;

  const premiumFeatures = [
    'Unlimited resume edits',
    'Real-time preview',
    'Side-by-side comparison',
    'Save to profile',
    'Priority support',
    'Advanced AI optimization'
  ];

  const handleUpgrade = () => {
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    if (onUpgrade) {
      onUpgrade();
    }
    onClose();
  };

  const handlePaymentClose = () => {
    setShowPaymentForm(false);
  };

  return (
    <>
      <Dialog
        open={open && !showPaymentForm}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#0A66C2', mb: 1 }}>
            {currentFeature.title}
          </Typography>
          <PremiumBadge variant="logo" size="large" />
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 3, color: '#666' }}>
            {currentFeature.message}
          </Typography>

          {feature === 'resume_edit' && (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#fff3cd', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#856404' }}>
                <strong>Usage:</strong> {resumeEditsUsed}/3 free edits used
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
            JobTailorAI Pro Features
          </Typography>

          <List dense>
            {premiumFeatures.map((feature, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemText 
                  primary={`• ${feature}`}
                  primaryTypographyProps={{ fontSize: '0.9rem' }}
                />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#e8f5e8', borderRadius: 1, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 600 }}>
              Special Launch Price: $9.99/month
            </Typography>
            <Typography variant="body2" sx={{ color: '#2e7d32', mt: 0.5 }}>
              Cancel anytime • 7-day free trial
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ minWidth: 120 }}
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleUpgrade}
            variant="contained"
            sx={{
              minWidth: 120,
              background: 'linear-gradient(45deg, #FFD700 30%, #FFA000 90%)',
              color: '#000',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(45deg, #FFC107 30%, #FF8F00 90%)',
              }
            }}
          >
            Upgrade Now
          </Button>
        </DialogActions>
      </Dialog>

      <PaymentForm
        open={showPaymentForm}
        onClose={handlePaymentClose}
        onSuccess={handlePaymentSuccess}
        userEmail={userEmail}
      />
    </>
  );
};

export default PaywallModal;
