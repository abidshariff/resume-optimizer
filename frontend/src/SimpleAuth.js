import React, { useState } from 'react';
import { signIn, signUp, confirmSignUp, resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Link
} from '@mui/material';
import { WorkOutline as WorkIcon } from '@mui/icons-material';

function SimpleAuth({ onAuthSuccess, onCancel }) {
  const [mode, setMode] = useState('signIn'); // signIn, signUp, confirmSignUp, resetPassword, confirmResetPassword
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    confirmationCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError(''); // Clear error when user types
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await signIn({
        username: formData.email,
        password: formData.password
      });
      
      if (result.isSignedIn) {
        onAuthSuccess(result);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      const result = await signUp({
        username: formData.email,
        password: formData.password,
        attributes: {
          email: formData.email,
          given_name: formData.firstName,
          family_name: formData.lastName,
          phone_number: formData.phone || undefined
        }
      });
      
      if (result.isSignUpComplete) {
        onAuthSuccess(result);
      } else {
        setMode('confirmSignUp');
        setMessage('Please check your email for the verification code');
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await confirmSignUp({
        username: formData.email,
        confirmationCode: formData.confirmationCode
      });
      
      // Now sign in automatically
      const signInResult = await signIn({
        username: formData.email,
        password: formData.password
      });
      
      if (signInResult.isSignedIn) {
        onAuthSuccess(signInResult);
      }
    } catch (err) {
      console.error('Confirm sign up error:', err);
      setError(err.message || 'Failed to confirm sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await resetPassword({ username: formData.email });
      setMode('confirmResetPassword');
      setMessage('Please check your email for the reset code');
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      await confirmResetPassword({
        username: formData.email,
        confirmationCode: formData.confirmationCode,
        newPassword: formData.password
      });
      
      setMode('signIn');
      setMessage('Password reset successfully. Please sign in with your new password.');
    } catch (err) {
      console.error('Confirm reset password error:', err);
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const renderSignInForm = () => (
    <Box component="form" onSubmit={handleSignIn}>
      <Typography variant="h4" sx={{ 
        mb: 1, 
        fontWeight: 400,
        color: 'rgba(0,0,0,.9)',
        textAlign: 'center'
      }}>
        Sign in
      </Typography>
      <Typography variant="body1" sx={{ 
        mb: 4, 
        color: 'rgba(0,0,0,.6)',
        textAlign: 'center'
      }}>
        Stay updated on your professional world
      </Typography>

      <TextField
        fullWidth
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleInputChange('email')}
        required
        sx={{ mb: 2 }}
      />
      
      <TextField
        fullWidth
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleInputChange('password')}
        required
        sx={{ mb: 3 }}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{
          height: 52,
          borderRadius: '24px',
          fontSize: '16px',
          fontWeight: 600,
          textTransform: 'none',
          backgroundColor: '#0A66C2',
          '&:hover': {
            backgroundColor: '#004182'
          },
          mb: 2
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
      </Button>

      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Link
          component="button"
          type="button"
          onClick={() => setMode('resetPassword')}
          sx={{ color: '#0A66C2', textDecoration: 'none', fontSize: '14px' }}
        >
          Forgot password?
        </Link>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        my: 3,
        '&::before, &::after': {
          content: '""',
          flex: 1,
          height: '1px',
          backgroundColor: '#d0d0d0'
        }
      }}>
        <Typography sx={{ px: 2, color: 'rgba(0,0,0,.6)', fontSize: '14px' }}>
          or
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'rgba(0,0,0,.9)', fontSize: '16px' }}>
          New to Resume Optimizer?{' '}
          <Link
            component="button"
            type="button"
            onClick={() => setMode('signUp')}
            sx={{ 
              color: '#0A66C2', 
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Join now
          </Link>
        </Typography>
      </Box>
    </Box>
  );

  const renderSignUpForm = () => (
    <Box component="form" onSubmit={handleSignUp}>
      <Typography variant="h4" sx={{ 
        mb: 1, 
        fontWeight: 400,
        color: 'rgba(0,0,0,.9)',
        textAlign: 'center'
      }}>
        Make the most of your professional life
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="First name"
          value={formData.firstName}
          onChange={handleInputChange('firstName')}
          required
        />
        <TextField
          fullWidth
          label="Last name"
          value={formData.lastName}
          onChange={handleInputChange('lastName')}
          required
        />
      </Box>
      
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleInputChange('email')}
        required
        sx={{ mb: 2 }}
      />
      
      <TextField
        fullWidth
        label="Password (6+ characters)"
        type="password"
        value={formData.password}
        onChange={handleInputChange('password')}
        required
        sx={{ mb: 2 }}
      />
      
      <TextField
        fullWidth
        label="Confirm password"
        type="password"
        value={formData.confirmPassword}
        onChange={handleInputChange('confirmPassword')}
        required
        sx={{ mb: 2 }}
      />
      
      <TextField
        fullWidth
        label="Phone number (optional)"
        type="tel"
        value={formData.phone}
        onChange={handleInputChange('phone')}
        sx={{ mb: 3 }}
      />
      
      <Typography variant="body2" sx={{ 
        color: 'rgba(0,0,0,.6)', 
        fontSize: '12px',
        textAlign: 'center',
        mb: 3,
        lineHeight: 1.33
      }}>
        By clicking Agree & Join, you agree to the Resume Optimizer{' '}
        <Link sx={{ color: '#0A66C2' }}>User Agreement</Link>,{' '}
        <Link sx={{ color: '#0A66C2' }}>Privacy Policy</Link>, and{' '}
        <Link sx={{ color: '#0A66C2' }}>Cookie Policy</Link>.
      </Typography>
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{
          height: 52,
          borderRadius: '24px',
          fontSize: '16px',
          fontWeight: 600,
          textTransform: 'none',
          backgroundColor: '#0A66C2',
          '&:hover': {
            backgroundColor: '#004182'
          },
          mb: 3
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Agree & Join'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'rgba(0,0,0,.9)', fontSize: '16px' }}>
          Already on Resume Optimizer?{' '}
          <Link
            component="button"
            type="button"
            onClick={() => setMode('signIn')}
            sx={{ 
              color: '#0A66C2', 
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );

  const renderConfirmSignUpForm = () => (
    <Box component="form" onSubmit={handleConfirmSignUp}>
      <Typography variant="h4" sx={{ 
        mb: 2, 
        fontWeight: 400,
        color: 'rgba(0,0,0,.9)',
        textAlign: 'center'
      }}>
        Verify your email
      </Typography>
      
      <Typography variant="body1" sx={{ 
        mb: 3, 
        color: 'rgba(0,0,0,.6)',
        textAlign: 'center'
      }}>
        We sent a verification code to {formData.email}
      </Typography>

      <TextField
        fullWidth
        label="Verification code"
        value={formData.confirmationCode}
        onChange={handleInputChange('confirmationCode')}
        required
        sx={{ mb: 3 }}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{
          height: 52,
          borderRadius: '24px',
          fontSize: '16px',
          fontWeight: 600,
          textTransform: 'none',
          backgroundColor: '#0A66C2',
          '&:hover': {
            backgroundColor: '#004182'
          }
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify'}
      </Button>
    </Box>
  );

  const renderResetPasswordForm = () => (
    <Box component="form" onSubmit={handleResetPassword}>
      <Typography variant="h4" sx={{ 
        mb: 2, 
        fontWeight: 400,
        color: 'rgba(0,0,0,.9)',
        textAlign: 'center'
      }}>
        Reset your password
      </Typography>

      <TextField
        fullWidth
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleInputChange('email')}
        required
        sx={{ mb: 3 }}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{
          height: 52,
          borderRadius: '24px',
          fontSize: '16px',
          fontWeight: 600,
          textTransform: 'none',
          backgroundColor: '#0A66C2',
          '&:hover': {
            backgroundColor: '#004182'
          },
          mb: 2
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Send reset code'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Link
          component="button"
          type="button"
          onClick={() => setMode('signIn')}
          sx={{ color: '#0A66C2', textDecoration: 'none', fontSize: '14px' }}
        >
          Back to sign in
        </Link>
      </Box>
    </Box>
  );

  const renderConfirmResetPasswordForm = () => (
    <Box component="form" onSubmit={handleConfirmResetPassword}>
      <Typography variant="h4" sx={{ 
        mb: 2, 
        fontWeight: 400,
        color: 'rgba(0,0,0,.9)',
        textAlign: 'center'
      }}>
        Enter new password
      </Typography>
      
      <Typography variant="body1" sx={{ 
        mb: 3, 
        color: 'rgba(0,0,0,.6)',
        textAlign: 'center'
      }}>
        We sent a reset code to {formData.email}
      </Typography>

      <TextField
        fullWidth
        label="Reset code"
        value={formData.confirmationCode}
        onChange={handleInputChange('confirmationCode')}
        required
        sx={{ mb: 2 }}
      />
      
      <TextField
        fullWidth
        label="New password"
        type="password"
        value={formData.password}
        onChange={handleInputChange('password')}
        required
        sx={{ mb: 2 }}
      />
      
      <TextField
        fullWidth
        label="Confirm new password"
        type="password"
        value={formData.confirmPassword}
        onChange={handleInputChange('confirmPassword')}
        required
        sx={{ mb: 3 }}
      />
      
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{
          height: 52,
          borderRadius: '24px',
          fontSize: '16px',
          fontWeight: 600,
          textTransform: 'none',
          backgroundColor: '#0A66C2',
          '&:hover': {
            backgroundColor: '#004182'
          }
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset password'}
      </Button>
    </Box>
  );

  const getCurrentForm = () => {
    switch (mode) {
      case 'signUp':
        return renderSignUpForm();
      case 'confirmSignUp':
        return renderConfirmSignUpForm();
      case 'resetPassword':
        return renderResetPasswordForm();
      case 'confirmResetPassword':
        return renderConfirmResetPasswordForm();
      default:
        return renderSignInForm();
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ 
        bgcolor: 'white',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WorkIcon sx={{ color: '#0A66C2', mr: 1, fontSize: 28 }} />
            <Typography variant="h6" sx={{ 
              color: '#0A66C2', 
              fontWeight: 600,
              fontSize: '1.1rem'
            }}>
              Resume Optimizer
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            onClick={onCancel}
            sx={{
              color: '#666',
              borderColor: '#ddd',
              '&:hover': {
                borderColor: '#999',
                bgcolor: '#f9f9f9'
              }
            }}
          >
            Cancel
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ 
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f3f2ef',
        p: 2
      }}>
        <Container maxWidth="sm">
          <Paper sx={{ 
            bgcolor: 'white',
            borderRadius: '8px',
            boxShadow: '0 0 0 1px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.08)',
            p: { xs: 3, sm: 4 },
            maxWidth: 400,
            mx: 'auto'
          }}>
            {/* Logo */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <WorkIcon sx={{ fontSize: 40, color: '#0A66C2' }} />
            </Box>

            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Success Message */}
            {message && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {message}
              </Alert>
            )}

            {/* Current Form */}
            {getCurrentForm()}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

export default SimpleAuth;
