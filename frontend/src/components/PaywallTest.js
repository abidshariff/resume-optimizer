import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useSubscription } from '../contexts/SubscriptionContext';
import PremiumBadge from './PremiumBadge';
import UsageIndicator from './UsageIndicator';

const PaywallTest = () => {
  const { 
    subscriptionTier, 
    upgradeToPremium, 
    downgradeToFree, 
    incrementResumeEdits,
    canUseFeature,
    getRemainingEdits,
    isPaywallEnabled
  } = useSubscription();

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        Paywall Test Component
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          <strong>Paywall Enabled:</strong> {isPaywallEnabled ? 'Yes' : 'No'}
        </Typography>
        <Typography variant="body1">
          <strong>Current Tier:</strong> {subscriptionTier}
        </Typography>
        <Typography variant="body1">
          <strong>Remaining Edits:</strong> {getRemainingEdits()}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <PremiumBadge variant="logo" size="large" />
      </Box>

      <UsageIndicator />

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={upgradeToPremium}
          disabled={subscriptionTier === 'premium'}
        >
          Upgrade to Premium
        </Button>
        <Button 
          variant="outlined" 
          onClick={downgradeToFree}
          disabled={subscriptionTier === 'free'}
        >
          Downgrade to Free
        </Button>
        <Button 
          variant="outlined" 
          onClick={incrementResumeEdits}
          disabled={subscriptionTier === 'premium'}
        >
          Use Resume Edit
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">Feature Access:</Typography>
        <Typography>Resume Edit: {canUseFeature('resume_edit') ? '✅' : '❌'}</Typography>
        <Typography>Preview: {canUseFeature('preview') ? '✅' : '❌'}</Typography>
        <Typography>Compare: {canUseFeature('compare') ? '✅' : '❌'}</Typography>
        <Typography>Save to Profile: {canUseFeature('save_to_profile') ? '✅' : '❌'}</Typography>
      </Box>
    </Paper>
  );
};

export default PaywallTest;
