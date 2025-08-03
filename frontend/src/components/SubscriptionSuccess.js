import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper
} from '@mui/material';
import PremiumBadge from './PremiumBadge';

const SubscriptionSuccess = ({ open, onClose, onContinue }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: '#ffffff'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#0A66C2', mb: 2 }}>
          Welcome to JobTailorAI Pro
        </Typography>
        <PremiumBadge variant="logo" size="large" />
      </DialogTitle>

      <DialogContent sx={{ px: 4, py: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 500, color: '#333', mb: 2 }}>
            Your subscription is now active
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
            You now have unlimited access to all premium features. Start optimizing your resumes 
            with advanced AI capabilities and land your dream job faster.
          </Typography>
        </Box>

        <Paper sx={{ p: 3, bgcolor: '#f8f9fa', border: '1px solid #e9ecef', mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
            What's included in your Pro subscription:
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
              • Unlimited resume optimizations
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
              • Real-time preview functionality
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
              • Side-by-side comparison tool
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
              • Save resumes to your profile
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: '#555' }}>
              • Priority customer support
            </Typography>
            <Typography variant="body2" sx={{ color: '#555' }}>
              • Advanced AI optimization
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ p: 2, bgcolor: '#e8f5e8', borderRadius: 1, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 500 }}>
            Your 7-day free trial is active. You won't be charged until the trial ends.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 4, gap: 2 }}>
        <Button
          onClick={onContinue || onClose}
          variant="contained"
          sx={{
            minWidth: 160,
            py: 1.5,
            backgroundColor: '#0A66C2',
            color: '#fff',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#085a9e',
            }
          }}
        >
          Start Using Pro Features
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubscriptionSuccess;
