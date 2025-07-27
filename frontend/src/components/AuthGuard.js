import React, { useEffect, useState, useCallback } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

function AuthGuard({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  const checkAuthAndRedirect = useCallback(async () => {
    try {
      await getCurrentUser();
      // User is already authenticated, redirect to app
      navigate('/app/upload', { replace: true });
    } catch (error) {
      // User is not authenticated, show auth page
      setIsChecking(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkAuthAndRedirect();
  }, [checkAuthAndRedirect]);

  if (isChecking) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return children;
}

export default AuthGuard;
