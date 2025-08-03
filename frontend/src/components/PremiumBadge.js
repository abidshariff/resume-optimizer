import React from 'react';
import { Box, Typography } from '@mui/material';
import { useSubscription } from '../contexts/SubscriptionContext';

const PremiumBadge = ({ variant = 'logo', size = 'medium' }) => {
  const { isPremium, isPaywallEnabled } = useSubscription();

  // Don't show premium badge if paywall is disabled
  if (!isPaywallEnabled) return null;

  const sizeConfig = {
    small: { fontSize: '0.75rem', iconSize: '16px' },
    medium: { fontSize: '1rem', iconSize: '20px' },
    large: { fontSize: '1.25rem', iconSize: '24px' }
  };

  const config = sizeConfig[size];

  const ProIcon = () => (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: config.iconSize === '16px' ? '28px' : config.iconSize === '20px' ? '32px' : '36px',
        height: config.iconSize,
        borderRadius: '4px',
        backgroundColor: isPremium ? '#FFD700' : '#e0e0e0',
        color: isPremium ? '#000' : '#666',
        fontSize: config.iconSize === '16px' ? '8px' : config.iconSize === '20px' ? '10px' : '12px',
        fontWeight: 'bold',
        ml: 0.5,
        border: `1px solid ${isPremium ? '#FFD700' : '#ccc'}`,
        px: 0.5
      }}
    >
      PRO
    </Box>
  );

  if (variant === 'logo') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#0A66C2',
            fontSize: config.fontSize
          }}
        >
          JobTailorAI
        </Typography>
        <ProIcon />
      </Box>
    );
  }

  if (variant === 'badge') {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          backgroundColor: isPremium ? '#FFD700' : '#f5f5f5',
          color: isPremium ? '#000' : '#666',
          fontSize: config.fontSize,
          fontWeight: 600
        }}
      >
        {isPremium ? 'Pro' : 'Free'}
        <ProIcon />
      </Box>
    );
  }

  return <ProIcon />;
};

export default PremiumBadge;
