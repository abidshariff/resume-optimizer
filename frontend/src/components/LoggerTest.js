import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import Logger from '../utils/logger';

const LoggerTest = () => {
  const testLogging = () => {
    Logger.forceLog('=== LOGGER TEST STARTED ===');
    Logger.forceLog('Environment:', process.env.NODE_ENV);
    Logger.forceLog('Test Mode:', process.env.REACT_APP_TEST_MODE);
    Logger.forceLog('');
    
    // Test conditional logging
    Logger.log('🟢 Logger.log - Should only show in dev/test mode');
    Logger.error('🔴 Logger.error - Should only show in dev/test mode');
    Logger.warn('🟡 Logger.warn - Should only show in dev/test mode');
    Logger.info('🔵 Logger.info - Should only show in dev/test mode');
    Logger.debug('🟣 Logger.debug - Should only show in dev/test mode');
    
    Logger.forceLog('');
    Logger.forceLog('Force logging (always shows):');
    Logger.forceLog('⚡ Logger.forceLog - ALWAYS visible');
    Logger.forceError('💥 Logger.forceError - ALWAYS visible');
    
    Logger.forceLog('=== LOGGER TEST COMPLETED ===');
    Logger.forceLog('Check console to see which messages appeared!');
  };

  return (
    <Box sx={{ 
      position: 'fixed', 
      top: 100, 
      right: 20, 
      zIndex: 9999,
      bgcolor: 'rgba(255,255,255,0.9)',
      p: 2,
      borderRadius: 2,
      border: '2px solid #0A66C2'
    }}>
      <Typography variant="h6" sx={{ mb: 1, color: '#0A66C2' }}>
        Logger Test
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, fontSize: '0.8rem' }}>
        Environment: {process.env.NODE_ENV}<br/>
        Test Mode: {process.env.REACT_APP_TEST_MODE}
      </Typography>
      <Button 
        variant="contained" 
        onClick={testLogging}
        size="small"
        sx={{ 
          bgcolor: '#0A66C2',
          '&:hover': { bgcolor: '#004182' }
        }}
      >
        Test Logging
      </Button>
    </Box>
  );
};

export default LoggerTest;
