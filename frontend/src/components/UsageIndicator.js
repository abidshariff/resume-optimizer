import React from 'react';
import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import { useSubscription } from '../contexts/SubscriptionContext';
import PremiumBadge from './PremiumBadge';

const UsageIndicator = () => {
  const { 
    isPaywallEnabled, 
    isPremium, 
    resumeEditsUsed, 
    getRemainingEdits 
  } = useSubscription();

  // Don't show if paywall is disabled
  if (!isPaywallEnabled) return null;

  if (isPremium) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        mb: 2,
        p: 1.5,
        bgcolor: '#fff8e1',
        borderRadius: 1,
        border: '1px solid #FFD700'
      }}>
        <PremiumBadge variant="badge" size="small" />
        <Typography variant="body2" sx={{ color: '#f57f17', fontWeight: 500 }}>
          Unlimited resume edits available
        </Typography>
      </Box>
    );
  }

  const remaining = getRemainingEdits();
  const progress = (resumeEditsUsed / 3) * 100;
  const isNearLimit = resumeEditsUsed >= 2;
  const isAtLimit = resumeEditsUsed >= 3;

  return (
    <Box sx={{ 
      mb: 2,
      p: 1.5,
      bgcolor: isAtLimit ? '#ffebee' : isNearLimit ? '#fff3e0' : '#f3f4f6',
      borderRadius: 1,
      border: `1px solid ${isAtLimit ? '#f44336' : isNearLimit ? '#ff9800' : '#e0e0e0'}`
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Free Plan Usage
        </Typography>
        <Chip 
          label={`${remaining} edits left`}
          size="small"
          color={isAtLimit ? 'error' : isNearLimit ? 'warning' : 'default'}
          variant="outlined"
        />
      </Box>
      
      <LinearProgress 
        variant="determinate" 
        value={progress}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            bgcolor: isAtLimit ? '#f44336' : isNearLimit ? '#ff9800' : '#4caf50',
            borderRadius: 3
          }
        }}
      />
      
      <Typography variant="caption" sx={{ 
        color: isAtLimit ? '#d32f2f' : isNearLimit ? '#f57c00' : '#666',
        mt: 0.5,
        display: 'block'
      }}>
        {resumeEditsUsed}/3 resume edits used
        {isAtLimit && ' - Upgrade for unlimited edits!'}
      </Typography>
    </Box>
  );
};

export default UsageIndicator;
