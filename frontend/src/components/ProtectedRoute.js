import React, { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      navigate('/');
    }
  };

  if (isAuthenticated === null) {
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

  return isAuthenticated ? children : null;
}

export default ProtectedRoute;
