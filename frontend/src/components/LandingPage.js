import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut, fetchAuthSession } from 'aws-amplify/auth';
import ProfileDialog from './ProfileDialog';
import SettingsDialog from './SettingsDialog';
import LoadingScreen from './LoadingScreen';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  AppBar,
  Toolbar,
  Grid,
  Card,
  CardContent,
  Stack,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Link
} from '@mui/material';
import { 
  AutoAwesome as AutoAwesomeIcon,
  PlayArrow as PlayArrowIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Shield as ShieldIcon,
  Psychology as PsychologyIcon,
  Logout as LogoutIcon,
  WorkOutline as WorkIcon,
  Person as PersonIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export function LandingPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userAttributes, setUserAttributes] = useState(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [authDataLoaded, setAuthDataLoaded] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    loadUser();
  }, []);

  const getDisplayName = () => {
    // Try to get the first name from user attributes
    if (userAttributes?.given_name) {
      return userAttributes.given_name;
    }
    // Try other common attribute names
    if (userAttributes?.name) {
      return userAttributes.name.split(' ')[0]; // Get first part of full name
    }
    if (userAttributes?.['custom:firstName']) {
      return userAttributes['custom:firstName'];
    }
    // Fallback to username without email domain
    if (currentUser?.username) {
      return currentUser.username.split('@')[0];
    }
    return 'User';
  };

  const loadUser = async () => {
    try {
      setIsLoading(true);
      setAuthDataLoaded(false);
      
      const user = await getCurrentUser();
      console.log('LandingPage - User loaded:', user);
      
      // Try to get user attributes which might contain the first name
      let attributes = null;
      try {
        const { fetchUserAttributes } = await import('aws-amplify/auth');
        attributes = await fetchUserAttributes();
        console.log('LandingPage - User attributes from fetchUserAttributes:', attributes);
      } catch (attrError) {
        console.log('LandingPage - Could not fetch user attributes:', attrError);
      }
      
      // Set both user and attributes together to prevent flickering
      setCurrentUser(user);
      setUserAttributes(attributes);
      setAuthDataLoaded(true);
      
    } catch (error) {
      console.log('LandingPage - No user found:', error.message);
      setCurrentUser(null);
      setUserAttributes(null);
      setAuthDataLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      setProfileMenuAnchor(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleGetStarted = () => {
    if (currentUser) {
      navigate('/app/upload');
    } else {
      navigate('/auth');
    }
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleStartOptimizing = () => {
    navigate('/app/upload');
  };

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
      {/* Show loading state while checking authentication */}
      {isLoading ? (
        <LoadingScreen 
          message="Loading Resume Optimizer..."
          subtitle="Preparing your professional workspace"
        />
      ) : (
        <>
          {/* Navigation Header */}
          <AppBar position="static" elevation={0}>
            <Toolbar sx={{ py: 1 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
                onClick={() => navigate('/')}
          >
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
            {(() => {
              if (isLoading) {
                return <CircularProgress size={24} />;
              } else if (currentUser) {
                return (
                  <>
                    <Button 
                      variant="contained" 
                      onClick={handleStartOptimizing}
                      sx={{
                        background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                        color: 'white',
                        fontWeight: 600,
                        px: 3,
                        mr: 2,
                        '&:hover': {
                          background: 'linear-gradient(45deg, #004182 30%, #0A66C2 90%)',
                        }
                      }}
                    >
                      Start Optimizing
                    </Button>
                    <Typography variant="body2" sx={{ 
                      color: '#666666',
                      display: { xs: 'none', sm: 'block' }
                    }}>
                      {(currentUser && authDataLoaded) ? `Welcome, ${getDisplayName()}` : ''}
                    </Typography>
                    <IconButton
                      onClick={(e) => {
                        console.log('Avatar clicked!', e.currentTarget);
                        setProfileMenuAnchor(e.currentTarget);
                      }}
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
                          bgcolor: '#0A66C2', 
                          width: 40, 
                          height: 40,
                          fontSize: '1rem',
                          fontWeight: 600
                        }}
                      >
                        {(currentUser && authDataLoaded) ? getDisplayName().charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                    </IconButton>
                    
                    {/* Profile Menu */}
                    <Menu
                      anchorEl={profileMenuAnchor}
                      open={Boolean(profileMenuAnchor)}
                      onClose={() => {
                        console.log('Menu closing');
                        setProfileMenuAnchor(null);
                      }}
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
                        setProfileMenuAnchor(null);
                        setProfileDialogOpen(true);
                      }}>
                        <ListItemIcon>
                          <PersonIcon sx={{ color: '#0A66C2' }} />
                        </ListItemIcon>
                        <ListItemText primary="Profile" />
                      </MenuItem>
                      
                      <MenuItem onClick={() => {
                        setProfileMenuAnchor(null);
                        setSettingsDialogOpen(true);
                      }}>
                        <ListItemIcon>
                          <SettingsIcon sx={{ color: '#0A66C2' }} />
                        </ListItemIcon>
                        <ListItemText primary="Settings & Privacy" />
                      </MenuItem>
                      
                      <MenuItem onClick={() => {
                        console.log('Sign Out clicked');
                        setProfileMenuAnchor(null);
                        handleSignOut();
                      }}>
                        <ListItemIcon>
                          <LogoutIcon sx={{ color: '#0A66C2' }} />
                        </ListItemIcon>
                        <ListItemText primary="Sign Out" />
                      </MenuItem>
                    </Menu>
                  </>
                );
              } else {
                return (
                  <>
                    <Button 
                      color="inherit" 
                      onClick={handleSignIn}
                      sx={{ color: '#666666', '&:hover': { color: '#0A66C2' } }}
                    >
                      Sign In
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={handleGetStarted}
                      sx={{
                        background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #004182 30%, #0A66C2 90%)',
                        }
                      }}
                    >
                      Get Started Free
                    </Button>
                  </>
                );
              }
            })()}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2a2a2a 100%)',
        py: 12,
        position: 'relative',
        overflow: 'hidden',
        // Add keyframes for animations
        '& @keyframes pulse': {
          '0%, 100%': {
            opacity: 1,
            transform: 'scale(1)'
          },
          '50%': {
            opacity: 0.7,
            transform: 'scale(1.1)'
          }
        }
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
                  lineHeight: 1.2,
                  textAlign: { xs: 'center', md: 'left' }
                }}>
                  {(currentUser && authDataLoaded)
                    ? `Welcome back, ${getDisplayName()}!`
                    : 'Land Your Dream Job with AI-Optimized Resumes'
                  }
                </Typography>
                <Typography variant="h5" sx={{ 
                  color: '#cccccc',
                  mb: 4, 
                  fontWeight: 400,
                  lineHeight: 1.4,
                  textAlign: { xs: 'center', md: 'left' }
                }}>
                  {currentUser
                    ? 'Ready to optimize another resume? Let\'s get started with your next career opportunity.'
                    : 'Transform your resume in seconds with our advanced AI technology. Get past ATS systems and land 3x more interviews.'
                  }
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, mb: 4 }}>
                  <Button 
                    variant="contained" 
                    size="large"
                    onClick={handleGetStarted}
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
                    {currentUser ? 'Continue Optimizing' : 'Start Optimizing Now'}
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            
            {/* Resume Transformation Mockup */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box sx={{ 
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  height: { xs: '450px', md: '550px' },
                  pt: 2
                }}>
                  {/* Labels Row */}
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    maxWidth: '500px',
                    mb: 1
                  }}>
                    <Box sx={{
                      bgcolor: '#ff6b6b',
                      color: 'white',
                      px: 2,
                      py: 0.7,
                      borderRadius: 1,
                      fontSize: '11px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
                    }}>
                      BEFORE
                    </Box>
                    <Box sx={{
                      bgcolor: '#4caf50',
                      color: 'white',
                      px: 2,
                      py: 0.7,
                      borderRadius: 1,
                      fontSize: '11px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                    }}>
                      AFTER
                    </Box>
                  </Box>
                  
                  {/* Resume Mockups Row */}
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 3
                  }}>
                  {/* Before Resume */}
                  <motion.div
                    initial={{ scale: 1, x: 0 }}
                    animate={{ scale: 0.9, x: -20 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: 1 }}
                  >
                    <Box sx={{
                      width: '220px',
                      height: '320px',
                      bgcolor: '#f9f9f9',
                      borderRadius: 2,
                      border: '2px solid #ddd',
                      position: 'relative',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      overflow: 'hidden',
                      p: 1.5
                    }}>
                      {/* Header */}
                      <Box sx={{ mb: 1, textAlign: 'center', borderBottom: '1px solid #ccc', pb: 1 }}>
                        <Typography sx={{ 
                          fontSize: '11px', 
                          fontWeight: 'bold', 
                          color: '#333',
                          mb: 0.3
                        }}>
                          JOHN SMITH
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '8px', 
                          color: '#666',
                          mb: 0.3
                        }}>
                          Data Engineer
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '7px', 
                          color: '#888'
                        }}>
                          john.smith@email.com | (555) 123-4567
                        </Typography>
                      </Box>
                      
                      {/* Summary Section */}
                      <Box sx={{ mb: 1.2 }}>
                        <Typography sx={{ 
                          fontSize: '8px', 
                          fontWeight: 'bold', 
                          color: '#333',
                          mb: 0.5,
                          textDecoration: 'underline'
                        }}>
                          SUMMARY
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '6.5px', 
                          color: '#555',
                          lineHeight: 1.3
                        }}>
                          Experienced data engineer with background in ETL processes and database management.
                        </Typography>
                      </Box>

                      {/* Experience Section */}
                      <Box sx={{ mb: 1.2 }}>
                        <Typography sx={{ 
                          fontSize: '8px', 
                          fontWeight: 'bold', 
                          color: '#333',
                          mb: 0.5,
                          textDecoration: 'underline'
                        }}>
                          EXPERIENCE
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '7px', 
                          fontWeight: 'bold',
                          color: '#444',
                          mb: 0.3
                        }}>
                          Data Engineer - Tech Corp
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '6.5px', 
                          color: '#555',
                          lineHeight: 1.2,
                          mb: 0.3
                        }}>
                          • Built ETL pipelines using Python and SQL
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '6.5px', 
                          color: '#555',
                          lineHeight: 1.2,
                          mb: 0.3
                        }}>
                          • Managed data warehouses and databases
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '6.5px', 
                          color: '#555',
                          lineHeight: 1.2,
                          mb: 0.3
                        }}>
                          • Performed data analysis and reporting
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '6.5px', 
                          color: '#555',
                          lineHeight: 1.2
                        }}>
                          • Collaborated with development teams
                        </Typography>
                      </Box>

                      {/* Skills Section */}
                      <Box sx={{ mb: 1 }}>
                        <Typography sx={{ 
                          fontSize: '8px', 
                          fontWeight: 'bold', 
                          color: '#333',
                          mb: 0.5,
                          textDecoration: 'underline'
                        }}>
                          TECHNICAL SKILLS
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '6.5px', 
                          color: '#555',
                          lineHeight: 1.3
                        }}>
                          Python, SQL, PostgreSQL, MySQL, Hadoop, Spark, Airflow, Git, Linux
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>

                  {/* Transformation Arrow */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.7 }}
                    animate={{ scale: 1.2, opacity: 1 }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                    style={{ margin: '0 25px', zIndex: 2 }}
                  >
                    <AutoAwesomeIcon sx={{ 
                      fontSize: 45, 
                      color: '#0A66C2',
                      filter: 'drop-shadow(0 0 15px rgba(10, 102, 194, 0.6))'
                    }} />
                  </motion.div>

                  {/* After Resume */}
                  <motion.div
                    initial={{ scale: 1, x: 0 }}
                    animate={{ scale: 1.1, x: 20 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: 1 }}
                  >
                    <Box sx={{
                      width: '220px',
                      height: '320px',
                      bgcolor: 'white',
                      borderRadius: 2,
                      border: '2px solid #0A66C2',
                      position: 'relative',
                      boxShadow: '0 8px 30px rgba(10, 102, 194, 0.3)',
                      overflow: 'hidden',
                      p: 1.5
                    }}>
                      {/* Header */}
                      <Box sx={{ mb: 1, textAlign: 'center', bgcolor: '#f8fbff', mx: -1.5, mt: -1.5, p: 1.5, borderBottom: '2px solid #0A66C2' }}>
                        <Typography sx={{ 
                          fontSize: '11px', 
                          fontWeight: 'bold', 
                          color: '#0A66C2',
                          mb: 0.3
                        }}>
                          JOHN SMITH
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '8px', 
                          color: '#0A66C2',
                          fontWeight: 'bold',
                          mb: 0.3
                        }}>
                          AI/ML Developer & Data Scientist
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '7px', 
                          color: '#378FE9'
                        }}>
                          john.smith@email.com | (555) 123-4567
                        </Typography>
                      </Box>
                      
                      {/* Summary Section */}
                      <Box sx={{ mb: 1.2 }}>
                        <Typography sx={{ 
                          fontSize: '8px', 
                          fontWeight: 'bold', 
                          color: '#0A66C2',
                          mb: 0.5,
                          borderBottom: '1px solid #0A66C2',
                          pb: 0.2
                        }}>
                          PROFESSIONAL SUMMARY
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '6.5px', 
                          color: '#333',
                          lineHeight: 1.3
                        }}>
                          AI/ML Developer with expertise in machine learning, deep learning, and data science. Proven track record in developing intelligent systems and predictive models.
                        </Typography>
                      </Box>

                      {/* Experience Section */}
                      <Box sx={{ mb: 1.2 }}>
                        <Typography sx={{ 
                          fontSize: '8px', 
                          fontWeight: 'bold', 
                          color: '#0A66C2',
                          mb: 0.5,
                          borderBottom: '1px solid #0A66C2',
                          pb: 0.2
                        }}>
                          PROFESSIONAL EXPERIENCE
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '7px', 
                          fontWeight: 'bold',
                          color: '#0A66C2',
                          mb: 0.3
                        }}>
                          AI/ML Developer - Tech Corp
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '6.5px', 
                          color: '#333',
                          lineHeight: 1.2,
                          mb: 0.3
                        }}>
                          • Developed ML pipelines using TensorFlow & PyTorch
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '6.5px', 
                          color: '#333',
                          lineHeight: 1.2,
                          mb: 0.3
                        }}>
                          • Built predictive models with 95% accuracy
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '6.5px', 
                          color: '#333',
                          lineHeight: 1.2,
                          mb: 0.3
                        }}>
                          • Implemented NLP and computer vision solutions
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '6.5px', 
                          color: '#333',
                          lineHeight: 1.2
                        }}>
                          • Led AI initiatives across cross-functional teams
                        </Typography>
                      </Box>

                      {/* Skills Section */}
                      <Box sx={{ mb: 1 }}>
                        <Typography sx={{ 
                          fontSize: '8px', 
                          fontWeight: 'bold', 
                          color: '#0A66C2',
                          mb: 0.5,
                          borderBottom: '1px solid #0A66C2',
                          pb: 0.2
                        }}>
                          CORE COMPETENCIES
                        </Typography>
                        <Typography sx={{ 
                          fontSize: '6.5px', 
                          color: '#333',
                          lineHeight: 1.3
                        }}>
                          Python, TensorFlow, PyTorch, Scikit-learn, Keras, Neural Networks, Deep Learning, NLP, Computer Vision, MLOps, AWS SageMaker
                        </Typography>
                      </Box>
                      
                      {/* AI Keywords Highlight */}
                      <Box sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 0.5
                      }}>
                        <Box sx={{
                          fontSize: '6px',
                          color: '#4caf50',
                          fontWeight: 'bold',
                          bgcolor: 'rgba(76, 175, 80, 0.1)',
                          px: 0.5,
                          py: 0.2,
                          borderRadius: 0.5
                        }}>
                          ✓ ATS Optimized
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {[...Array(4)].map((_, i) => (
                            <Box key={i} sx={{
                              width: '5px',
                              height: '5px',
                              bgcolor: '#4caf50',
                              borderRadius: '50%',
                              animation: `pulse 1.5s ease-in-out infinite ${i * 0.2}s`
                            }} />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </motion.div>
                  </Box>
                  
                  {/* Stats Below Mockup */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: 4, 
                  mt: 3,
                  flexWrap: 'wrap'
                }}>
                  {[
                    { number: '3x', label: 'More Interviews' },
                    { number: '95%', label: 'ATS Compatible' },
                    { number: '30-45s', label: 'Processing Time' }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1 + index * 0.2 }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ 
                          color: '#0A66C2', 
                          fontWeight: 'bold',
                          mb: 0.5
                        }}>
                          {stat.number}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: '#cccccc',
                          fontSize: '12px'
                        }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
                </Box>
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

      {/* How It Works Section */}
      <Box sx={{ bgcolor: '#F8F9FA', py: 12 }}>
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" sx={{ 
            mb: 8,
            fontWeight: 700,
            color: '#0A66C2'
          }}>
            How It Works
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: '#0A66C2', 
                  mx: 'auto', 
                  mb: 3,
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  1
                </Avatar>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  Upload Your Resume
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666', lineHeight: 1.6 }}>
                  Simply drag and drop your existing resume or upload it directly. 
                  We support PDF, Word, and text formats.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: '#0A66C2', 
                  mx: 'auto', 
                  mb: 3,
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  2
                </Avatar>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  Add Job Description
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666', lineHeight: 1.6 }}>
                  Paste the job description you're applying for. Our AI will analyze 
                  the requirements and keywords.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: '#0A66C2', 
                  mx: 'auto', 
                  mb: 3,
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  3
                </Avatar>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  Get Optimized Resume
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666', lineHeight: 1.6 }}>
                  Download your professionally optimized resume, tailored specifically 
                  for the job you want.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Typography variant="h2" align="center" sx={{ 
          mb: 8,
          fontWeight: 700,
          background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          What Our Users Say
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', p: 3 }}>
              <CardContent>
                <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic', lineHeight: 1.6 }}>
                  "Resume Optimizer Pro helped me land my dream job at a Fortune 500 company. 
                  The AI suggestions were spot-on and made my resume stand out."
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#0A66C2', mr: 2 }}>S</Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Sarah Johnson
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666666' }}>
                      Software Engineer at Microsoft
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', p: 3 }}>
              <CardContent>
                <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic', lineHeight: 1.6 }}>
                  "I was struggling to get interviews until I used this tool. 
                  Now I'm getting callbacks from top companies. Highly recommended!"
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#0A66C2', mr: 2 }}>M</Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Michael Chen
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666666' }}>
                      Product Manager at Google
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', p: 3 }}>
              <CardContent>
                <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic', lineHeight: 1.6 }}>
                  "The ATS optimization feature is incredible. My resume now passes 
                  through applicant tracking systems with ease."
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#0A66C2', mr: 2 }}>E</Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Emily Rodriguez
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666666' }}>
                      Marketing Director at Amazon
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ 
        bgcolor: 'linear-gradient(135deg, #0A66C2 0%, #378FE9 100%)', 
        py: 12,
        color: 'white'
      }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" sx={{ 
              mb: 3,
              fontWeight: 700
            }}>
              Ready to Land Your Dream Job?
            </Typography>
            <Typography variant="h5" sx={{ 
              mb: 6,
              opacity: 0.9,
              fontWeight: 300
            }}>
              Join thousands of professionals who have successfully optimized their resumes
            </Typography>
            <Button 
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                bgcolor: 'white',
                color: '#0A66C2',
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
                }
              }}
            >
              {currentUser ? 'Continue Optimizing' : 'Get Started Free'}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1a1a1a', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <WorkIcon sx={{ fontSize: 32, mr: 2, color: '#0A66C2' }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
                  Resume Optimizer Pro
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#cccccc', lineHeight: 1.6, mb: 3 }}>
                Powered by advanced AI technology to help professionals create 
                compelling resumes that get noticed by employers and pass ATS systems.
              </Typography>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'white' }}>
                Product
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link href="#" sx={{ color: '#cccccc', textDecoration: 'none', '&:hover': { color: '#0A66C2' } }}>
                  Features
                </Link>
                <Link href="#" sx={{ color: '#cccccc', textDecoration: 'none', '&:hover': { color: '#0A66C2' } }}>
                  How it Works
                </Link>
                <Link href="#" sx={{ color: '#cccccc', textDecoration: 'none', '&:hover': { color: '#0A66C2' } }}>
                  Testimonials
                </Link>
              </Box>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'white' }}>
                Support
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link href="#" sx={{ color: '#cccccc', textDecoration: 'none', '&:hover': { color: '#0A66C2' } }}>
                  Help Center
                </Link>
                <Link href="#" sx={{ color: '#cccccc', textDecoration: 'none', '&:hover': { color: '#0A66C2' } }}>
                  Contact Us
                </Link>
                <Link href="#" sx={{ color: '#cccccc', textDecoration: 'none', '&:hover': { color: '#0A66C2' } }}>
                  FAQ
                </Link>
              </Box>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'white' }}>
                Legal
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link href="#" sx={{ color: '#cccccc', textDecoration: 'none', '&:hover': { color: '#0A66C2' } }}>
                  Privacy Policy
                </Link>
                <Link href="#" sx={{ color: '#cccccc', textDecoration: 'none', '&:hover': { color: '#0A66C2' } }}>
                  Terms of Service
                </Link>
                <Link href="#" sx={{ color: '#cccccc', textDecoration: 'none', '&:hover': { color: '#0A66C2' } }}>
                  Cookie Policy
                </Link>
              </Box>
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'white' }}>
                Connect
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link href="#" sx={{ color: '#cccccc', textDecoration: 'none', '&:hover': { color: '#0A66C2' } }}>
                  LinkedIn
                </Link>
                <Link href="#" sx={{ color: '#cccccc', textDecoration: 'none', '&:hover': { color: '#0A66C2' } }}>
                  Twitter
                </Link>
                <Link href="#" sx={{ color: '#cccccc', textDecoration: 'none', '&:hover': { color: '#0A66C2' } }}>
                  Blog
                </Link>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ 
            borderTop: '1px solid #333333', 
            mt: 6, 
            pt: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="body2" sx={{ color: '#cccccc' }}>
              © {new Date().getFullYear()} Resume Optimizer Pro. All rights reserved.
            </Typography>
            <Typography variant="body2" sx={{ color: '#cccccc' }}>
              Built with AWS and React
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Profile Dialog */}
      <ProfileDialog 
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
      />

      {/* Settings Dialog */}
      <SettingsDialog 
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        onSettingsChange={() => {}} // Empty callback since LandingPage doesn't need to track settings
      />
        </>
      )}
    </Box>
  );
}
