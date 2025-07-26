import React, { useState, useEffect } from 'react';
import { fetchAuthSession, deleteUser } from 'aws-amplify/auth';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import '@aws-amplify/ui-react/styles.css';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  TextField, 
  CircularProgress,
  AppBar,
  Toolbar,
  Avatar,
  IconButton,
  Divider,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Snackbar,
  LinearProgress,
  useTheme,
  ThemeProvider,
  createTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Stack,
  Rating
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  AutoAwesome as AutoAwesomeIcon,
  Download as DownloadIcon,
  Logout as LogoutIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  MoreVert as MoreVertIcon,
  PlayArrow as PlayArrowIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Shield as ShieldIcon,
  Psychology as PsychologyIcon,
  DeleteForever as DeleteForeverIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

// Create a LinkedIn-inspired professional theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0A66C2', // LinkedIn Blue
      light: '#378FE9',
      dark: '#004182',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#666666', // LinkedIn Gray
      light: '#8C8C8C',
      dark: '#404040',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F3F2EF', // LinkedIn Background
      paper: '#FFFFFF', // Pure White for cards
    },
    text: {
      primary: '#000000', // LinkedIn Black
      secondary: '#666666', // LinkedIn Gray
    },
    error: {
      main: '#CC1016', // LinkedIn Red
    },
    warning: {
      main: '#F5C75D', // LinkedIn Yellow
    },
    info: {
      main: '#0A66C2', // LinkedIn Blue
    },
    success: {
      main: '#057642', // LinkedIn Green
    },
    // Custom LinkedIn-style colors
    accent: {
      main: '#0A66C2', // LinkedIn Blue
      light: '#378FE9',
      dark: '#004182',
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontWeight: 600,
      color: '#000000', // LinkedIn Black
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      color: '#000000',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      color: '#000000',
    },
    h4: {
      fontWeight: 600,
      color: '#000000',
    },
    h5: {
      fontWeight: 600,
      color: '#000000',
    },
    h6: {
      fontWeight: 600,
      color: '#000000',
    },
    body1: {
      color: '#000000', // LinkedIn Black for body text
      fontSize: '14px',
      lineHeight: 1.4,
    },
    body2: {
      color: '#666666', // LinkedIn Gray for secondary text
      fontSize: '12px',
      lineHeight: 1.33,
    },
  },
  shape: {
    borderRadius: 8, // LinkedIn-style rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '16px',
          padding: '8px 16px',
          borderRadius: '24px', // LinkedIn pill-shaped buttons
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&.MuiButton-containedPrimary': {
            background: '#0A66C2', // LinkedIn Blue
            color: '#ffffff',
            '&:hover': {
              background: '#004182',
              boxShadow: 'inset 0 0 0 1px #0A66C2, inset 0 0 0 2px #ffffff',
            },
          },
          '&.MuiButton-containedSecondary': {
            background: '#ffffff',
            color: '#0A66C2',
            border: '1px solid #0A66C2',
            '&:hover': {
              background: '#F3F2EF',
              boxShadow: 'inset 0 0 0 1px #0A66C2',
            },
          },
        },
        outlined: {
          borderColor: '#0A66C2',
          color: '#0A66C2',
          borderRadius: '24px',
          '&:hover': {
            borderColor: '#004182',
            backgroundColor: 'rgba(10, 102, 194, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E0E0E0', // LinkedIn border color
          boxShadow: '0 0 0 1px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.08)',
          borderRadius: '8px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF', // LinkedIn white header
          color: '#000000',
          boxShadow: '0 0 0 1px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.08)',
          borderBottom: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          border: '1px solid #E0E0E0',
          boxShadow: '0 0 0 1px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.08)',
          borderRadius: '8px',
          '&:hover': {
            boxShadow: '0 0 0 1px rgba(0,0,0,.08), 0 4px 8px rgba(0,0,0,.12)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '&.MuiChip-filled': {
            backgroundColor: '#0A66C2',
            color: '#ffffff',
            fontSize: '12px',
            height: '24px',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 102, 194, 0.2)',
          borderRadius: '4px',
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#0A66C2',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '4px',
            '& fieldset': {
              borderColor: '#CCCCCC',
            },
            '&:hover fieldset': {
              borderColor: '#0A66C2',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0A66C2',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#666666',
            fontSize: '14px',
          },
        },
      },
    },
  },
});

// Add LinkedIn-style accent color
theme.palette.accent = {
  main: '#0A66C2',
  light: '#378FE9', 
  dark: '#004182',
  contrastText: '#ffffff',
};

// Profile Dialog Component
function ProfileDialog({ open, onClose, user, userProfile, setUserProfile, setSnackbarMessage, setSnackbarOpen }) {
  const handleSave = () => {
    // Here you would typically save to backend
    console.log('Saving profile:', userProfile);
    setSnackbarMessage('Profile updated successfully!');
    setSnackbarOpen(true);
    onClose();
  };

  // Get user attributes from Cognito
  const userAttributes = user?.attributes || {};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)', // Corporate blue to innovation accent
        color: 'white',
        display: 'flex',
        alignItems: 'center'
      }}>
        <PersonIcon sx={{ mr: 1 }} />
        Profile Settings
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={userProfile.firstName || userAttributes.given_name || ''}
              onChange={(e) => setUserProfile({...userProfile, firstName: e.target.value})}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={userProfile.lastName || userAttributes.family_name || ''}
              onChange={(e) => setUserProfile({...userProfile, lastName: e.target.value})}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={userProfile.email || userAttributes.email || ''}
              onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
              variant="outlined"
              disabled
              helperText="Email cannot be changed here. Contact support if needed."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={userProfile.phone || userAttributes.phone_number || ''}
              onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
              variant="outlined"
              placeholder="+1 (555) 123-4567"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Username"
              value={user?.username || ''}
              variant="outlined"
              disabled
              helperText="Username cannot be changed"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Company"
              value={userProfile.company || ''}
              onChange={(e) => setUserProfile({...userProfile, company: e.target.value})}
              variant="outlined"
              placeholder="Your company name"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Job Title"
              value={userProfile.jobTitle || ''}
              onChange={(e) => setUserProfile({...userProfile, jobTitle: e.target.value})}
              variant="outlined"
              placeholder="Your current job title"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// History Dialog Component
function HistoryDialog({ open, onClose, user }) {
  const [historyItems, setHistoryItems] = useState([
    // Mock data - in real app, this would come from backend
    {
      id: 1,
      date: '2024-01-15',
      jobTitle: 'Senior Software Engineer',
      company: 'Google',
      status: 'Completed',
      resumeName: 'John_Doe_Resume_v1.pdf',
      optimizedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      date: '2024-01-10',
      jobTitle: 'Product Manager',
      company: 'Microsoft',
      status: 'Completed',
      resumeName: 'John_Doe_Resume_PM.pdf',
      optimizedAt: '2024-01-10T14:20:00Z'
    },
    {
      id: 3,
      date: '2024-01-05',
      jobTitle: 'Data Scientist',
      company: 'Amazon',
      status: 'Failed',
      resumeName: 'John_Doe_Resume_DS.pdf',
      optimizedAt: '2024-01-05T09:15:00Z'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#4caf50';
      case 'Failed':
        return '#f44336';
      case 'Processing':
        return '#666666';
      default:
        return '#b0b0b0';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'Failed':
        return <ErrorIcon sx={{ color: '#f44336' }} />;
      case 'Processing':
        return <ScheduleIcon sx={{ color: '#666666' }} />;
      default:
        return <ScheduleIcon sx={{ color: '#b0b0b0' }} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = (item) => {
    // In real app, this would download the optimized resume
    console.log('Downloading:', item.resumeName);
    // Mock download functionality
    alert(`Downloading ${item.resumeName} (optimized for ${item.jobTitle} at ${item.company})`);
  };

  const handleReOptimize = (item) => {
    // In real app, this would re-run the optimization
    console.log('Re-optimizing:', item);
    alert(`Re-optimizing resume for ${item.jobTitle} at ${item.company}`);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center'
      }}>
        <HistoryIcon sx={{ mr: 1 }} />
        Optimization History
      </DialogTitle>
      <DialogContent sx={{ mt: 2, p: 0 }}>
        {historyItems.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <HistoryIcon sx={{ fontSize: 64, color: '#666', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#666666', mb: 1 }}> {/* Changed to LinkedIn gray */}
              No History Yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#888' }}>
              Your resume optimization history will appear here after you optimize your first resume.
            </Typography>
          </Box>
        ) : (
          <Box>
            {historyItems.map((item, index) => (
              <Box key={item.id}>
                <Box sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 3 }}>
                    {getStatusIcon(item.status)}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ 
                      color: '#ffffff',
                      fontWeight: 600,
                      mb: 0.5
                    }}>
                      {item.jobTitle}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#0A66C2',
                      mb: 0.5
                    }}>
                      {item.company}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: '#666666', // Changed to LinkedIn gray
                      display: 'block'
                    }}>
                      {formatDate(item.optimizedAt)} • {item.resumeName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {item.status === 'Completed' && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownload(item)}
                        sx={{
                          borderColor: '#0A66C2',
                          color: '#0A66C2',
                          '&:hover': {
                            borderColor: '#666666',
                            color: '#666666',
                            backgroundColor: 'rgba(10, 102, 194, 0.1)'
                          }
                        }}
                      >
                        Download
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AutoAwesomeIcon />}
                      onClick={() => handleReOptimize(item)}
                      sx={{
                        background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #004182 30%, #0A66C2 90%)',
                        }
                      }}
                    >
                      Re-optimize
                    </Button>
                  </Box>
                </Box>
                {index < historyItems.length - 1 && (
                  <Divider sx={{ borderColor: 'rgba(10, 102, 194, 0.2)' }} />
                )}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(10, 102, 194, 0.2)' }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button 
          variant="contained"
          startIcon={<AutoAwesomeIcon />}
          onClick={onClose}
          sx={{
            background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #004182 30%, #0A66C2 90%)',
            }
          }}
        >
          Optimize New Resume
        </Button>
      </DialogActions>
    </Dialog>
  );
}
function SettingsDialog({ open, onClose, userProfile, setUserProfile }) {
  const handleSave = () => {
    // Here you would typically save to backend
    console.log('Saving settings:', userProfile);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center'
      }}>
        <SettingsIcon sx={{ mr: 1 }} />
        Settings
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <NotificationsIcon sx={{ mr: 1 }} />
                  Notifications
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Manage your notification preferences
                </Typography>
                <Button
                  variant={userProfile.notifications ? "contained" : "outlined"}
                  onClick={() => setUserProfile({...userProfile, notifications: !userProfile.notifications})}
                  startIcon={<NotificationsIcon />}
                >
                  {userProfile.notifications ? 'Notifications On' : 'Notifications Off'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ mr: 1 }} />
                  Security
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Manage your account security settings
                </Typography>
                <Button variant="outlined" startIcon={<SecurityIcon />}>
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Professional Landing Page Component
function LandingPage({ onGetStarted, onSignIn }) {
  const features = [
    {
      icon: <PsychologyIcon sx={{ fontSize: 40, color: '#0A66C2' }} />,
      title: 'AI-Powered Optimization',
      description: 'Advanced AI analyzes your resume and optimizes it for specific job descriptions and ATS systems.'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#0A66C2' }} />,
      title: '3x More Interviews',
      description: 'Our users get 3x more interview calls with professionally optimized resumes.'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#0A66C2' }} />,
      title: 'Instant Results',
      description: 'Get your optimized resume in under 60 seconds with our lightning-fast AI processing.'
    },
    {
      icon: <ShieldIcon sx={{ fontSize: 40, color: '#0A66C2' }} />,
      title: 'ATS Compatible',
      description: 'Ensure your resume passes Applicant Tracking Systems with our ATS optimization technology.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      company: 'Google',
      rating: 5,
      text: 'Resume Optimizer Pro helped me land my dream job at Google. The AI optimization was incredible!'
    },
    {
      name: 'Michael Chen',
      role: 'Marketing Manager',
      company: 'Microsoft',
      rating: 5,
      text: 'I got 5 interview calls in the first week after using this service. Absolutely worth it!'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Data Scientist',
      company: 'Amazon',
      rating: 5,
      text: 'The ATS optimization feature is a game-changer. My resume now gets past all screening systems.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navigation Header */}
      <AppBar position="static" elevation={0} sx={{ 
        background: '#FFFFFF',
        borderBottom: '1px solid #E0E0E0'
      }}>
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AutoAwesomeIcon sx={{ mr: 2, color: '#0A66C2', fontSize: 28 }} />
            <Typography variant="h5" component="div" sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Resume Optimizer Pro
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              color="inherit" 
              onClick={onSignIn}
              sx={{ color: '#666666', '&:hover': { color: '#0A66C2' } }} // Changed to LinkedIn gray
            >
              Sign In
            </Button>
            <Button 
              variant="contained" 
              onClick={onGetStarted}
              sx={{
                background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #004182 30%, #0A66C2 90%)',
                }
              }}
            >
              Get Started Free
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2a2a2a 100%)',
        py: 12,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 25% 25%, #0A66C2 0%, transparent 50%), radial-gradient(circle at 75% 75%, #666666 0%, transparent 50%)',
          opacity: 0.1,
          zIndex: 0
        }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography variant="h1" sx={{ 
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 3,
                  lineHeight: 1.2
                }}>
                  Land Your Dream Job with AI-Optimized Resumes
                </Typography>
                <Typography variant="h5" sx={{ 
                  color: '#666666', // Changed to LinkedIn gray for better visibility
                  mb: 4, 
                  fontWeight: 400,
                  lineHeight: 1.4
                }}>
                  Transform your resume in seconds with our advanced AI technology. 
                  Get past ATS systems and land 3x more interviews.
                </Typography>
                <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
                  <Button 
                    variant="contained" 
                    size="large"
                    onClick={onGetStarted}
                    endIcon={<PlayArrowIcon />}
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                      boxShadow: '0 8px 32px rgba(10, 102, 194, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #004182 30%, #0A66C2 90%)',
                        boxShadow: '0 12px 40px rgba(10, 102, 194, 0.4)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Start Optimizing Now
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large"
                    sx={{
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      borderColor: '#0A66C2',
                      color: '#0A66C2',
                      '&:hover': {
                        borderColor: '#666666',
                        color: '#666666',
                        backgroundColor: 'rgba(10, 102, 194, 0.1)'
                      }
                    }}
                  >
                    Watch Demo
                  </Button>
                </Stack>
                <Typography variant="body2" sx={{ color: '#888', fontSize: '0.9rem' }}>
                  ✓ Free to start • ✓ No credit card required • ✓ 30-second setup
                </Typography>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box sx={{ 
                  position: 'relative',
                  textAlign: 'center'
                }}>
                  <Paper sx={{
                    p: 4,
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F3F2EF 100%)',
                    border: '2px solid #0A66C2',
                    borderRadius: 4,
                    boxShadow: '0 20px 60px rgba(10, 102, 194, 0.2)'
                  }}>
                    <Typography variant="h4" sx={{ 
                      color: '#0A66C2', 
                      mb: 2,
                      fontWeight: 700
                    }}>
                      🚀 Ready in 60 Seconds
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666666', mb: 3 }}> {/* Changed to LinkedIn gray */}
                      Upload your resume, paste the job description, and get an AI-optimized resume instantly.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                      <Chip label="Upload" color="primary" />
                      <ArrowForwardIcon sx={{ color: '#0A66C2', alignSelf: 'center' }} />
                      <Chip label="Optimize" color="primary" />
                      <ArrowForwardIcon sx={{ color: '#0A66C2', alignSelf: 'center' }} />
                      <Chip label="Download" color="primary" />
                    </Box>
                    <Typography variant="h6" sx={{ 
                      color: '#4caf50',
                      fontWeight: 600
                    }}>
                      3x More Interview Calls Guaranteed
                    </Typography>
                  </Paper>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Typography variant="h2" align="center" sx={{ 
            mb: 2,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Why Choose Resume Optimizer Pro?
          </Typography>
          <Typography variant="h6" align="center" sx={{ 
            color: '#666666', // Changed to LinkedIn gray for better visibility
            mb: 8,
            maxWidth: 600,
            mx: 'auto'
          }}>
            Join thousands of professionals who have transformed their careers with our AI-powered resume optimization
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card sx={{ 
                  height: '100%',
                  background: '#FFFFFF', // Pure white background
                  border: '1px solid #E0E0E0', // LinkedIn border color
                  boxShadow: '0 0 0 1px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.08)', // LinkedIn shadow
                  borderRadius: '8px',
                  '&:hover': {
                    boxShadow: '0 0 0 1px rgba(0,0,0,.08), 0 4px 8px rgba(0,0,0,.12)', // LinkedIn hover shadow
                    transform: 'translateY(-2px)', // Subtle lift on hover
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ mb: 3 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ 
                      mb: 2, 
                      fontWeight: 600,
                      color: '#000000' // Changed to black for visibility on white cards
                    }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#666666', // Changed to LinkedIn gray for visibility
                      lineHeight: 1.6
                    }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ 
        background: '#F3F2EF', // LinkedIn background color
        py: 12
      }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography variant="h2" align="center" sx={{ 
              mb: 2,
              fontWeight: 700,
              color: '#000000' // Changed to black for visibility on light background
            }}>
              Success Stories
            </Typography>
            <Typography variant="h6" align="center" sx={{ 
              color: '#666666', // Changed to LinkedIn gray 
              mb: 8
            }}>
              See how Resume Optimizer Pro helped professionals land their dream jobs
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Card sx={{ 
                    height: '100%',
                    background: '#FFFFFF', // Pure white background
                    border: '1px solid #E0E0E0', // LinkedIn border color
                    boxShadow: '0 0 0 1px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.08)', // LinkedIn shadow
                    borderRadius: '8px',
                    '&:hover': {
                      boxShadow: '0 0 0 1px rgba(0,0,0,.08), 0 4px 8px rgba(0,0,0,.12)', // LinkedIn hover shadow
                    }
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                      <Typography variant="body1" sx={{ 
                        color: '#000000', // Changed to black for visibility on white cards
                        mb: 3,
                        fontStyle: 'italic',
                        lineHeight: 1.6
                      }}>
                        "{testimonial.text}"
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ 
                          bgcolor: '#0A66C2',
                          mr: 2,
                          width: 50,
                          height: 50
                        }}>
                          {testimonial.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ 
                            color: '#000000', // Changed to black for visibility
                            fontWeight: 600
                          }}>
                            {testimonial.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666666' }}> {/* Changed to LinkedIn gray */}
                            {testimonial.role} at {testimonial.company}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Paper sx={{
            p: 8,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #0A66C2 0%, #666666 100%)',
            color: 'white'
          }}>
            <Typography variant="h2" sx={{ 
              mb: 3,
              fontWeight: 700
            }}>
              Ready to Transform Your Career?
            </Typography>
            <Typography variant="h6" sx={{ 
              mb: 4,
              opacity: 0.9,
              maxWidth: 600,
              mx: 'auto'
            }}>
              Join over 50,000 professionals who have successfully optimized their resumes and landed their dream jobs
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={onGetStarted}
              sx={{
                py: 2,
                px: 6,
                fontSize: '1.2rem',
                backgroundColor: '#000000',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#1a1a1a',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                }
              }}
            >
              Start Your Free Optimization Now
            </Button>
          </Paper>
        </motion.div>
      </Container>

      {/* Footer */}
      <Box sx={{ 
        background: '#F3F2EF',
        py: 6,
        borderTop: '1px solid #E0E0E0'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AutoAwesomeIcon sx={{ mr: 2, color: '#0A66C2', fontSize: 28 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 700,
                  color: '#0A66C2'
                }}>
                  Resume Optimizer Pro
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ 
                color: '#666666', // Changed to LinkedIn gray
                mb: 2,
                maxWidth: 400
              }}>
                The most advanced AI-powered resume optimization platform. 
                Transform your career with professional resume enhancement.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ 
                color: '#888',
                textAlign: { xs: 'left', md: 'right' }
              }}>
                © 2024 Resume Optimizer Pro. All rights reserved.
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#888',
                textAlign: { xs: 'left', md: 'right' },
                mt: 1
              }}>
                Privacy Policy • Terms of Service • Contact Us
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

// File upload component with drag and drop
function FileUploadZone({ onFileAccepted, acceptedFileTypes }) {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: acceptedFileTypes,
    onDrop: files => {
      if (files && files[0]) {
        onFileAccepted(files[0]);
      }
    },
    multiple: false
  });

  const file = acceptedFiles[0];

  return (
    <Box sx={{ mt: 2, mb: 3 }}>
      <Paper
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backgroundColor: isDragActive ? 'rgba(63, 81, 181, 0.04)' : 'background.paper',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'rgba(63, 81, 181, 0.04)',
          }
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: isDragActive ? 'primary.main' : 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop the file here' : 'Drag & drop your resume here'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          or click to browse files
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
          Supported formats: PDF, DOC, DOCX
        </Typography>
      </Paper>
      
      {file && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2">{file.name}</Typography>
          <Chip 
            label={file.type || file.name.split('.').pop().toUpperCase()} 
            size="small" 
            sx={{ ml: 1 }} 
            color="primary" 
            variant="outlined" 
          />
        </Box>
      )}
    </Box>
  );
}

// Status indicator component
function StatusIndicator({ status, message, progress }) {
  const getStatusIcon = () => {
    switch (status) {
      case 'PROCESSING':
        return <ScheduleIcon sx={{ color: 'primary.main', mr: 1 }} />;
      case 'COMPLETED':
        return <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />;
      case 'FAILED':
        return <ErrorIcon sx={{ color: 'error.main', mr: 1 }} />;
      default:
        return <ScheduleIcon sx={{ color: 'grey.500', mr: 1 }} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'PROCESSING':
        return 'primary.main';
      case 'COMPLETED':
        return 'success.main';
      case 'FAILED':
        return 'error.main';
      default:
        return 'grey.500';
    }
  };

  return (
    <Paper 
      sx={{ 
        p: 3, 
        mb: 3, 
        border: `2px solid`,
        borderColor: getStatusColor(),
        backgroundColor: status === 'PROCESSING' ? 'rgba(63, 81, 181, 0.04)' : 'background.paper'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {getStatusIcon()}
        <Typography variant="h6" sx={{ color: getStatusColor() }}>
          Status: {status}
        </Typography>
      </Box>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        {message}
      </Typography>
      
      {status === 'PROCESSING' && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress 
            variant={progress ? "determinate" : "indeterminate"} 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            This process typically takes 30-60 seconds...
          </Typography>
        </Box>
      )}
      
      {status === 'PROCESSING' && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(63, 81, 181, 0.08)', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            💡 What's happening?
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            <Typography component="li" variant="body2">Your resume is being analyzed and extracted</Typography>
            <Typography component="li" variant="body2">AI is matching your skills with the job requirements</Typography>
            <Typography component="li" variant="body2">Keywords are being optimized for ATS systems</Typography>
            <Typography component="li" variant="body2">A new resume is being generated</Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
}

function App() {
  // Authentication state
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signIn'); // 'signIn' or 'signUp'
  
  // Resume optimization state
  const [resume, setResume] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [outputFormat, setOutputFormat] = useState('word'); // Default to Word format
  
  // Enhanced UX state for processing
  const [processingStep, setProcessingStep] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  
  // Profile and Settings state
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    notifications: true,
    theme: 'dark'
  });

  // Educational tips to show during processing
  const educationalTips = [
    {
      icon: "🎯",
      title: "ATS Optimization",
      text: "ATS systems scan for exact keyword matches from job descriptions. We're strategically placing relevant keywords throughout your resume."
    },
    {
      icon: "📊", 
      title: "Recruiter Insights",
      text: "Recruiters spend only 6 seconds on initial resume review. We're optimizing your content for maximum impact in those crucial first moments."
    },
    {
      icon: "✨",
      title: "Achievement Focus", 
      text: "Quantified achievements increase interview chances by 40%. We're highlighting your measurable accomplishments and impact."
    },
    {
      icon: "🚀",
      title: "Action Verbs",
      text: "Action verbs like 'implemented', 'optimized', and 'achieved' catch recruiter attention. We're enhancing your experience descriptions."
    },
    {
      icon: "🔍",
      title: "Keyword Density",
      text: "The right keyword density helps your resume rank higher in ATS searches while maintaining natural readability."
    },
    {
      icon: "📝",
      title: "Professional Format",
      text: "Clean, professional formatting ensures your resume looks great both in ATS systems and to human recruiters."
    }
  ];

  // Processing milestones
  const processingMilestones = [
    { id: 0, label: "Analyzing your resume", icon: "📄", completed: false },
    { id: 1, label: "Extracting key skills and experience", icon: "🔍", completed: false },
    { id: 2, label: "Matching with job requirements", icon: "🎯", completed: false },
    { id: 3, label: "AI optimization in progress", icon: "🤖", completed: false },
    { id: 4, label: "Generating optimized document", icon: "📝", completed: false },
    { id: 5, label: "Finalizing your resume", icon: "✨", completed: false }
  ];

  const [milestones, setMilestones] = useState(processingMilestones);

  // Enhanced status messages based on actual backend status
  const getEnhancedStatusMessage = (status, message) => {
    switch (status) {
      case 'PROCESSING':
        if (message.includes('Processing resume')) {
          return "Reading your resume content and extracting key information...";
        } else if (message.includes('Generating optimized resume')) {
          return "Claude AI is optimizing your experience and skills sections...";
        } else if (message.includes('Finalizing')) {
          return "Creating your professionally formatted Word document...";
        }
        return "AI optimization in progress...";
      case 'COMPLETED':
        return "🎉 Your optimized resume is ready for download!";
      case 'FAILED':
        return message || "Optimization failed. Please try again.";
      default:
        return message || "Processing your resume...";
    }
  };

  // Rotate educational tips every 4 seconds during processing
  useEffect(() => {
    let tipInterval;
    if (isPolling) {
      tipInterval = setInterval(() => {
        setCurrentTip((prev) => (prev + 1) % educationalTips.length);
      }, 4000);
    }
    return () => {
      if (tipInterval) clearInterval(tipInterval);
    };
  }, [isPolling, educationalTips.length]);

  // Update processing milestones based on status
  useEffect(() => {
    if (isPolling && jobStatus) {
      const newMilestones = [...milestones];
      
      // Progress milestones based on status and time
      if (jobStatus === 'PROCESSING') {
        // Complete first 3 milestones immediately
        newMilestones[0].completed = true;
        newMilestones[1].completed = true;
        newMilestones[2].completed = true;
        
        // Progress through remaining milestones over time
        setTimeout(() => {
          setMilestones(prev => {
            const updated = [...prev];
            updated[3].completed = true;
            return updated;
          });
        }, 8000);
        
        setTimeout(() => {
          setMilestones(prev => {
            const updated = [...prev];
            updated[4].completed = true;
            return updated;
          });
        }, 20000);
      } else if (jobStatus === 'COMPLETED') {
        // Complete all milestones
        newMilestones.forEach(milestone => milestone.completed = true);
      }
      
      setMilestones(newMilestones);
    }
  }, [jobStatus, isPolling, milestones]);

  // Reset milestones when starting new job
  const resetProcessingState = () => {
    setMilestones(processingMilestones.map(m => ({ ...m, completed: false })));
    setCurrentTip(0);
    setProcessingStep(0);
  };

  // Legacy variables for backward compatibility with existing UI
  const isProcessing = isSubmitting || isPolling;
  const optimizedResume = result ? 'Resume ready for download' : null;
  const optimizedResumeType = result?.contentType || 'text/plain';

  // Scroll to top when processing starts
  useEffect(() => {
    if (isProcessing && !result) {
      // Smooth scroll to top when processing screen appears
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isProcessing, result]);

  const steps = ['Upload Resume', 'Enter Job Description', 'Get Optimized Resume'];

  // Handle landing page actions
  const handleGetStarted = () => {
    setAuthMode('signUp');
    setShowAuth(true);
  };

  const handleSignIn = () => {
    setAuthMode('signIn');
    setShowAuth(true);
  };

  // Handle profile deletion
  const handleDeleteProfile = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setSnackbarMessage('Please type "DELETE" to confirm account deletion');
      setSnackbarOpen(true);
      return;
    }

    setIsDeleting(true);
    try {
      // Delete the user account from Cognito
      await deleteUser();
      
      // Show success message
      setSnackbarMessage('Account successfully deleted. You will be signed out.');
      setSnackbarOpen(true);
      
      // Close the dialog
      setDeleteConfirmDialogOpen(false);
      setDeleteConfirmText('');
      
      // Note: The user will be automatically signed out after account deletion
      // The Authenticator component will handle the redirect to the sign-in page
      
    } catch (error) {
      console.error('Error deleting account:', error);
      setSnackbarMessage(`Error deleting account: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete confirmation dialog
  const handleOpenDeleteDialog = () => {
    setDeleteConfirmDialogOpen(true);
    setProfileMenuAnchor(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteConfirmDialogOpen(false);
    setDeleteConfirmText('');
    setIsDeleting(false);
  };

  // Save optimization to history (in real app, this would save to backend)
  const saveToHistory = (jobDescription, resumeName, result) => {
    // Extract job title and company from job description (basic parsing)
    const lines = jobDescription.split('\n');
    let jobTitle = 'Unknown Position';
    let company = 'Unknown Company';
    
    // Try to extract job title and company from first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line && !jobTitle.includes('Unknown')) {
        jobTitle = line.length > 50 ? line.substring(0, 50) + '...' : line;
        break;
      }
    }
    
    // Look for company name patterns
    const companyPatterns = [
      /at\s+([A-Z][a-zA-Z\s&]+)/i,
      /([A-Z][a-zA-Z\s&]+)\s+is\s+looking/i,
      /join\s+([A-Z][a-zA-Z\s&]+)/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = jobDescription.match(pattern);
      if (match && match[1]) {
        company = match[1].trim();
        break;
      }
    }
    
    const historyItem = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      jobTitle: jobTitle,
      company: company,
      status: result ? 'Completed' : 'Failed',
      resumeName: resumeName || 'resume.pdf',
      optimizedAt: new Date().toISOString()
    };
    
    console.log('Saving to history:', historyItem);
    // In real app, you would save this to backend/localStorage
  };

  // Poll for job status
  useEffect(() => {
    let intervalId;
    
    if (isPolling && jobId) {
      // For local development, we don't need to poll as we're using mock data
      if (window.location.hostname === 'localhost' && jobId.startsWith('local-test-')) {
        console.log('Local development detected, using mock status polling');
        return;
      }
      
      intervalId = setInterval(async () => {
        try {
          // Get the current auth session to include the JWT token
          const { tokens } = await fetchAuthSession();
          const idToken = tokens.idToken.toString();
          
          // Use direct fetch for status polling to avoid response wrapping issues
          const statusResponse = await fetch(`https://x62c0f3cme.execute-api.us-east-1.amazonaws.com/dev/status?jobId=${encodeURIComponent(jobId)}`, {
            method: 'GET',
            headers: {
              'Authorization': idToken,
              'Accept': 'application/json'
            }
          });
          
          if (!statusResponse.ok) {
            const errorText = await statusResponse.text();
            console.error("Status API request failed:", statusResponse.status, errorText);
            throw new Error(`Status API request failed: ${statusResponse.status} ${statusResponse.statusText}`);
          }
          
          const actualResponse = await statusResponse.json();
          
          console.log('Status response received:', actualResponse);
          console.log('Status response type:', typeof actualResponse);
          console.log('Status response keys:', actualResponse ? Object.keys(actualResponse) : 'null');
          console.log('Status response JSON:', JSON.stringify(actualResponse, null, 2));
          
          // Extract status
          const currentStatus = actualResponse.status;
          if (!currentStatus) {
            throw new Error(`No status in response: ${JSON.stringify(actualResponse)}`);
          }
          
          console.log('Current job status:', currentStatus);
          setJobStatus(currentStatus);
          setStatusMessage(actualResponse.message || '');
          
          // If job is complete, stop polling and set result
          if (currentStatus === 'COMPLETED') {
            setIsPolling(false);
            setResult(actualResponse);
            setActiveStep(2);
            
            // Save to history
            saveToHistory(jobDescription, resumeName, actualResponse);
          } else if (currentStatus === 'FAILED') {
            setIsPolling(false);
            setError(actualResponse.message || 'Job failed');
            setSnackbarMessage(`Error: ${actualResponse.message || 'Job failed'}`);
            setSnackbarOpen(true);
          }
        } catch (err) {
          console.error('Error checking job status:', err);
          setError(`Error checking job status: ${err.message || 'Unknown error'}`);
          setIsPolling(false);
          setJobStatus('FAILED');
          setSnackbarMessage(`Error checking status: ${err.message || 'Unknown error'}`);
          setSnackbarOpen(true);
        }
      }, 3000); // Poll every 3 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPolling, jobId, jobDescription, resumeName]);

  // If not showing auth, show landing page
  if (!showAuth) {
    return (
      <ThemeProvider theme={theme}>
        <LandingPage 
          onGetStarted={handleGetStarted}
          onSignIn={handleSignIn}
        />
      </ThemeProvider>
    );
  }
  

  const handleResumeChange = (file) => {
    if (file) {
      // Check file size (5MB limit to account for base64 encoding)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
        setSnackbarMessage(`File too large. Please choose a smaller file.`);
        setSnackbarOpen(true);
        return;
      }
      
      setResumeName(file.name);
      
      // Read the file as base64
      const reader = new FileReader();
      reader.onload = (event) => {
        setResume(event.target.result);
      };
      reader.readAsDataURL(file);
      
      // Move to next step if we're on step 0
      if (activeStep === 0) {
        setActiveStep(1);
      }
    }
  };

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
  };

  const handleOptimize = async () => {
    if (!resume || !jobDescription) {
      setSnackbarMessage('Please upload a resume and enter a job description');
      setSnackbarOpen(true);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setJobStatus('SUBMITTING');
    setStatusMessage('Submitting your resume for optimization...');
    
    // Reset processing state for new job
    resetProcessingState();
    
    try {
      console.log("Starting resume optimization...");
      
      // Check payload size before sending
      const payload = {
        resume: resume,
        jobDescription: jobDescription,
        outputFormat: outputFormat || 'word'
      };
      const payloadSize = new Blob([JSON.stringify(payload)]).size;
      console.log(`Payload size: ${(payloadSize / 1024 / 1024).toFixed(2)} MB`);
      
      if (payloadSize > 10 * 1024 * 1024) { // 10MB limit
        throw new Error(`Payload too large: ${(payloadSize / 1024 / 1024).toFixed(2)} MB. Maximum allowed is 10 MB.`);
      }
      
      // For local development, use a proxy or mock API response
      if (window.location.hostname === 'localhost') {
        console.log("Local development detected, using mock API response");
        // Mock a successful response for local testing
        const mockResponse = {
          jobId: 'local-test-' + Date.now(),
          status: 'PROCESSING',
          message: 'Job submitted and processing started (mock)'
        };
        
        setJobId(mockResponse.jobId);
        setJobStatus(mockResponse.status);
        setStatusMessage(mockResponse.message);
        setIsPolling(true);
        setIsSubmitting(false);
        
        // Simulate a completed job after 5 seconds
        setTimeout(() => {
          setJobStatus('COMPLETED');
          setStatusMessage('Resume optimization completed (mock)');
          setResult({
            optimizedResume: 'This is a mock optimized resume for local testing.\n\nYour resume has been optimized for the job description.',
            optimizedResumeUrl: '#',
            contentType: 'text/plain',
            fileType: 'txt'
          });
          setIsPolling(false);
          setActiveStep(2);
        }, 5000);
        
        return;
      }
      
      try {
        // Get the current auth session to include the JWT token
        console.log("Getting auth session...");
        const { tokens } = await fetchAuthSession();
        
        if (!tokens || !tokens.idToken) {
          throw new Error('No authentication token available. Please sign in again.');
        }
        
        const idToken = tokens.idToken.toString();
        console.log("Auth token obtained, length:", idToken.length);
        
        // Submit the job and get job ID immediately
        console.log("Submitting job to API...");
        console.log("API endpoint:", 'https://x62c0f3cme.execute-api.us-east-1.amazonaws.com/dev/optimize');
        
        // Use direct fetch instead of Amplify post to avoid response wrapping issues
        const response = await fetch('https://x62c0f3cme.execute-api.us-east-1.amazonaws.com/dev/optimize', {
          method: 'POST',
          headers: {
            'Authorization': idToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API request failed:", response.status, errorText);
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const responseData = await response.json();
        
        console.log("API response received:", responseData);
        console.log("Response type:", typeof responseData);
        console.log("Response keys:", responseData ? Object.keys(responseData) : 'null');
        console.log("Raw response JSON:", JSON.stringify(responseData, null, 2));
        
        // Validate response structure
        if (!responseData || typeof responseData !== 'object') {
          throw new Error(`Invalid response structure: ${JSON.stringify(responseData)}`);
        }
        
        // Check if we have a jobId in the response
        if (responseData && responseData.jobId) {
          console.log("Job ID found:", responseData.jobId);
          setJobId(responseData.jobId);
          setJobStatus(responseData.status || 'PROCESSING');
          setStatusMessage(responseData.message || 'Job submitted and processing started');
          setIsPolling(true);
          setIsSubmitting(false);
        } else {
          console.error("Invalid API response - no jobId found");
          console.error("Full response:", JSON.stringify(responseData, null, 2));
          
          // Check if there's an error message in the response
          let errorMessage = 'No job ID returned from the API';
          if (responseData && responseData.error) {
            errorMessage = responseData.error;
          } else if (responseData && responseData.message) {
            errorMessage = responseData.message;
          } else if (responseData && responseData.error) {
            errorMessage = responseData.error;
          } else if (responseData && responseData.message) {
            errorMessage = responseData.message;
          }
          
          throw new Error(`${errorMessage}. Response: ${JSON.stringify(responseData)}`);
        }
      } catch (error) {
        console.error('Error submitting job:', error);
        
        let errorMessage = error.message;
        
        // Handle specific error types
        if (error.name === 'NetworkError') {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message && error.message.includes('Unauthorized')) {
          errorMessage = 'Authentication failed. Please sign out and sign in again.';
        } else if (error.message && error.message.includes('403')) {
          errorMessage = 'Access denied. Please check your permissions.';
        } else if (error.message && error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        setError(`Error submitting job: ${errorMessage}`);
        setSnackbarMessage(`Error: ${errorMessage}`);
        setSnackbarOpen(true);
        setJobStatus('FAILED');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error in handleOptimize:', error);
      
      let errorMessage = error.message;
      
      setError(`Error submitting job: ${errorMessage}`);
      setSnackbarMessage(`Error: ${errorMessage}`);
      setSnackbarOpen(true);
      setJobStatus('FAILED');
      setIsSubmitting(false);
    }
  };

  const downloadOptimizedResume = async () => {
    if (!result || !result.optimizedResumeUrl) {
      setSnackbarMessage('No download URL available');
      setSnackbarOpen(true);
      return;
    }

    try {
      // For local development, use the mock optimized resume
      if (window.location.hostname === 'localhost' && result.optimizedResumeUrl === '#') {
        console.log('Local development detected, using mock download');
        
        // Create a blob from the mock optimized resume
        const contentType = result.contentType || 'text/plain';
        const fileExtension = result.fileType || 'txt';
        const blob = new Blob([result.optimizedResume], { type: contentType });
        
        // Create a download link and trigger it
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `optimized_resume.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        return;
      }
      
      // Get the current auth session to include the JWT token
      const { tokens } = await fetchAuthSession();
      const idToken = tokens.idToken.toString();
      
      console.log('Downloading from new API Gateway endpoint:', result.optimizedResumeUrl);
      
      // Fetch the optimized resume content from the new API Gateway download endpoint
      const resumeResponse = await fetch(result.optimizedResumeUrl, {
        method: 'GET',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (!resumeResponse.ok) {
        throw new Error(`Failed to fetch optimized resume: ${resumeResponse.status} ${resumeResponse.statusText}`);
      }
      
      // Get filename from Content-Disposition header or use fallback
      const contentDisposition = resumeResponse.headers.get('Content-Disposition');
      let filename = result.downloadFilename || `optimized_resume.${result.fileType || 'docx'}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      console.log('Download filename:', filename);
      
      // The API Gateway returns base64 encoded binary data as text
      // We need to decode it properly for binary files
      const responseText = await resumeResponse.text();
      
      // Convert base64 string to binary data
      const binaryString = atob(responseText);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Create blob from the decoded binary data
      const contentType = result.contentType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const blob = new Blob([bytes], { type: contentType });
      
      console.log('Created blob:', blob.size, 'bytes, type:', blob.type);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSnackbarMessage('Resume downloaded successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error downloading resume:', error);
      setSnackbarMessage(`Error downloading resume: ${error.message}`);
      setSnackbarOpen(true);
    }
  };

  const resetForm = () => {
    setJobId(null);
    setJobStatus(null);
    setStatusMessage('');
    setResult(null);
    setIsPolling(false);
    setIsSubmitting(false);
    setError(null);
    setActiveStep(0);
    setResume(null);
    setResumeName('');
    setJobDescription('');
    
    // Reset processing state
    resetProcessingState();
  };

  // Custom form fields for the Authenticator with professional styling
  const formFields = {
    signIn: {
      username: {
        placeholder: 'Enter your email address',
        label: 'Email Address *',
        isRequired: true,
      },
      password: {
        placeholder: 'Enter your password',
        label: 'Password *',
        isRequired: true,
      },
    },
    signUp: {
      username: {
        placeholder: 'Enter your email address',
        label: 'Email Address *',
        isRequired: true,
        order: 1,
      },
      password: {
        placeholder: 'Create a strong password',
        label: 'Password *',
        isRequired: true,
        order: 2,
      },
      confirm_password: {
        placeholder: 'Confirm your password',
        label: 'Confirm Password *',
        isRequired: true,
        order: 3,
      },
      given_name: {
        placeholder: 'Enter your first name',
        label: 'First Name *',
        isRequired: true,
        order: 5,
      },
      family_name: {
        placeholder: 'Enter your last name',
        label: 'Last Name *',
        isRequired: true,
        order: 6,
      },
      phone_number: {
        placeholder: '+1 (555) 123-4567',
        label: 'Phone Number',
        isRequired: false,
        order: 7,
      },
    },
    confirmSignUp: {
      confirmation_code: {
        placeholder: 'Enter the 6-digit code',
        label: 'Verification Code *',
        isRequired: true,
      },
    },
    resetPassword: {
      username: {
        placeholder: 'Enter your username or email',
        label: 'Username or Email *',
        isRequired: true,
      },
    },
    confirmResetPassword: {
      confirmation_code: {
        placeholder: 'Enter the verification code',
        label: 'Verification Code *',
        isRequired: true,
      },
      password: {
        placeholder: 'Enter your new password',
        label: 'New Password *',
        isRequired: true,
      },
      confirm_password: {
        placeholder: 'Confirm your new password',
        label: 'Confirm New Password *',
        isRequired: true,
      },
    },
  };

  // Custom components for Authenticator
  const components = {
    Header() {
      return (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4,
          background: '#FFFFFF',
          borderRadius: '12px 12px 0 0'
        }}>
          <AutoAwesomeIcon sx={{ fontSize: 48, color: '#0A66C2', mb: 2 }} />
          <Typography variant="h4" sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 1
          }}>
            Resume Optimizer Pro
          </Typography>
          <Typography variant="body1" sx={{ color: '#b0b0b0' }}>
            Professional AI-Powered Resume Enhancement
          </Typography>
        </Box>
      );
    },
    SignIn: {
      Header() {
        return (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              color: '#000000', // Changed to black for visibility
              mb: 1 
            }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666' }}> {/* Changed to LinkedIn gray */}
              Sign in to optimize your resume with AI
            </Typography>
          </Box>
        );
      },
      Footer() {
        return (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#666666' }}> {/* Changed to LinkedIn gray */}
              Don't have an account?{' '}
              <Typography 
                component="span" 
                onClick={() => setAuthMode('signUp')}
                sx={{ 
                  color: '#0A66C2', 
                  cursor: 'pointer',
                  '&:hover': { color: '#004182' } // Darker blue on hover
                }}
              >
                Sign up for free
              </Typography>
            </Typography>
          </Box>
        );
      },
    },
    SignUp: {
      Header() {
        return (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              color: '#000000', // Changed to black for visibility
              mb: 1 
            }}>
              Create Your Account
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666' }}> {/* Changed to LinkedIn gray */}
              Join thousands of professionals optimizing their resumes
            </Typography>
          </Box>
        );
      },
      Footer() {
        return (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#666666' }}> {/* Changed to LinkedIn gray */}
              Already have an account?{' '}
              <Typography 
                component="span" 
                onClick={() => setAuthMode('signIn')}
                sx={{ 
                  color: '#0A66C2', 
                  cursor: 'pointer',
                  '&:hover': { color: '#004182' } // Darker blue on hover
                }}
              >
                Sign in here
              </Typography>
            </Typography>
            <Typography variant="caption" sx={{ 
              color: '#888', 
              display: 'block', 
              mt: 2,
              fontSize: '0.75rem'
            }}>
              By signing up, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        );
      },
    },
    ConfirmSignUp: {
      Header() {
        return (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              color: '#000000', // Changed to black for visibility
              mb: 1 
            }}>
              Verify Your Email
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666' }}> {/* Changed to LinkedIn gray */}
              We've sent a verification code to your email address
            </Typography>
          </Box>
        );
      },
      Footer() {
        return (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#666666' }}> {/* Changed to LinkedIn gray */}
              Didn't receive the code?{' '}
              <Typography 
                component="span" 
                sx={{ 
                  color: '#0A66C2', 
                  cursor: 'pointer',
                  '&:hover': { color: '#666666' }
                }}
              >
                Resend code
              </Typography>
            </Typography>
          </Box>
        );
      },
    },
    ResetPassword: {
      Header() {
        return (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              color: '#000000', // Changed to black for visibility
              mb: 1 
            }}>
              Reset Password
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666' }}> {/* Changed to LinkedIn gray */}
              Enter your username or email to reset your password
            </Typography>
          </Box>
        );
      },
    },
    ConfirmResetPassword: {
      Header() {
        return (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              color: '#000000', // Changed to black for visibility
              mb: 1 
            }}>
              Create New Password
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666' }}> {/* Changed to LinkedIn gray */}
              Enter the verification code and your new password
            </Typography>
          </Box>
        );
      },
    },
  };

  // Wrap the app with Authenticator for user authentication
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Back to Landing Page Button */}
        <Box sx={{ 
          position: 'absolute', 
          top: 20, 
          left: 20, 
          zIndex: 1000 
        }}>
          <Button
            variant="outlined"
            onClick={() => setShowAuth(false)}
            sx={{
              borderColor: '#0A66C2',
              color: '#0A66C2',
              '&:hover': {
                borderColor: '#666666',
                color: '#666666',
                backgroundColor: 'rgba(10, 102, 194, 0.1)'
              }
            }}
          >
            ← Back to Home
          </Button>
        </Box>

        <Authenticator 
          loginMechanisms={['email']} // Changed to email only for better compatibility
          formFields={formFields}
          components={components}
          initialState={authMode}
          signUpAttributes={[
            'email',
            'given_name', 
            'family_name',
            'phone_number'
          ]}
          theme={{
            name: 'resume-optimizer-theme',
            tokens: {
              colors: {
                background: {
                  primary: '#121212',
                  secondary: '#1e1e1e',
                },
                font: {
                  primary: '#ffffff',
                  secondary: '#b0b0b0',
                  tertiary: '#888888',
                },
                brand: {
                  primary: {
                    10: '#0A66C2',
                    20: '#0A66C2',
                    40: '#0A66C2',
                    60: '#0A66C2',
                    80: '#0A66C2',
                    90: '#0A66C2',
                    100: '#0A66C2',
                  },
                  secondary: {
                    10: '#666666',
                    20: '#666666',
                    40: '#666666',
                    60: '#666666',
                    80: '#666666',
                    90: '#666666',
                    100: '#666666',
                  },
                },
                border: {
                  primary: 'rgba(10, 102, 194, 0.3)',
                  secondary: 'rgba(10, 102, 194, 0.1)',
                  focus: '#0A66C2',
                },
              },
              components: {
                authenticator: {
                  router: {
                    boxShadow: '0 0 0 1px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.08)', // LinkedIn shadow
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E0E0E0', // LinkedIn border
                    maxWidth: '400px',
                    margin: '2rem auto',
                    padding: '32px',
                  },
                },
                button: {
                  primary: {
                    backgroundColor: '#0A66C2', // LinkedIn Blue
                    color: '#ffffff',
                    borderRadius: '24px', // LinkedIn pill shape
                    fontWeight: '600',
                    padding: '12px 24px',
                    fontSize: '16px',
                    border: 'none',
                    boxShadow: 'none',
                    _hover: {
                      backgroundColor: '#004182', // Darker LinkedIn blue
                      boxShadow: 'inset 0 0 0 1px #0A66C2, inset 0 0 0 2px #ffffff',
                      transform: 'none',
                    },
                    _focus: {
                      backgroundColor: '#0A66C2',
                      boxShadow: '0 0 0 2px rgba(10, 102, 194, 0.3)',
                      outline: 'none',
                    },
                    _active: {
                      backgroundColor: '#004182',
                      transform: 'none',
                    },
                  },
                  link: {
                    color: '#0A66C2',
                    fontWeight: '600',
                    textDecoration: 'none',
                    _hover: {
                      color: '#004182',
                      textDecoration: 'underline',
                    },
                  },
                },
                fieldcontrol: {
                  backgroundColor: '#FFFFFF', // White background for inputs
                  borderColor: '#CCCCCC', // Light gray border
                  borderRadius: '4px',
                  color: '#000000', // Black text
                  padding: '12px 16px',
                  fontSize: '14px',
                  _focus: {
                    borderColor: '#0A66C2',
                    borderWidth: '2px',
                    boxShadow: 'none',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                  },
                  _hover: {
                    borderColor: '#0A66C2',
                    backgroundColor: '#FFFFFF',
                  },
                  _error: {
                    borderColor: '#CC1016', // LinkedIn red
                    boxShadow: 'none',
                    backgroundColor: '#FFFFFF',
                  },
                },
                fieldmessages: {
                  color: '#CC1016', // LinkedIn red for errors
                  fontSize: '12px',
                  marginTop: '4px',
                },
                text: {
                  primary: {
                    color: '#000000', // Black text
                    fontSize: '14px',
                  },
                  secondary: {
                    color: '#666666', // LinkedIn gray
                    fontSize: '12px',
                  },
                },
                tabs: {
                  item: {
                    color: '#666666', // LinkedIn gray
                    borderColor: 'transparent',
                    fontWeight: '600',
                    fontSize: '16px',
                    padding: '12px 16px',
                    _active: {
                      color: '#0A66C2', // LinkedIn blue when active
                      borderColor: '#0A66C2',
                      borderBottomWidth: '2px',
                    },
                    _hover: {
                      color: '#0A66C2',
                    },
                  },
                },
              },
            },
          }}
        >
          {({ signOut, user }) => {
            // If user is authenticated, show main app directly (no landing page)
            if (user) {
              return (
                <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                  <AppBar position="static" elevation={0} sx={{ 
                    background: '#FFFFFF',
                    borderBottom: '1px solid #E0E0E0'
                  }}>
                    <Toolbar sx={{ py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AutoAwesomeIcon sx={{ mr: 2, color: '#0A66C2', fontSize: 28 }} />
                  <Typography variant="h5" component="div" sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    Resume Optimizer Pro
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ 
                    color: '#666666', // Changed to LinkedIn gray
                    display: { xs: 'none', sm: 'block' }
                  }}>
                    Welcome, {user.username}
                  </Typography>
                  <IconButton
                    onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
                    sx={{ 
                      p: 0,
                      border: '2px solid #0A66C2',
                      '&:hover': {
                        border: '2px solid #666666',
                      }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                        width: 40,
                        height: 40,
                        fontSize: '1rem',
                        fontWeight: 600
                      }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                  
                  {/* Profile Menu */}
                  <Menu
                    anchorEl={profileMenuAnchor}
                    open={Boolean(profileMenuAnchor)}
                    onClose={() => setProfileMenuAnchor(null)}
                    PaperProps={{
                      sx: {
                        bgcolor: '#FFFFFF',
                        border: '1px solid #0A66C2',
                        mt: 1,
                        minWidth: 200
                      }
                    }}
                  >
                    <MenuItem onClick={() => {
                      setProfileDialogOpen(true);
                      setProfileMenuAnchor(null);
                    }}>
                      <ListItemIcon>
                        <PersonIcon sx={{ color: '#0A66C2' }} />
                      </ListItemIcon>
                      <ListItemText primary="Profile" />
                    </MenuItem>
                    <MenuItem onClick={() => {
                      setSettingsDialogOpen(true);
                      setProfileMenuAnchor(null);
                    }}>
                      <ListItemIcon>
                        <SettingsIcon sx={{ color: '#0A66C2' }} />
                      </ListItemIcon>
                      <ListItemText primary="Settings" />
                    </MenuItem>
                    <MenuItem onClick={() => {
                      setHistoryDialogOpen(true);
                      setProfileMenuAnchor(null);
                    }}>
                      <ListItemIcon>
                        <HistoryIcon sx={{ color: '#0A66C2' }} />
                      </ListItemIcon>
                      <ListItemText primary="History" />
                    </MenuItem>
                    <Divider sx={{ borderColor: 'rgba(10, 102, 194, 0.2)' }} />
                    <MenuItem onClick={handleOpenDeleteDialog}>
                      <ListItemIcon>
                        <DeleteForeverIcon sx={{ color: '#CC1016' }} />
                      </ListItemIcon>
                      <ListItemText primary="Delete Account" sx={{ color: '#CC1016' }} />
                    </MenuItem>
                    <MenuItem onClick={() => {
                      setProfileMenuAnchor(null);
                      signOut();
                    }}>
                      <ListItemIcon>
                        <LogoutIcon sx={{ color: '#0A66C2' }} />
                      </ListItemIcon>
                      <ListItemText primary="Sign Out" />
                    </MenuItem>
                  </Menu>
                </Box>
              </Toolbar>
            </AppBar>
            
            <Container maxWidth="md" sx={{ py: 6 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography 
                  variant="h2" 
                  component="h1" 
                  align="center" 
                  gutterBottom
                  sx={{ 
                    mb: 1,
                    fontWeight: 800,
                    background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  AI-Powered Resume Optimization
                </Typography>
                <Typography 
                  variant="h6" 
                  component="h2" 
                  align="center" 
                  color="textSecondary"
                  gutterBottom
                  sx={{ mb: 4, fontWeight: 400, color: '#666666' }} // Changed to LinkedIn gray
                >
                  Transform your resume with intelligent AI matching for maximum ATS compatibility
                </Typography>
              </motion.div>
              
              <Box sx={{ mb: 5 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 4, 
                    borderRadius: 3,
                    mb: 4,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {activeStep === 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Typography variant="h5" gutterBottom>
                        Upload Your Resume
                      </Typography>
                      <Typography variant="body1" color="textSecondary" paragraph>
                        Start by uploading your current resume in PDF or Word format.
                      </Typography>
                      
                      <FileUploadZone 
                        onFileAccepted={handleResumeChange}
                        acceptedFileTypes={{
                          'application/pdf': ['.pdf'],
                          'application/msword': ['.doc'],
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                        }}
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          endIcon={<ArrowForwardIcon />}
                          disabled={!resume}
                          onClick={() => setActiveStep(1)}
                        >
                          Continue
                        </Button>
                      </Box>
                    </motion.div>
                  )}
                  
                  {activeStep === 1 && !isProcessing && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      style={{ position: 'relative', zIndex: 1 }}
                    >
                      <Typography variant="h5" gutterBottom>
                        Enter Job Description
                      </Typography>
                      <Typography variant="body1" color="textSecondary" paragraph>
                        Paste the job description you want to optimize your resume for.
                      </Typography>
                      
                      <TextField
                        label="Job Description"
                        multiline
                        rows={10}
                        fullWidth
                        variant="outlined"
                        value={jobDescription}
                        onChange={handleJobDescriptionChange}
                        placeholder="Paste job description here..."
                        sx={{ mb: 3 }}
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, position: 'relative', zIndex: 1 }}>
                        <Button 
                          variant="outlined" 
                          onClick={() => {
                            setActiveStep(0);
                            // Reset any processing state when going back
                            setIsPolling(false);
                            setIsSubmitting(false);
                            setJobStatus(null);
                            setStatusMessage('');
                            resetProcessingState();
                          }}
                          sx={{ position: 'relative', zIndex: 2 }}
                        >
                          Back
                        </Button>
                        <Button 
                          variant="contained" 
                          endIcon={<AutoAwesomeIcon />}
                          disabled={!jobDescription}
                          onClick={handleOptimize}
                          size="large"
                          sx={{
                            backgroundColor: '#0A66C2', // LinkedIn Blue
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '16px',
                            borderRadius: '24px', // LinkedIn pill shape
                            padding: '12px 24px',
                            textTransform: 'none',
                            '&:hover': {
                              backgroundColor: '#004182',
                              boxShadow: 'inset 0 0 0 1px #0A66C2, inset 0 0 0 2px #ffffff',
                            },
                            '&:disabled': {
                              backgroundColor: 'rgba(10, 102, 194, 0.3)',
                            }
                          }}
                        >
                          Optimize Resume
                        </Button>
                      </Box>
                    </motion.div>
                  )}
                  
                  {/* Processing Screen - Replace job description step when processing */}
                  {activeStep === 1 && isProcessing && !result && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '600px'
                      }}
                    >
                      <Box sx={{ 
                        textAlign: 'center', 
                        mb: 4,
                        width: '100%',
                        maxWidth: 700
                      }}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                          🤖 Optimizing Your Resume
                        </Typography>
                        <Typography variant="h6" color="textSecondary" paragraph>
                          Our AI is analyzing your resume and tailoring it to the job description.
                        </Typography>
                      </Box>

                      {/* Progress Milestones and Progress Bar Side by Side */}
                      <Box sx={{ 
                        mb: 4, 
                        width: '100%', 
                        maxWidth: 900,
                        display: 'flex',
                        gap: 6,
                        '@media (max-width: 768px)': {
                          flexDirection: 'column',
                          gap: 4
                        }
                      }}>
                        {/* Left Side - Progress Milestones */}
                        <Box sx={{ flex: '1 1 50%', minWidth: 0 }}>
                          <Typography variant="h6" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
                            AI Processing Steps
                          </Typography>
                          {milestones.map((milestone, index) => (
                            <Box 
                              key={milestone.id}
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 2,
                                opacity: milestone.completed ? 1 : 0.6,
                                justifyContent: 'flex-start'
                              }}
                            >
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  backgroundColor: milestone.completed ? 'success.main' : 'grey.300',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 2,
                                  transition: 'all 0.3s ease',
                                  flexShrink: 0
                                }}
                              >
                                {milestone.completed ? (
                                  <CheckCircleIcon sx={{ color: 'white', fontSize: 18 }} />
                                ) : (
                                  <Typography sx={{ fontSize: 16 }}>{milestone.icon}</Typography>
                                )}
                              </Box>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: milestone.completed ? 600 : 400,
                                  color: milestone.completed ? 'text.primary' : 'text.secondary',
                                  fontSize: '0.95rem',
                                  lineHeight: 1.3
                                }}
                              >
                                {milestone.label}
                                {milestone.completed && ' ✅'}
                              </Typography>
                            </Box>
                          ))}
                        </Box>

                        {/* Right Side - Overall Progress */}
                        <Box sx={{ 
                          flex: '1 1 50%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          minWidth: 0
                        }}>
                          <Typography variant="h6" gutterBottom sx={{ 
                            textAlign: 'center', 
                            mb: 3,
                            fontSize: '1.1rem'
                          }}>
                            Overall Progress
                          </Typography>
                          <Box sx={{ width: '100%', maxWidth: 250 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={(milestones.filter(m => m.completed).length / milestones.length) * 100}
                              sx={{ 
                                height: 16, 
                                borderRadius: 8,
                                backgroundColor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 8,
                                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                                }
                              }}
                            />
                            <Typography variant="h4" color="primary" sx={{ 
                              mt: 2, 
                              textAlign: 'center', 
                              fontWeight: 700,
                              fontSize: '2rem'
                            }}>
                              {Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100)}%
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ 
                              textAlign: 'center',
                              mt: 1
                            }}>
                              Complete
                            </Typography>
                            
                            {/* Estimated time right under progress */}
                            <Typography variant="body2" color="textSecondary" sx={{ 
                              textAlign: 'center',
                              mt: 2,
                              fontWeight: 500
                            }}>
                              ⏱️ Time to complete: 30-45 seconds
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Educational Tips - Moved up */}
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 4,
                          bgcolor: 'info.50',
                          borderColor: 'info.200',
                          minHeight: 140,
                          width: '100%',
                          maxWidth: 700,
                          mb: 3
                        }}
                      >
                        <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                          💡 Resume Optimization Tips
                        </Typography>
                        <motion.div
                          key={currentTip}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Typography sx={{ fontSize: 36, mr: 3 }}>
                              {educationalTips[currentTip].icon}
                            </Typography>
                            <Box>
                              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.2rem' }}>
                                {educationalTips[currentTip].title}
                              </Typography>
                              <Typography variant="body1" color="textSecondary" sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
                                {educationalTips[currentTip].text}
                              </Typography>
                            </Box>
                          </Box>
                        </motion.div>
                        
                        {/* Tip indicators */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                          {educationalTips.map((_, index) => (
                            <Box
                              key={index}
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                backgroundColor: index === currentTip ? 'info.main' : 'grey.300',
                                mx: 0.5,
                                transition: 'all 0.3s ease'
                              }}
                            />
                          ))}
                        </Box>
                      </Paper>

                      {/* Back button for if user wants to cancel */}
                      <Box sx={{ mt: 2 }}>
                        <Button 
                          variant="outlined" 
                          onClick={() => {
                            // Reset processing state and go back to job description step
                            setIsPolling(false);
                            setIsSubmitting(false);
                            setJobStatus(null);
                            setStatusMessage('');
                            setJobId(null);
                            resetProcessingState();
                            // Stay on step 1 but show job description form instead of processing
                          }}
                          disabled={isSubmitting}
                        >
                          Cancel Optimization
                        </Button>
                      </Box>
                    </motion.div>
                  )}
                  
                  {activeStep === 2 && result && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="h5">
                          🎉 Your Optimized Resume is Ready!
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" paragraph>
                        Your resume has been successfully optimized for the job description.
                      </Typography>
                      
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 3, 
                          mb: 3,
                          bgcolor: 'success.50',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <DescriptionIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          Optimized Resume Ready for Download
                        </Typography>
                        <Typography variant="body2" color="textSecondary" align="center" paragraph>
                          Your resume has been optimized with relevant keywords and formatting
                          to improve your chances with Applicant Tracking Systems (ATS).
                        </Typography>
                        <Button 
                          variant="contained" 
                          color="success"
                          size="large"
                          startIcon={<DownloadIcon />}
                          onClick={downloadOptimizedResume}
                          sx={{ mt: 2 }}
                        >
                          📄 Download Optimized Resume
                        </Button>
                      </Paper>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button 
                          variant="outlined" 
                          onClick={resetForm}
                        >
                          Optimize Another Resume
                        </Button>
                        <Button 
                          variant="contained" 
                          color="primary"
                          startIcon={<DownloadIcon />}
                          onClick={downloadOptimizedResume}
                        >
                          Download Again
                        </Button>
                      </Box>
                    </motion.div>
                  )}
                  
                  {/* Decorative elements */}
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: -30, 
                      right: -30, 
                      width: 150, 
                      height: 150, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(45deg, rgba(63, 81, 181, 0.1), rgba(245, 0, 87, 0.1))',
                      zIndex: 0
                    }} 
                  />
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      bottom: -40, 
                      left: -40, 
                      width: 180, 
                      height: 180, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(45deg, rgba(245, 0, 87, 0.05), rgba(63, 81, 181, 0.05))',
                      zIndex: 0
                    }} 
                  />
                </Paper>
              </motion.div>
              
              <Box sx={{ mt: 6, textAlign: 'center' }}>
                <Divider sx={{ mb: 3, borderColor: 'rgba(10, 102, 194, 0.2)' }} />
                <Typography variant="body2" color="textSecondary" sx={{ color: '#666666' }}> {/* Changed to LinkedIn gray */}
                  Resume Optimizer Pro uses advanced AI to tailor your resume to specific job descriptions,
                  significantly increasing your chances of getting past Applicant Tracking Systems (ATS).
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1, color: '#666666' }}> {/* Changed to LinkedIn gray */}
                  Your data is processed securely with enterprise-grade encryption and not stored permanently.
                </Typography>
              </Box>
            </Container>
            
            {/* History Dialog */}
            <HistoryDialog
              open={historyDialogOpen}
              onClose={() => setHistoryDialogOpen(false)}
              user={user}
            />
            
            {/* Profile Dialog */}
            <ProfileDialog
              open={profileDialogOpen}
              onClose={() => setProfileDialogOpen(false)}
              user={user}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              setSnackbarMessage={setSnackbarMessage}
              setSnackbarOpen={setSnackbarOpen}
            />
            
            {/* Settings Dialog */}
            <SettingsDialog
              open={settingsDialogOpen}
              onClose={() => setSettingsDialogOpen(false)}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
            />
            
            {/* Delete Account Confirmation Dialog */}
            <Dialog 
              open={deleteConfirmDialogOpen} 
              onClose={handleCloseDeleteDialog} 
              maxWidth="sm" 
              fullWidth
            >
              <DialogTitle sx={{ 
                background: 'linear-gradient(45deg, #CC1016 30%, #FF4444 90%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center'
              }}>
                <DeleteForeverIcon sx={{ mr: 1 }} />
                Delete Account
              </DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
                  ⚠️ This action cannot be undone. Deleting your account will:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 3 }}>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Permanently delete your profile and account data
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Remove all your resume optimization history
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Cancel any active subscriptions or services
                  </Typography>
                  <Typography component="li" variant="body2">
                    Sign you out of all devices immediately
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                  To confirm deletion, please type <strong>DELETE</strong> in the field below:
                </Typography>
                <TextField
                  fullWidth
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#CC1016',
                      },
                    },
                  }}
                />
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button 
                  onClick={handleCloseDeleteDialog} 
                  variant="outlined"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeleteProfile} 
                  variant="contained"
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  sx={{
                    backgroundColor: '#CC1016',
                    '&:hover': {
                      backgroundColor: '#AA0E14',
                    },
                    '&:disabled': {
                      backgroundColor: '#CCCCCC',
                    }
                  }}
                  startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteForeverIcon />}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </Button>
              </DialogActions>
            </Dialog>
            
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert 
                onClose={() => setSnackbarOpen(false)} 
                severity={snackbarMessage.includes('Error') ? "error" : "success"}
                sx={{ width: '100%' }}
              >
                {snackbarMessage}
              </Alert>
            </Snackbar>
                  </Box>
                );
              }
              
              // If user is not authenticated, show landing page or authentication forms
              return (
                <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                  {/* Back to Landing Page Button - only show during authentication */}
                  {showAuth && (
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 20, 
                      left: 20, 
                      zIndex: 1000 
                    }}>
                      <Button
                        variant="outlined"
                        onClick={() => setShowAuth(false)}
                        sx={{
                          borderColor: '#0A66C2',
                          color: '#0A66C2',
                          '&:hover': {
                            borderColor: '#666666',
                            color: '#666666',
                            backgroundColor: 'rgba(10, 102, 194, 0.1)'
                          }
                        }}
                      >
                        ← Back to Home
                      </Button>
                    </Box>
                  )}
                  
                  {/* Show landing page or authentication forms based on showAuth state */}
                  {!showAuth ? (
                    <LandingPage 
                      onGetStarted={handleGetStarted}
                      onSignIn={handleSignIn}
                    />
                  ) : (
                    // Authentication forms are handled by Authenticator component
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      minHeight: '100vh',
                      pt: 8 // Add padding to avoid overlap with back button
                    }}>
                      {/* Authenticator component will render the forms here */}
                    </Box>
                  )}
                </Box>
              );
            }
          }}
        </Authenticator>
      </Box>
    </ThemeProvider>
  );
}

export default App;
