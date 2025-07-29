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
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
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
  Settings as SettingsIcon,
  HelpOutline as HelpOutlineIcon,
  ContactSupport as ContactSupportIcon
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
  const [faqsDialogOpen, setFaqsDialogOpen] = useState(false);
  const [contactUsDialogOpen, setContactUsDialogOpen] = useState(false);
  const [contactTitle, setContactTitle] = useState('');
  const [contactDescription, setContactDescription] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
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

  const handleContactSubmit = async () => {
    if (!contactTitle.trim() || !contactDescription.trim()) {
      return;
    }

    setIsSubmittingContact(true);
    
    try {
      // Simple contact form submission - you can integrate with your preferred service
      console.log('Contact form submitted:', {
        title: contactTitle,
        description: contactDescription,
        user: currentUser?.username || 'Anonymous'
      });
      
      // Close dialog and reset form
      setContactUsDialogOpen(false);
      setContactTitle('');
      setContactDescription('');
      
      // You could show a success message here
      alert('Thank you for your message! We\'ll get back to you soon.');
      
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('There was an issue sending your message. Please try again.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleStartCrafting = () => {
    navigate('/app/upload');
  };

  const features = [
    {
      icon: <PsychologyIcon sx={{ fontSize: 40, color: '#0A66C2' }} />,
      title: 'AI-Powered Crafting',
      description: 'Advanced AI analyzes your resume and crafts it for specific job descriptions and ATS systems.'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#0A66C2' }} />,
      title: '3x More Interviews',
      description: 'Our users get 3x more interview calls with professionally crafted resumes.'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#0A66C2' }} />,
      title: 'Instant Results',
      description: 'Get your crafted resume in under 60 seconds with our lightning-fast AI processing.'
    },
    {
      icon: <ShieldIcon sx={{ fontSize: 40, color: '#0A66C2' }} />,
      title: 'ATS Compatible',
      description: 'Ensure your resume passes Applicant Tracking Systems with our ATS enhancement technology.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Show loading state while checking authentication */}
      {isLoading ? (
        <LoadingScreen 
          message="Loading JobTailorAI..."
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
              JobTailorAI
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
                      onClick={handleStartCrafting}
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
                      Start Crafting
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
                        navigate('/app/profile');
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
                        setProfileMenuAnchor(null);
                        setFaqsDialogOpen(true);
                      }}>
                        <ListItemIcon>
                          <HelpOutlineIcon sx={{ color: '#0A66C2' }} />
                        </ListItemIcon>
                        <ListItemText primary="FAQs & Help" />
                      </MenuItem>
                      
                      <MenuItem onClick={() => {
                        setProfileMenuAnchor(null);
                        setContactUsDialogOpen(true);
                      }}>
                        <ListItemIcon>
                          <ContactSupportIcon sx={{ color: '#0A66C2' }} />
                        </ListItemIcon>
                        <ListItemText primary="Contact Us" />
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
                    : 'Land Your Dream Job with AI-Crafted Resumes'
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
                    ? 'Ready to craft another resume? Let\'s get started with your next career opportunity.'
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
                    {currentUser ? 'Continue Crafting' : 'Start Crafting Now'}
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
                          ✓ ATS Enhanced
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
          Why Choose JobTailorAI?
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
                  Get Crafted Resume
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666', lineHeight: 1.6 }}>
                  Download your professionally crafted resume, tailored specifically 
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
                  "JobTailorAI helped me land my dream job at a Fortune 500 company. 
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
                  "The ATS enhancement feature is incredible. My resume now passes 
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
              Join thousands of professionals who have successfully crafted their resumes
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
              {currentUser ? 'Continue Crafting' : 'Get Started Free'}
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
                  JobTailorAI
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
              © {new Date().getFullYear()} JobTailorAI. All rights reserved.
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

      {/* FAQs Dialog */}
      <Dialog
        open={faqsDialogOpen}
        onClose={() => setFaqsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: '#0A66C2',
          fontWeight: 600,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <HelpOutlineIcon sx={{ mr: 1 }} />
          Frequently Asked Questions
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Find answers to common questions about JobTailorAI features and functionality.
            </Typography>

            {/* General Usage */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
              🚀 General Usage
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Q: How does JobTailorAI work?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2 }}>
                A: Upload your resume, paste the job description you're applying for, and our AI will craft your resume to better match the job requirements. The AI analyzes keywords, skills, and requirements to enhance your resume's relevance.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Q: What file formats are supported for resume upload?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2 }}>
                A: We support PDF (.pdf), Microsoft Word (.docx), and plain text (.txt) files. Maximum file size is 5MB.
              </Typography>
            </Box>

            {/* Output Formats */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
              📄 Output Formats
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Q: What formats can I download my crafted resume in?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2 }}>
                A: You can download your crafted resume in Microsoft Word (.docx) or plain text (.txt) format. Word format preserves formatting and is recommended for most applications.
              </Typography>
            </Box>

            {/* Privacy & Security */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
              🔒 Privacy & Security
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Q: Is my resume data secure?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2 }}>
                A: Yes! We use AWS security best practices. Your resumes are processed securely and stored with encryption. We don't share your personal information with third parties.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Q: How long are my resumes stored?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2 }}>
                A: Saved resumes are stored in your profile until you delete them. Temporary processing files are automatically cleaned up after crafting. You have full control over your saved resume data.
              </Typography>
            </Box>

            {/* Contact */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
              📞 Need More Help?
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                If you can't find the answer to your question here, please contact our support team. We're here to help you get the most out of JobTailorAI!
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setFaqsDialogOpen(false)}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
              px: 4
            }}
          >
            Got It!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Us Dialog */}
      <Dialog
        open={contactUsDialogOpen}
        onClose={() => setContactUsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: '#0A66C2',
          fontWeight: 600,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <ContactSupportIcon sx={{ mr: 1 }} />
          Contact Us
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Have a question, suggestion, or need help with JobTailorAI? We'd love to hear from you! 
            Fill out the form below and we'll get back to you as soon as possible.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Subject *
            </Typography>
            <TextField
              fullWidth
              placeholder="Brief description of your inquiry"
              value={contactTitle}
              onChange={(e) => setContactTitle(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Message *
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Please provide details about your question or feedback..."
              value={contactDescription}
              onChange={(e) => setContactDescription(e.target.value)}
              variant="outlined"
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            * Required fields. We typically respond within 24 hours during business days.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button 
            onClick={() => {
              setContactUsDialogOpen(false);
              setContactTitle('');
              setContactDescription('');
            }}
            variant="outlined"
            disabled={isSubmittingContact}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleContactSubmit}
            variant="contained"
            disabled={isSubmittingContact || !contactTitle.trim() || !contactDescription.trim()}
            sx={{
              background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
              px: 4
            }}
          >
            {isSubmittingContact ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
        </>
      )}
    </Box>
  );
}
