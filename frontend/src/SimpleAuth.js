import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Link,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  AutoAwesome as AutoAwesomeIcon,
  Visibility,
  VisibilityOff,
  CheckCircle,
  RadioButtonUnchecked
} from '@mui/icons-material';

function SimpleAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the return path from location state, default to /app/upload
  const returnTo = location.state?.returnTo || '/app/upload';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Phone number formatting for Cognito (E.164 format)
  const formatPhoneForCognito = (phone) => {
    if (!phone) return null;
    
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If it starts with 1 and has 11 digits, it's already in the right format
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    // If it has 10 digits, assume it's US number and add +1
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    
    // If it already starts with +, return as is
    if (phone.startsWith('+')) {
      return phone;
    }
    
    // Otherwise, return the original phone number
    return phone;
  };

  // Password validation function
  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const isValid = Object.values(requirements).every(req => req);
    return { isValid, requirements };
  };

  const getPasswordRequirements = (password) => {
    const { requirements } = validatePassword(password);
    return [
      { text: 'At least 8 characters', met: requirements.length },
      { text: 'One uppercase letter (A-Z)', met: requirements.uppercase },
      { text: 'One lowercase letter (a-z)', met: requirements.lowercase },
      { text: 'One number (0-9)', met: requirements.number },
      { text: 'One special character (!@#$%^&*)', met: requirements.special }
    ];
  };

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
        // Use replace to prevent back button from going to auth page
        navigate(returnTo, { replace: true });
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
    
    // Validate password requirements
    const { isValid } = validatePassword(formData.password);
    if (!isValid) {
      setError('Password does not meet the requirements');
      setLoading(false);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      const formattedPhone = formatPhoneForCognito(formData.phone);
      
      const result = await signUp({
        username: formData.email,
        password: formData.password,
        attributes: {
          email: formData.email,
          given_name: formData.firstName,
          family_name: formData.lastName,
          ...(formattedPhone && { phone_number: formattedPhone })
        }
      });
      
      if (result.isSignUpComplete) {
        navigate(returnTo);
      } else {
        setMode('confirmSignUp');
        setMessage('Please check your email for the verification code');
      }
    } catch (err) {
      console.error('Sign up error:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        name: err.name,
        stack: err.stack
      });
      
      // Handle specific Cognito errors
      if (err.code === 'UsernameExistsException') {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (err.code === 'InvalidPasswordException') {
        setError('Password does not meet the requirements.');
      } else if (err.code === 'InvalidParameterException') {
        setError(`Invalid parameter: ${err.message}`);
      } else {
        // Show the actual error message for debugging
        setError(err.message || 'Failed to sign up');
      }
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
        navigate('/app');
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
    
    // Validate password requirements
    const { isValid } = validatePassword(formData.password);
    if (!isValid) {
      setError('Password does not meet the requirements');
      setLoading(false);
      return;
    }
    
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
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleInputChange('password')}
        required
        sx={{ mb: 3 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
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
        <Typography variant="body2" sx={{ 
          color: 'rgba(0,0,0,.9)', 
          fontSize: '16px',
          lineHeight: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5
        }}>
          New to Resume Optimizer?
          <Link
            component="button"
            type="button"
            onClick={() => setMode('signUp')}
            sx={{ 
              color: '#0A66C2', 
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '16px',
              lineHeight: 1.5,
              display: 'inline',
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
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleInputChange('password')}
        required
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      {/* Password Requirements */}
      {formData.password && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
            Password Requirements:
          </Typography>
          <List dense sx={{ py: 0 }}>
            {getPasswordRequirements(formData.password).map((req, index) => (
              <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {req.met ? (
                    <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                  ) : (
                    <RadioButtonUnchecked sx={{ fontSize: 16, color: 'grey.400' }} />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={req.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.875rem',
                    color: req.met ? 'success.main' : 'text.secondary'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      <TextField
        fullWidth
        label="Confirm password"
        type={showConfirmPassword ? 'text' : 'password'}
        value={formData.confirmPassword}
        onChange={handleInputChange('confirmPassword')}
        required
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle confirm password visibility"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      <TextField
        fullWidth
        label="Phone number (optional)"
        type="tel"
        value={formData.phone}
        onChange={handleInputChange('phone')}
        placeholder="+1 (555) 123-4567"
        helperText="Include country code for international numbers"
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
        <Typography variant="body2" sx={{ 
          color: 'rgba(0,0,0,.9)', 
          fontSize: '16px',
          lineHeight: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5
        }}>
          Already on Resume Optimizer?
          <Link
            component="button"
            type="button"
            onClick={() => setMode('signIn')}
            sx={{ 
              color: '#0A66C2', 
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '16px',
              lineHeight: 1.5,
              display: 'inline',
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
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleInputChange('password')}
        required
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      {/* Password Requirements */}
      {formData.password && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
            Password Requirements:
          </Typography>
          <List dense sx={{ py: 0 }}>
            {getPasswordRequirements(formData.password).map((req, index) => (
              <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {req.met ? (
                    <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                  ) : (
                    <RadioButtonUnchecked sx={{ fontSize: 16, color: 'grey.400' }} />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={req.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.875rem',
                    color: req.met ? 'success.main' : 'text.secondary'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      <TextField
        fullWidth
        label="Confirm new password"
        type={showConfirmPassword ? 'text' : 'password'}
        value={formData.confirmPassword}
        onChange={handleInputChange('confirmPassword')}
        required
        sx={{ mb: 3 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle confirm password visibility"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
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
            <AutoAwesomeIcon sx={{ mr: 2, color: '#0A66C2', fontSize: 28 }} />
            <Typography variant="h5" sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Resume Optimizer Pro
            </Typography>
          </Box>
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
        <Container maxWidth="md">
          <Paper sx={{ 
            bgcolor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
            p: { xs: 4, sm: 5 },
            maxWidth: 600,
            mx: 'auto',
            border: '1px solid rgba(10, 102, 194, 0.1)'
          }}>
            {/* Logo */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <AutoAwesomeIcon sx={{ fontSize: 40, color: '#0A66C2' }} />
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
