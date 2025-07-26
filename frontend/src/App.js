import React, { useState, useEffect } from 'react';
import { getCurrentUser, signOut, fetchAuthSession, deleteUser } from 'aws-amplify/auth';
import SimpleAuth from './SimpleAuth';
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
  Stepper,
  Step,
  StepLabel,
  Alert,
  Snackbar,
  LinearProgress,
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
  Stack
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  AutoAwesome as AutoAwesomeIcon,
  Download as DownloadIcon,
  Logout as LogoutIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  DeleteForever as DeleteForeverIcon,
  PlayArrow as PlayArrowIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Shield as ShieldIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

// Create LinkedIn-inspired theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0A66C2',
      light: '#378FE9',
      dark: '#004182',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#666666',
      light: '#8C8C8C',
      dark: '#404040',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F3F2EF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: { fontWeight: 600, color: '#000000' },
    h2: { fontWeight: 600, color: '#000000' },
    h3: { fontWeight: 600, color: '#000000' },
    h4: { fontWeight: 600, color: '#000000' },
    h5: { fontWeight: 600, color: '#000000' },
    h6: { fontWeight: 600, color: '#000000' },
    body1: { color: '#000000', fontSize: '14px', lineHeight: 1.4 },
    body2: { color: '#666666', fontSize: '12px', lineHeight: 1.33 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '16px',
          padding: '8px 16px',
          borderRadius: '24px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          '&.MuiButton-containedPrimary': {
            background: '#0A66C2',
            color: '#ffffff',
            '&:hover': { background: '#004182' },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E0E0E0',
          boxShadow: '0 0 0 1px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.08)',
          borderRadius: '8px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#000000',
          boxShadow: '0 0 0 1px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.08)',
          borderBottom: 'none',
        },
      },
    },
  },
});

// Landing Page Component
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navigation Header */}
      <AppBar position="static" elevation={0}>
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
              sx={{ color: '#666666', '&:hover': { color: '#0A66C2' } }}
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
                  color: '#666666',
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
                </Stack>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Typography variant="h2" align="center" sx={{ 
          mb: 8,
          fontWeight: 700,
          background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Why Choose Resume Optimizer Pro?
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666', lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

// File upload component
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
        </Box>
      )}
    </Box>
  );
}
function App() {
  // Authentication state
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
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
  
  // UI state
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const steps = ['Upload Resume', 'Enter Job Description', 'Get Optimized Resume'];

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };

  // Handle authentication success
  const handleAuthSuccess = (authResult) => {
    setIsAuthenticated(true);
    setCurrentUser(authResult.user || authResult);
    setShowAuth(false);
  };

  // Handle sign out - return to landing page
  const handleSignOut = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setShowAuth(false);
      resetForm();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle landing page actions
  const handleGetStarted = () => {
    setShowAuth(true);
  };

  const handleSignIn = () => {
    setShowAuth(true);
  };

  const handleResumeChange = (file) => {
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB.`);
        setSnackbarMessage('File too large. Please choose a smaller file.');
        setSnackbarOpen(true);
        return;
      }
      
      setResumeName(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setResume(event.target.result);
      };
      reader.readAsDataURL(file);
      
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
    
    try {
      const payload = {
        resume: resume,
        jobDescription: jobDescription,
        outputFormat: 'word'
      };
      
      // For local development, use mock response
      if (window.location.hostname === 'localhost') {
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
        
        setTimeout(() => {
          setJobStatus('COMPLETED');
          setStatusMessage('Resume optimization completed (mock)');
          setResult({
            optimizedResume: 'This is a mock optimized resume for local testing.',
            optimizedResumeUrl: '#',
            contentType: 'text/plain',
            fileType: 'txt'
          });
          setIsPolling(false);
          setActiveStep(2);
        }, 5000);
        
        return;
      }
      
      const { tokens } = await fetchAuthSession();
      const idToken = tokens.idToken.toString();
      
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
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      if (responseData && responseData.jobId) {
        setJobId(responseData.jobId);
        setJobStatus(responseData.status || 'PROCESSING');
        setStatusMessage(responseData.message || 'Job submitted and processing started');
        setIsPolling(true);
        setIsSubmitting(false);
      } else {
        throw new Error('No job ID returned from the API');
      }
    } catch (error) {
      console.error('Error submitting job:', error);
      setError(`Error submitting job: ${error.message}`);
      setSnackbarMessage(`Error: ${error.message}`);
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
      if (window.location.hostname === 'localhost' && result.optimizedResumeUrl === '#') {
        const blob = new Blob([result.optimizedResume], { type: result.contentType || 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `optimized_resume.${result.fileType || 'txt'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }
      
      const { tokens } = await fetchAuthSession();
      const idToken = tokens.idToken.toString();
      
      const resumeResponse = await fetch(result.optimizedResumeUrl, {
        method: 'GET',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (!resumeResponse.ok) {
        throw new Error(`Failed to fetch optimized resume: ${resumeResponse.status}`);
      }
      
      const responseText = await resumeResponse.text();
      const binaryString = atob(responseText);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const contentType = result.contentType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const blob = new Blob([bytes], { type: contentType });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.downloadFilename || `optimized_resume.${result.fileType || 'docx'}`;
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
  };

  const handleDeleteProfile = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setSnackbarMessage('Please type "DELETE" to confirm account deletion');
      setSnackbarOpen(true);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUser();
      setSnackbarMessage('Account successfully deleted. You will be signed out.');
      setSnackbarOpen(true);
      setDeleteConfirmDialogOpen(false);
      setDeleteConfirmText('');
      
      setTimeout(() => {
        handleSignOut();
      }, 2000);
      
    } catch (error) {
      console.error('Error deleting account:', error);
      setSnackbarMessage(`Error deleting account: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const isProcessing = isSubmitting || isPolling;

  // Main app render
  return (
    <ThemeProvider theme={theme}>
      {!isAuthenticated ? (
        showAuth ? (
          <SimpleAuth 
            onAuthSuccess={handleAuthSuccess}
            onCancel={() => setShowAuth(false)}
          />
        ) : (
          <LandingPage 
            onGetStarted={handleGetStarted}
            onSignIn={handleSignIn}
          />
        )
      ) : (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          {/* Header */}
          <AppBar position="static" elevation={0}>
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
                  color: '#666666',
                  display: { xs: 'none', sm: 'block' }
                }}>
                  Welcome, {currentUser?.username || 'User'}
                </Typography>
                <IconButton
                  onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
                  sx={{ 
                    p: 0,
                    border: '2px solid #0A66C2',
                    '&:hover': { border: '2px solid #666666' }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: '#0A66C2',
                      width: 40,
                      height: 40,
                      fontSize: '1rem',
                      fontWeight: 600
                    }}
                  >
                    {(currentUser?.username || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                
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
                    setDeleteConfirmDialogOpen(true);
                    setProfileMenuAnchor(null);
                  }}>
                    <ListItemIcon>
                      <DeleteForeverIcon sx={{ color: '#CC1016' }} />
                    </ListItemIcon>
                    <ListItemText primary="Delete Account" sx={{ color: '#CC1016' }} />
                  </MenuItem>
                  <MenuItem onClick={() => {
                    setProfileMenuAnchor(null);
                    handleSignOut();
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
          
          {/* WIDE Main Content Container */}
          <Container maxWidth="xl" sx={{ py: 6 }}>
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
                sx={{ mb: 4, fontWeight: 400, color: '#666666' }}
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
              {/* WIDE Paper Container */}
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 6,
                  borderRadius: 3,
                  mb: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '600px'
                }}
              >
                {activeStep === 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                      Upload Your Resume
                    </Typography>
                    <Typography variant="body1" color="textSecondary" paragraph sx={{ mb: 4 }}>
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
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        endIcon={<ArrowForwardIcon />}
                        disabled={!resume}
                        onClick={() => setActiveStep(1)}
                        size="large"
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
                  >
                    <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                      Enter Job Description
                    </Typography>
                    <Typography variant="body1" color="textSecondary" paragraph sx={{ mb: 4 }}>
                      Paste the job description you want to optimize your resume for.
                    </Typography>
                    
                    <TextField
                      label="Job Description"
                      multiline
                      rows={12}
                      fullWidth
                      variant="outlined"
                      value={jobDescription}
                      onChange={handleJobDescriptionChange}
                      placeholder="Paste job description here..."
                      sx={{ mb: 4 }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => setActiveStep(0)}
                        size="large"
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
                          backgroundColor: '#0A66C2',
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: '16px',
                          borderRadius: '24px',
                          padding: '12px 32px',
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: '#004182',
                          }
                        }}
                      >
                        Optimize Resume
                      </Button>
                    </Box>
                  </motion.div>
                )}
                
                {/* Processing Screen */}
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
                      minHeight: '500px'
                    }}
                  >
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                      🤖 Optimizing Your Resume
                    </Typography>
                    <Typography variant="h6" color="textSecondary" paragraph sx={{ mb: 4 }}>
                      Our AI is analyzing your resume and tailoring it to the job description.
                    </Typography>
                    
                    <Box sx={{ width: '100%', maxWidth: 400, mb: 4 }}>
                      <LinearProgress 
                        variant="indeterminate"
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)'
                          }
                        }}
                      />
                      <Typography variant="body2" color="textSecondary" sx={{ 
                        textAlign: 'center',
                        mt: 2
                      }}>
                        ⏱️ This typically takes 30-60 seconds...
                      </Typography>
                    </Box>

                    <Button 
                      variant="outlined" 
                      onClick={() => {
                        setIsPolling(false);
                        setIsSubmitting(false);
                        setJobStatus(null);
                        setStatusMessage('');
                        setJobId(null);
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel Optimization
                    </Button>
                  </motion.div>
                )}
                
                {activeStep === 2 && result && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                      <CheckCircleIcon color="success" sx={{ mr: 2, fontSize: 32 }} />
                      <Typography variant="h3" sx={{ fontWeight: 600 }}>
                        🎉 Your Optimized Resume is Ready!
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" paragraph sx={{ mb: 4 }}>
                      Your resume has been successfully optimized for the job description.
                    </Typography>
                    
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 4, 
                        mb: 4,
                        bgcolor: 'success.50',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <DescriptionIcon sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                        Optimized Resume Ready for Download
                      </Typography>
                      <Typography variant="body1" color="textSecondary" align="center" paragraph>
                        Your resume has been optimized with relevant keywords and formatting
                        to improve your chances with Applicant Tracking Systems (ATS).
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="success"
                        size="large"
                        startIcon={<DownloadIcon />}
                        onClick={downloadOptimizedResume}
                        sx={{ mt: 2, px: 4, py: 2, fontSize: '18px' }}
                      >
                        📄 Download Optimized Resume
                      </Button>
                    </Paper>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Button 
                        variant="outlined" 
                        onClick={resetForm}
                        size="large"
                      >
                        Optimize Another Resume
                      </Button>
                      <Button 
                        variant="contained" 
                        color="primary"
                        startIcon={<DownloadIcon />}
                        onClick={downloadOptimizedResume}
                        size="large"
                      >
                        Download Again
                      </Button>
                    </Box>
                  </motion.div>
                )}
              </Paper>
            </motion.div>
          </Container>
          
          {/* Delete Account Dialog */}
          <Dialog 
            open={deleteConfirmDialogOpen} 
            onClose={() => setDeleteConfirmDialogOpen(false)} 
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
                ⚠️ This action cannot be undone. To confirm deletion, please type <strong>DELETE</strong>:
              </Typography>
              <TextField
                fullWidth
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                variant="outlined"
              />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => setDeleteConfirmDialogOpen(false)} 
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
                  '&:hover': { backgroundColor: '#AA0E14' }
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
      )}
    </ThemeProvider>
  );
}

export default App;
