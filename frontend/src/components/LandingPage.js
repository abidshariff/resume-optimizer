import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut, fetchAuthSession } from 'aws-amplify/auth';
import { useLoading } from '../contexts/LoadingContext';
import ProfileDialog from './ProfileDialog';
import SettingsDialog from './SettingsDialog';
import LoadingScreen from './LoadingScreen';
import MobileResumeMockups from './MobileResumeMockups';
import MobileStats from './MobileStats';
import Logger from '../utils/logger';
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
  TextField,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  PlayArrow as PlayArrowIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Shield as ShieldIcon,
  Psychology as PsychologyIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  HelpOutline as HelpOutlineIcon,
  ContactSupport as ContactSupportIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export function LandingPage() {
  const navigate = useNavigate();
  const { showLoading, hideLoading, isLoading: globalLoading, loadingMessage, loadingSubtitle } = useLoading();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
  const [isSigningOut, setIsSigningOut] = useState(false); // Keep for menu button state
  
  // Additional dialog states for footer links
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [cookieDialogOpen, setCookieDialogOpen] = useState(false);
  const [helpCenterDialogOpen, setHelpCenterDialogOpen] = useState(false);

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
      Logger.log('LandingPage - User loaded:', user);
      
      // Try to get user attributes which might contain the first name
      let attributes = null;
      try {
        const { fetchUserAttributes } = await import('aws-amplify/auth');
        attributes = await fetchUserAttributes();
        Logger.log('LandingPage - User attributes from fetchUserAttributes:', attributes);
      } catch (attrError) {
        Logger.log('LandingPage - Could not fetch user attributes:', attrError);
      }
      
      // Set both user and attributes together to prevent flickering
      setCurrentUser(user);
      setUserAttributes(attributes);
      setAuthDataLoaded(true);
      
    } catch (error) {
      Logger.log('LandingPage - No user found:', error.message);
      setCurrentUser(null);
      setUserAttributes(null);
      setAuthDataLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true); // For menu button loading state
      await signOut();
      
      // Show global loading screen with progress bar
      showLoading("Signing out...", "Thanks for using JobTailorAI!", 2500);
      
      // Reset state after loading completes
      setTimeout(() => {
        setCurrentUser(null);
        setUserAttributes(null);
        setProfileMenuAnchor(null);
        setIsSigningOut(false);
      }, 2500);
    } catch (error) {
      Logger.error('Error signing out:', error);
      setIsSigningOut(false);
      hideLoading();
    }
  };

  const handleGetStarted = () => {
    if (currentUser) {
      showLoading("Loading workspace...", "Preparing your resume tools", 1500);
      setTimeout(() => {
        navigate('/app/upload');
      }, 1500);
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
      Logger.log('Contact form submitted:', {
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
      Logger.error('Error submitting contact form:', error);
      alert('There was an issue sending your message. Please try again.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleStartCrafting = () => {
    showLoading("Starting resume crafting...", "Get ready to optimize your career", 1500);
    setTimeout(() => {
      navigate('/app/upload');
    }, 1500);
  };

  const features = [
    {
      icon: <PsychologyIcon sx={{ fontSize: 40, color: '#0A66C2' }} />,
      title: 'AI-Powered Job Matching',
      description: 'Advanced AI analyzes job descriptions and crafts your resume to match specific requirements, keywords, and company culture.'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#0A66C2' }} />,
      title: 'Real-Time Preview',
      description: 'See your crafted resume instantly with our live preview feature. Review formatting and content before downloading.'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#0A66C2' }} />,
      title: 'Side-by-Side Compare',
      description: 'Compare your original resume with the AI-crafted version to see exactly what improvements were made.'
    },
    {
      icon: <ShieldIcon sx={{ fontSize: 40, color: '#0A66C2' }} />,
      title: 'Multiple Download Formats',
      description: 'Download your crafted resume in Word (.docx) or text format, perfectly formatted for any application.'
    },
    {
      icon: <Box sx={{ 
        width: 40, 
        height: 40, 
        borderRadius: '50%', 
        bgcolor: '#0A66C2', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '18px'
      }}>AI</Box>,
      title: 'ATS Optimization',
      description: 'Ensure your resume passes Applicant Tracking Systems with keyword optimization and proper formatting.'
    },
    {
      icon: <Box sx={{ 
        width: 40, 
        height: 40, 
        borderRadius: '50%', 
        bgcolor: '#0A66C2', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '18px'
      }}>JT</Box>,
      title: 'Job-Specific Tailoring',
      description: 'Each resume is uniquely crafted for the specific job you\'re applying to, not generic templates.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Show loading state while checking authentication or during global loading */}
      {isLoading || globalLoading ? (
        <LoadingScreen 
          message={globalLoading ? loadingMessage : "Loading JobTailorAI..."}
          subtitle={globalLoading ? loadingSubtitle : "Preparing your professional workspace"}
          showProgress={true}
        />
      ) : (
        <>
          {/* Navigation Header */}
          <AppBar position="static" elevation={0}>
            <Toolbar sx={{ py: { xs: 0.5, md: 1 }, px: { xs: 2, md: 3 } }}>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="h5" component="div" sx={{ 
                    fontWeight: 800,
                    fontSize: { xs: '1.3rem', md: '1.6rem' },
                    background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.5px'
                  }}>
                    JobTailor
                  </Typography>
                  <Box sx={{
                    bgcolor: '#0A66C2',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: { xs: '0.8rem', md: '1rem' },
                    fontWeight: 700,
                    letterSpacing: '0.5px'
                  }}>
                    AI
                  </Box>
                </Box>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
                {(() => {
                  if (isLoading) {
                    return <CircularProgress size={24} />;
                  } else if (currentUser) {
                    return (
                      <>
                        <Button 
                          variant="contained" 
                          onClick={handleStartCrafting}
                          size={isMobile ? "small" : "medium"}
                          sx={{
                            background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                            color: 'white',
                            fontWeight: 600,
                            px: { xs: 2, md: 3 },
                            fontSize: { xs: '0.8rem', md: '0.9rem' },
                            mr: { xs: 1, md: 2 },
                            '&:hover': {
                              background: 'linear-gradient(45deg, #004182 30%, #0A66C2 90%)',
                            }
                          }}
                        >
                          {isMobile ? 'Craft' : 'Start Crafting'}
                        </Button>
                        {!isSmallMobile && (
                          <Typography variant="body2" sx={{ 
                            color: 'text.primary',
                            display: { xs: 'none', sm: 'block' },
                            fontSize: { xs: '1rem', md: '1.1rem' },
                            fontWeight: 'bold'
                          }}>
                            {(currentUser && authDataLoaded) ? `Welcome, ${getDisplayName()}` : ''}
                          </Typography>
                        )}
                        <IconButton
                          onClick={(e) => {
                            Logger.log('Avatar clicked!', e.currentTarget);
                            setProfileMenuAnchor(e.currentTarget);
                          }}
                          sx={{ 
                            p: 0,
                            border: '2px solid',
                            borderColor: 'primary.main',
                            '&:hover': {
                              borderColor: 'text.secondary',
                            }
                          }}
                        >
                          <Avatar 
                            sx={{ 
                              bgcolor: 'primary.main', 
                              width: { xs: 32, md: 40 }, 
                              height: { xs: 32, md: 40 },
                              fontSize: { xs: '0.9rem', md: '1rem' },
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
                        Logger.log('Menu closing');
                        setProfileMenuAnchor(null);
                      }}
                      PaperProps={{
                        sx: {
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                          mt: 1,
                          minWidth: 200
                        }
                      }}
                    >
                      <MenuItem onClick={() => {
                        setProfileMenuAnchor(null);
                        showLoading("Loading profile...", "Accessing your account settings", 1200);
                        setTimeout(() => {
                          navigate('/app/profile');
                        }, 1200);
                      }}>
                        <ListItemIcon>
                          <PersonIcon sx={{ color: 'primary.main' }} />
                        </ListItemIcon>
                        <ListItemText primary="Profile" />
                      </MenuItem>
                      
                      <MenuItem onClick={() => {
                        setProfileMenuAnchor(null);
                        setSettingsDialogOpen(true);
                      }}>
                        <ListItemIcon>
                          <SettingsIcon sx={{ color: 'primary.main' }} />
                        </ListItemIcon>
                        <ListItemText primary="Settings & Privacy" />
                      </MenuItem>
                      
                      <MenuItem onClick={() => {
                        setProfileMenuAnchor(null);
                        setFaqsDialogOpen(true);
                      }}>
                        <ListItemIcon>
                          <HelpOutlineIcon sx={{ color: 'primary.main' }} />
                        </ListItemIcon>
                        <ListItemText primary="FAQs & Help" />
                      </MenuItem>
                      
                      <MenuItem onClick={() => {
                        setProfileMenuAnchor(null);
                        setContactUsDialogOpen(true);
                      }}>
                        <ListItemIcon>
                          <ContactSupportIcon sx={{ color: 'primary.main' }} />
                        </ListItemIcon>
                        <ListItemText primary="Contact Us" />
                      </MenuItem>
                      
                      <MenuItem 
                        onClick={() => {
                          Logger.log('Sign Out clicked');
                          // Don't close menu immediately so user can see loading state
                          handleSignOut();
                        }}
                        disabled={isSigningOut}
                      >
                        <ListItemIcon>
                          {isSigningOut ? (
                            <CircularProgress size={20} sx={{ color: 'primary.main' }} />
                          ) : (
                            <LogoutIcon sx={{ color: 'primary.main' }} />
                          )}
                        </ListItemIcon>
                        <ListItemText primary={isSigningOut ? "Signing out..." : "Sign Out"} />
                      </MenuItem>
                    </Menu>
                  </>
                );
              } else {
                return (
                  <>
                    <Button 
                      variant="outlined"
                      onClick={handleSignIn}
                      size={isMobile ? "small" : "medium"}
                      sx={{ 
                        color: '#0A66C2',
                        borderColor: '#0A66C2',
                        fontSize: { xs: '0.85rem', md: '0.95rem' },
                        fontWeight: 600,
                        px: { xs: 2.5, md: 3.5 },
                        py: { xs: 0.8, md: 1 },
                        borderWidth: '2px',
                        '&:hover': { 
                          backgroundColor: '#0A66C2',
                          color: 'white',
                          borderColor: '#0A66C2',
                          borderWidth: '2px'
                        }
                      }}
                    >
                      Sign In
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={handleGetStarted}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                        fontSize: { xs: '0.8rem', md: '0.9rem' },
                        px: { xs: 2, md: 3 },
                        '&:hover': {
                          background: 'linear-gradient(45deg, #004182 30%, #0A66C2 90%)',
                        }
                      }}
                    >
                      {isMobile ? 'Get Started' : 'Get Started Free'}
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
        background: 'linear-gradient(135deg, #0A1929 0%, #1A2332 25%, #0A66C2 50%, #1976D2 75%, #0D47A1 100%)',
        py: { xs: 3, md: 4 },
        minHeight: { xs: 'calc(100vh - 64px)', md: 'calc(100vh - 80px)' },
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'visible'
      }}>
        {/* Enhanced Modern Background */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: 0
        }}>
          {/* Animated Gradient Overlay */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(45deg, rgba(10, 102, 194, 0.1) 0%, rgba(25, 118, 210, 0.15) 25%, rgba(13, 71, 161, 0.1) 50%, rgba(10, 102, 194, 0.05) 75%, rgba(25, 118, 210, 0.1) 100%)',
            animation: 'gradientShift 8s ease-in-out infinite',
            '@keyframes gradientShift': {
              '0%, 100%': { 
                background: 'linear-gradient(45deg, rgba(10, 102, 194, 0.1) 0%, rgba(25, 118, 210, 0.15) 25%, rgba(13, 71, 161, 0.1) 50%, rgba(10, 102, 194, 0.05) 75%, rgba(25, 118, 210, 0.1) 100%)'
              },
              '50%': { 
                background: 'linear-gradient(225deg, rgba(25, 118, 210, 0.15) 0%, rgba(13, 71, 161, 0.1) 25%, rgba(10, 102, 194, 0.1) 50%, rgba(25, 118, 210, 0.05) 75%, rgba(13, 71, 161, 0.1) 100%)'
              }
            }
          }} />

          {/* Floating Geometric Shapes */}
          <Box sx={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(10, 102, 194, 0.2) 100%)',
            animation: 'floatUpDown 6s ease-in-out infinite',
            '@keyframes floatUpDown': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(180deg)' }
            }
          }} />
          
          <Box sx={{
            position: 'absolute',
            top: '60%',
            right: '8%',
            width: '40px',
            height: '40px',
            background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.08) 0%, rgba(25, 118, 210, 0.15) 100%)',
            borderRadius: '8px',
            animation: 'floatUpDown 8s ease-in-out infinite reverse',
            animationDelay: '2s'
          }} />

          <Box sx={{
            position: 'absolute',
            top: '25%',
            right: '15%',
            width: '80px',
            height: '80px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            animation: 'slowRotate 12s linear infinite',
            '@keyframes slowRotate': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }} />

          <Box sx={{
            position: 'absolute',
            bottom: '20%',
            left: '10%',
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, rgba(13, 71, 161, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            animation: 'floatUpDown 7s ease-in-out infinite',
            animationDelay: '1s'
          }} />

          {/* Subtle Grid Pattern */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            opacity: 0.3
          }} />

          {/* Subtle JobTailorAI Watermark */}
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            fontSize: { xs: '120px', md: '200px' },
            fontWeight: 900,
            color: 'rgba(255, 255, 255, 0.02)',
            userSelect: 'none',
            pointerEvents: 'none',
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '-0.05em'
          }}>
            JobTailorAI
          </Box>

          {/* Radial Gradient Spotlight */}
          <Box sx={{
            position: 'absolute',
            top: '30%',
            left: '20%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'pulse 4s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
              '50%': { opacity: 0.6, transform: 'scale(1.1)' }
            }
          }} />
        </Box>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={{ xs: 2, md: 4 }} alignItems="center" sx={{ minHeight: '100%' }}>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                {/* Enhanced Hero Badge */}
                <Box sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50px',
                  px: 3,
                  py: 1,
                  mb: 3,
                  backdropFilter: 'blur(15px)',
                  textAlign: { xs: 'center', md: 'left' },
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  animation: 'badgeGlow 3s ease-in-out infinite',
                  '@keyframes badgeGlow': {
                    '0%, 100%': { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' },
                    '50%': { boxShadow: '0 8px 32px rgba(255, 255, 255, 0.2)' }
                  }
                }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#4CAF50',
                    mr: 1.5,
                    animation: 'pulse 2s infinite'
                  }} />
                  <Typography variant="body2" sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}>
                    {currentUser ? '🎯 Ready for your next opportunity' : '🚀 AI-Powered • ATS-Optimized • Professional'}
                  </Typography>
                </Box>

                <Typography variant="h1" sx={{ 
                  fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.5rem', lg: '4rem' },
                  fontWeight: 900,
                  color: '#ffffff',
                  mb: { xs: 2, md: 3 },
                  lineHeight: { xs: 1.1, md: 1.05 },
                  textAlign: { xs: 'center', md: 'left' },
                  maxWidth: { xs: '100%', md: '95%', lg: '90%' },
                  letterSpacing: '-0.03em',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {(currentUser && authDataLoaded)
                    ? `Welcome back, ${getDisplayName()}!`
                    : 'Transform Your Career with AI-Powered Resumes'
                  }
                </Typography>
                
                <Typography variant="h5" sx={{ 
                  fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.4rem', lg: '1.5rem' },
                  color: '#ffffff',
                  mb: { xs: 4, md: 5 }, 
                  fontWeight: 400,
                  lineHeight: { xs: 1.5, md: 1.4 },
                  textAlign: { xs: 'center', md: 'left' },
                  maxWidth: { xs: '100%', md: '90%', lg: '85%' },
                  letterSpacing: '0.005em',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {currentUser
                    ? 'Ready to craft another resume? Let\'s get started with your next career opportunity.'
                    : 'Create professional, ATS-optimized resumes in seconds. Land 3x more interviews with cutting-edge AI technology.'
                  }
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: { xs: 'center', md: 'flex-start' }, 
                  mb: { xs: 3, md: 4 }
                }}>
                  <Button 
                    variant="contained" 
                    size={isMobile ? "large" : "large"}
                    onClick={handleGetStarted}
                    endIcon={<PlayArrowIcon />}
                    sx={{
                      py: { xs: 2, md: 2.5 },
                      px: { xs: 4, md: 6 },
                      fontSize: { xs: '1rem', md: '1.2rem' },
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                      color: '#0A66C2',
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      borderRadius: '50px',
                      boxShadow: '0 12px 40px rgba(255, 255, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                      backdropFilter: 'blur(15px)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                        transition: 'left 0.6s ease-in-out'
                      },
                      '&:hover': {
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        boxShadow: '0 16px 50px rgba(255, 255, 255, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                        transform: 'translateY(-4px) scale(1.03)',
                        border: '2px solid rgba(255, 255, 255, 0.6)',
                        '&::before': {
                          left: '100%'
                        }
                      },
                      '&:active': {
                        transform: 'translateY(-2px) scale(1.01)'
                      }
                    }}
                  >
                    {currentUser ? 'Continue Crafting' : 'Start Crafting Now'}
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            
            {/* Resume Transformation Mockup */}
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box sx={{ 
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  py: 2
                }}>
                  {/* Mobile Resume Mockups (xs only) */}
                  <Box sx={{ 
                    display: { xs: 'block', sm: 'none' },
                    width: '100%'
                  }}>
                    <MobileResumeMockups />
                  </Box>

                  {/* Desktop Resume Mockups (sm and up) */}
                  <Box sx={{
                    display: { xs: 'none', sm: 'flex' },
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    gap: { sm: 1.5, md: 2 },
                    flexDirection: 'row',
                    width: '100%'
                  }}>
                  {/* Before Resume with Label */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{
                      bgcolor: '#ff6b6b',
                      color: 'white',
                      px: { xs: 1.5, md: 2 },
                      py: 0.7,
                      borderRadius: 1,
                      fontSize: { xs: '10px', md: '11px' },
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
                      mb: 1
                    }}>
                      BEFORE
                    </Box>
                  <motion.div
                    initial={{ scale: 1, x: 0 }}
                    animate={{ scale: { xs: 1, sm: 0.9 }, x: { xs: 0, sm: -20 } }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: 1 }}
                  >
                    <Box sx={{
                      width: { xs: '130px', sm: '280px', md: '320px' },
                      height: { xs: '190px', sm: '400px', md: '450px' },
                      bgcolor: '#f9f9f9',
                      borderRadius: 2,
                      border: '2px solid #ddd',
                      position: 'relative',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      overflow: 'hidden',
                      p: { xs: 0.8, sm: 0.8, md: 1 },
                      flexShrink: 0
                    }}>
                      {/* Static ATS Score Badge - Top Right */}
                      <Box sx={{
                        position: 'absolute',
                        top: { xs: 8, sm: 12, md: 15 },
                        right: { xs: 8, sm: 12, md: 15 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        bgcolor: 'rgba(255, 107, 107, 0.1)',
                        border: '2px solid #ff6b6b',
                        borderRadius: 2,
                        p: { xs: 0.4, sm: 0.8, md: 1 },
                        minWidth: { xs: '30px', sm: '45px', md: '55px' }
                      }}>
                        <Typography sx={{
                          fontSize: { xs: '5px', sm: '7px', md: '8px' },
                          fontWeight: 'bold',
                          color: '#ff6b6b',
                          textAlign: 'center',
                          lineHeight: 1,
                          mb: 0.5
                        }}>
                          ATS
                        </Typography>
                        <Typography sx={{
                          fontSize: { xs: '8px', sm: '12px', md: '14px' },
                          fontWeight: 'bold',
                          color: '#ff6b6b',
                          textAlign: 'center',
                          lineHeight: 1
                        }}>
                          45%
                        </Typography>
                        {/* Static Progress Bar */}
                        <Box sx={{
                          width: { xs: '18px', sm: '25px', md: '30px' },
                          height: { xs: '3px', sm: '4px', md: '5px' },
                          bgcolor: '#ffebee',
                          borderRadius: 1,
                          mt: 0.4,
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <Box sx={{
                            width: '45%',
                            height: '100%',
                            bgcolor: '#ff6b6b',
                            borderRadius: 1
                          }} />
                        </Box>
                      </Box>
                      {/* Header */}
                      <Box sx={{ mb: 1, textAlign: 'center', borderBottom: '1px solid #ccc', pb: 1 }}>
                        <Typography sx={{ 
                          fontSize: { xs: '7px', sm: '11px', md: '13px' }, 
                          fontWeight: 'bold', 
                          color: '#333',
                          mb: 0.3
                        }}>
                          JOHN SMITH
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '9px', md: '11px' }, 
                          color: '#666',
                          mb: 0.3
                        }}>
                          Data Engineer
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '8px', md: '9px' }, 
                          color: '#888'
                        }}>
                          john.smith@email.com | (555) 123-4567
                        </Typography>
                      </Box>
                      
                      {/* Summary Section */}
                      <Box sx={{ mb: 0.6 }}>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '9px', md: '11px' }, 
                          fontWeight: 'bold', 
                          color: '#333',
                          mb: 0.3,
                          textDecoration: 'underline'
                        }}>
                          SUMMARY
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '4px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.2
                        }}>
                          Experienced data engineer with background in ETL processes and database management.
                        </Typography>
                      </Box>

                      {/* Experience Section */}
                      <Box sx={{ mb: 0.8 }}>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '9px', md: '11px' }, 
                          fontWeight: 'bold', 
                          color: '#333',
                          mb: 0.5,
                          textDecoration: 'underline'
                        }}>
                          EXPERIENCE
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '8px', md: '10px' }, 
                          fontWeight: 'bold',
                          color: '#444',
                          mb: 0.3
                        }}>
                          Data Engineer - TechCorp Inc (2022-2024)
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.1,
                          mb: 0.1
                        }}>
                          • Built ETL pipelines using Python and SQL for data processing
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.1,
                          mb: 0.1
                        }}>
                          • Managed PostgreSQL and MySQL databases for reporting
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.1,
                          mb: 0.1
                        }}>
                          • Worked with team on data migration and cleanup projects
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.1,
                          mb: 0.2
                        }}>
                          • Optimized database queries to improve performance
                        </Typography>
                        
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '8px', md: '10px' }, 
                          fontWeight: 'bold',
                          color: '#444',
                          mb: 0.1
                        }}>
                          Junior Data Analyst - DataSoft LLC (2020-2022)
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.1,
                          mb: 0.1
                        }}>
                          • Created weekly and monthly reports using Excel and SQL
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.2,
                          mb: 0.2
                        }}>
                          • Analyzed sales data trends and customer behavior patterns
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.2,
                          mb: 0.2
                        }}>
                          • Maintained data quality and performed data validation
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.2,
                          mb: 0.3
                        }}>
                          • Supported senior analysts with ad-hoc analysis requests
                        </Typography>
                        
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '8px', md: '10px' }, 
                          fontWeight: 'bold',
                          color: '#444',
                          mb: 0.2
                        }}>
                          Intern - StartupXYZ (2019-2020)
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.2,
                          mb: 0.2
                        }}>
                          • Performed data entry and validation for customer records
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.2,
                          mb: 0.2
                        }}>
                          • Wrote basic SQL queries for generating simple reports
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.2,
                          mb: 0.2
                        }}>
                          • Assisted with database maintenance and backup tasks
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.2
                        }}>
                          • Learned data processing fundamentals and best practices
                        </Typography>
                      </Box>

                      {/* Skills Section */}
                      <Box sx={{ mb: 0.6 }}>
                        <Typography sx={{ 
                          fontSize: { xs: '6px', sm: '9px', md: '11px' }, 
                          fontWeight: 'bold', 
                          color: '#333',
                          mb: 0.3,
                          textDecoration: 'underline'
                        }}>
                          TECHNICAL SKILLS
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.2
                        }}>
                          Python, SQL, PostgreSQL, MySQL, Excel, Git
                        </Typography>
                      </Box>
                      
                      {/* Education Section */}
                      <Box sx={{ mb: 0.5 }}>
                        <Typography sx={{ 
                          fontSize: { xs: '6px', sm: '9px', md: '11px' }, 
                          fontWeight: 'bold', 
                          color: '#333',
                          mb: 0.3,
                          textDecoration: 'underline'
                        }}>
                          EDUCATION
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '8px', md: '10px' }, 
                          fontWeight: 'bold', 
                          color: '#444',
                          mb: 0.2
                        }}>
                          BS Computer Science - State University
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.1
                        }}>
                          2018-2022 | GPA: 3.5
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                  </Box>

                  {/* After Resume with Label */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{
                      bgcolor: '#4caf50',
                      color: 'white',
                      px: { xs: 1.5, md: 2 },
                      py: 0.7,
                      borderRadius: 1,
                      fontSize: { xs: '10px', md: '11px' },
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                      mb: 1
                    }}>
                      AFTER
                    </Box>
                  <motion.div
                    initial={{ scale: 1, x: 0 }}
                    animate={{ scale: { xs: 1, sm: 1.1 }, x: { xs: 0, sm: 20 } }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: 1 }}
                  >
                    <Box sx={{
                      width: { xs: '130px', sm: '300px', md: '340px' },
                      height: { xs: '190px', sm: '400px', md: '450px' },
                      bgcolor: 'white',
                      borderRadius: 2,
                      border: '2px solid #0A66C2',
                      position: 'relative',
                      boxShadow: '0 8px 30px rgba(10, 102, 194, 0.3)',
                      overflow: 'hidden',
                      p: { xs: 0.8, sm: 0.8, md: 1 },
                      flexShrink: 0
                    }}>
                      {/* Static ATS Score Badge - Top Right */}
                      <Box sx={{
                        position: 'absolute',
                        top: { xs: 8, sm: 12, md: 15 },
                        right: { xs: 8, sm: 12, md: 15 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                        border: '2px solid #4caf50',
                        borderRadius: 2,
                        p: { xs: 0.5, sm: 1, md: 1.2 },
                        minWidth: { xs: '35px', sm: '50px', md: '60px' }
                      }}>
                        <Typography sx={{
                          fontSize: { xs: '5px', sm: '7px', md: '8px' },
                          fontWeight: 'bold',
                          color: '#4caf50',
                          textAlign: 'center',
                          lineHeight: 1,
                          mb: 0.5
                        }}>
                          ATS
                        </Typography>
                        <Typography sx={{
                          fontSize: { xs: '8px', sm: '12px', md: '14px' },
                          fontWeight: 'bold',
                          color: '#4caf50',
                          textAlign: 'center',
                          lineHeight: 1
                        }}>
                          90%
                        </Typography>
                        {/* Static Progress Bar */}
                        <Box sx={{
                          width: { xs: '20px', sm: '30px', md: '35px' },
                          height: { xs: '3px', sm: '4px', md: '5px' },
                          bgcolor: '#e8f5e8',
                          borderRadius: 1,
                          mt: 0.5,
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <Box sx={{
                            width: '90%',
                            height: '100%',
                            bgcolor: '#4caf50',
                            borderRadius: 1
                          }} />
                        </Box>
                      </Box>
                      {/* Header */}
                      <Box sx={{ mb: 1, textAlign: 'center', bgcolor: '#f8fbff', mx: { xs: -1, md: -1.8 }, mt: { xs: -1, md: -1.8 }, p: { xs: 1, md: 1.8 }, borderBottom: '2px solid #0A66C2' }}>
                        <Typography sx={{ 
                          fontSize: { xs: '9px', sm: '12px', md: '14px' }, 
                          fontWeight: 'bold', 
                          color: '#0A66C2',
                          mb: 0.3
                        }}>
                          JOHN SMITH
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '6px', sm: '9px', md: '11px' }, 
                          color: '#0A66C2',
                          fontWeight: 'bold',
                          mb: 0.3
                        }}>
                          AI/ML Developer
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '8px', md: '9px' }, 
                          color: '#378FE9'
                        }}>
                          john.smith@email.com | (555) 123-4567
                        </Typography>
                      </Box>
                      
                      {/* Summary Section */}
                      <Box sx={{ mb: 0.6 }}>
                        <Typography sx={{ 
                          fontSize: { xs: '6px', sm: '9px', md: '11px' }, 
                          fontWeight: 'bold', 
                          color: '#0A66C2',
                          mb: 0.3,
                          borderBottom: '1px solid #0A66C2',
                          pb: 0.1
                        }}>
                          PROFESSIONAL SUMMARY
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7px', md: '8px' }, 
                          color: '#333',
                          lineHeight: 1.1
                        }}>
                          AI/ML Developer with expertise in machine learning, deep learning, and data science. Proven track record in developing intelligent systems and predictive models.
                        </Typography>
                      </Box>

                      {/* Experience Section */}
                      <Box sx={{ mb: 0.8 }}>
                        <Typography sx={{ 
                          fontSize: { xs: '6px', sm: '9px', md: '11px' }, 
                          fontWeight: 'bold', 
                          color: '#0A66C2',
                          mb: 0.5,
                          borderBottom: '1px solid #0A66C2',
                          pb: 0.2
                        }}>
                          PROFESSIONAL EXPERIENCE
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '8px', md: '10px' }, 
                          fontWeight: 'bold',
                          color: '#0A66C2',
                          mb: 0.3
                        }}>
                          Senior AI/ML Engineer - TechCorp Inc (2022-2024)
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.1,
                          mb: 0.1
                        }}>
                          • Developed end-to-end ML pipelines using TensorFlow & PyTorch
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.1,
                          mb: 0.1
                        }}>
                          • Built predictive models achieving 95% accuracy for forecasting
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.1,
                          mb: 0.1
                        }}>
                          • Implemented MLOps practices for model deployment and monitoring
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.1,
                          mb: 0.2
                        }}>
                          • Led cross-functional AI initiatives with engineering and product teams
                        </Typography>
                        
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '8px', md: '10px' }, 
                          fontWeight: 'bold',
                          color: '#0A66C2',
                          mb: 0.1
                        }}>
                          Data Scientist - DataSoft LLC (2020-2022)
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.1,
                          mb: 0.1
                        }}>
                          • Built advanced predictive analytics models for customer segmentation
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.1,
                          mb: 0.1
                        }}>
                          • Implemented NLP solutions for sentiment analysis and text mining
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.2,
                          mb: 0.3
                        }}>
                          • Developed recommendation systems increasing user engagement by 25%
                        </Typography>
                        
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '8px', md: '10px' }, 
                          fontWeight: 'bold',
                          color: '#0A66C2',
                          mb: 0.2
                        }}>
                          ML Engineer - StartupXYZ (2019-2020)
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.2,
                          mb: 0.2
                        }}>
                          • Developed computer vision applications for object detection and classification
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.2,
                          mb: 0.2
                        }}>
                          • Created deep learning models for image recognition with CNN architectures
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.2,
                          mb: 0.2
                        }}>
                          • Implemented data augmentation techniques improving model robustness
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.2
                        }}>
                          • Optimized model performance achieving real-time inference capabilities
                        </Typography>
                      </Box>

                      {/* Skills Section */}
                      <Box sx={{ mb: 0.6 }}>
                        <Typography sx={{ 
                          fontSize: { xs: '6px', sm: '9px', md: '11px' }, 
                          fontWeight: 'bold', 
                          color: '#0A66C2',
                          mb: 0.3,
                          borderBottom: '1px solid #0A66C2',
                          pb: 0.1
                        }}>
                          CORE COMPETENCIES
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7px', md: '8px' }, 
                          color: '#333',
                          lineHeight: 1.1
                        }}>
                          Python, TensorFlow, PyTorch, Scikit-learn, Keras, Neural Networks, Deep Learning, NLP, Computer Vision, MLOps, AWS SageMaker
                        </Typography>
                      </Box>
                      
                      {/* Education Section - Enhanced */}
                      <Box sx={{ mb: 0.5 }}>
                        <Typography sx={{ 
                          fontSize: { xs: '6px', sm: '9px', md: '11px' }, 
                          fontWeight: 'bold', 
                          color: '#0A66C2',
                          mb: 0.3,
                          borderBottom: '1px solid #0A66C2',
                          pb: 0.1
                        }}>
                          EDUCATION & CERTIFICATIONS
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '8px', md: '10px' }, 
                          fontWeight: 'bold', 
                          color: '#0A66C2',
                          mb: 0.2
                        }}>
                          BS Computer Science
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.1
                        }}>
                          State University (2018-2022) | GPA: 3.5
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


                      </Box>
                    </Box>
                  </motion.div>
                  </Box>
                  </Box>
                  </Box> {/* End Desktop Resume Mockups */}
                  
                  {/* Stats at the bottom */}
                  {/* Mobile Stats (xs only) */}
                  <Box sx={{ 
                    display: { xs: 'block', sm: 'none' },
                    width: '100%'
                  }}>
                    <MobileStats />
                  </Box>

                  {/* Desktop Stats (sm and up) */}
                  <Box sx={{ 
                    display: { xs: 'none', sm: 'flex' }, 
                    justifyContent: 'center', 
                    gap: { sm: 3, md: 4 }, 
                    mt: { sm: 7, md: 8 },
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
                            fontSize: { sm: '1.5rem', md: '2rem' },
                            color: '#ffffff', 
                            fontWeight: 'bold',
                            mb: 0.5,
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                          }}>
                            {stat.number}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: { sm: '10px', md: '12px' },
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                          }}>
                            {stat.label}
                          </Typography>
                        </Box>
                      </motion.div>
                    ))}
                  </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Enhanced Features Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f1f3f4 100%)',
        py: { xs: 10, md: 15 }
      }}>
        <Container maxWidth="lg" id="features-section">
          {/* Section Header */}
          <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 10 } }}>
            <Typography variant="overline" sx={{
              color: '#0A66C2',
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.1em',
              mb: 2,
              display: 'block'
            }}>
              FEATURES
            </Typography>
            <Typography variant="h2" sx={{ 
              fontSize: { xs: '2.2rem', md: '3rem' },
              mb: 3,
              fontWeight: 900,
              background: 'linear-gradient(135deg, #0A66C2 0%, #378FE9 50%, #4CAF50 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em'
            }}>
              Why Choose JobTailorAI?
            </Typography>
            <Typography variant="h6" sx={{
              color: '#666',
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6,
              fontWeight: 400
            }}>
              Discover the powerful features that make JobTailorAI the ultimate resume optimization platform
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 4, md: 5 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card sx={{ 
                    height: '100%', 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: 4,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { 
                      transform: 'translateY(-8px) scale(1.02)', 
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                      border: '1px solid rgba(10, 102, 194, 0.2)'
                    } 
                  }}>
                    <CardContent sx={{ p: { xs: 4, md: 5 } }}>
                      <Box sx={{ 
                        mb: 3,
                        '& > div': {
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)'
                          }
                        }
                      }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h5" sx={{ 
                        mb: 2, 
                        fontWeight: 700,
                        fontSize: { xs: '1.2rem', md: '1.4rem' },
                        color: '#333'
                      }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: '#666', 
                        lineHeight: 1.7,
                        fontSize: { xs: '0.95rem', md: '1rem' }
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
      </Box>

      {/* Detailed Features Showcase */}
      <Box sx={{ bgcolor: 'background.paper', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" sx={{ 
            fontSize: { xs: '1.8rem', md: '2.5rem' },
            mb: { xs: 2, md: 3 },
            fontWeight: 700,
            color: 'primary.main'
          }}>
            Powerful Features for Job Success
          </Typography>
          <Typography variant="h6" align="center" sx={{ 
            fontSize: { xs: '1rem', md: '1.25rem' },
            mb: { xs: 6, md: 8 },
            color: 'text.secondary',
            maxWidth: '800px',
            mx: 'auto',
            px: { xs: 2, md: 0 }
          }}>
            Every feature is designed to give you the competitive edge in today's job market
          </Typography>

          <Grid container spacing={{ xs: 4, md: 6 }}>
            {/* Preview Feature */}
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: { xs: 2, md: 3 },
                flexDirection: { xs: 'column', sm: 'row' },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Box sx={{
                  width: { xs: 50, md: 60 },
                  height: { xs: 50, md: 60 },
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mx: { xs: 'auto', sm: 0 }
                }}>
                  <Typography sx={{ fontSize: { xs: '20px', md: '24px' } }}>👁️</Typography>
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ 
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                    fontWeight: 600, 
                    mb: { xs: 1.5, md: 2 }, 
                    color: 'primary.main' 
                  }}>
                    Real-Time Preview
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    color: 'text.secondary', 
                    lineHeight: 1.6, 
                    mb: { xs: 1.5, md: 2 } 
                  }}>
                    See your crafted resume instantly with our live preview feature. Review the formatting, 
                    layout, and content changes in real-time before downloading.
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'primary.main', 
                    fontWeight: 600,
                    fontSize: { xs: '0.8rem', md: '0.9rem' }
                  }}>
                    ✓ Instant visual feedback  ✓ Professional formatting  ✓ Mobile-responsive preview
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Compare Feature */}
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: { xs: 2, md: 3 },
                flexDirection: { xs: 'column', sm: 'row' },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Box sx={{
                  width: { xs: 50, md: 60 },
                  height: { xs: 50, md: 60 },
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mx: { xs: 'auto', sm: 0 }
                }}>
                  <Typography sx={{ fontSize: { xs: '20px', md: '24px' } }}>⚖️</Typography>
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ 
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                    fontWeight: 600, 
                    mb: { xs: 1.5, md: 2 }, 
                    color: 'primary.main' 
                  }}>
                    Side-by-Side Compare
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    color: 'text.secondary', 
                    lineHeight: 1.6, 
                    mb: { xs: 1.5, md: 2 } 
                  }}>
                    Compare your original resume with the AI-crafted version side by side. 
                    See exactly what improvements were made and why.
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'primary.main', 
                    fontWeight: 600,
                    fontSize: { xs: '0.8rem', md: '0.9rem' }
                  }}>
                    ✓ Before/after comparison  ✓ Highlight changes  ✓ Improvement insights
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Download Formats */}
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: { xs: 2, md: 3 },
                flexDirection: { xs: 'column', sm: 'row' },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Box sx={{
                  width: { xs: 50, md: 60 },
                  height: { xs: 50, md: 60 },
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mx: { xs: 'auto', sm: 0 }
                }}>
                  <Typography sx={{ fontSize: { xs: '20px', md: '24px' } }}>📄</Typography>
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ 
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                    fontWeight: 600, 
                    mb: { xs: 1.5, md: 2 }, 
                    color: 'primary.main' 
                  }}>
                    Multiple Download Formats
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    color: 'text.secondary', 
                    lineHeight: 1.6, 
                    mb: { xs: 1.5, md: 2 } 
                  }}>
                    Download your crafted resume in Word (.docx) or plain text format. 
                    Perfect formatting preserved for any application system.
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'primary.main', 
                    fontWeight: 600,
                    fontSize: { xs: '0.8rem', md: '0.9rem' }
                  }}>
                    ✓ Word format (.docx)  ✓ Plain text (.txt)  ✓ Perfect formatting
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Job-Specific Crafting */}
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: { xs: 2, md: 3 },
                flexDirection: { xs: 'column', sm: 'row' },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Box sx={{
                  width: { xs: 50, md: 60 },
                  height: { xs: 50, md: 60 },
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mx: { xs: 'auto', sm: 0 }
                }}>
                  <Typography sx={{ fontSize: { xs: '20px', md: '24px' } }}>🎯</Typography>
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ 
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                    fontWeight: 600, 
                    mb: { xs: 1.5, md: 2 }, 
                    color: 'primary.main' 
                  }}>
                    Job-Specific Tailoring
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    color: 'text.secondary', 
                    lineHeight: 1.6, 
                    mb: { xs: 1.5, md: 2 } 
                  }}>
                    Each resume is uniquely crafted for the specific job you're applying to. 
                    No generic templates - every word is optimized for that role.
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'primary.main', 
                    fontWeight: 600,
                    fontSize: { xs: '0.8rem', md: '0.9rem' }
                  }}>
                    ✓ Keyword optimization  ✓ Role-specific skills  ✓ Industry alignment
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }} id="how-it-works-section">
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" sx={{ 
            fontSize: { xs: '1.8rem', md: '2.5rem' },
            mb: { xs: 2, md: 3 },
            fontWeight: 700,
            color: '#0A66C2'
          }}>
            How JobTailorAI Works
          </Typography>
          <Typography variant="h6" align="center" sx={{ 
            fontSize: { xs: '1rem', md: '1.25rem' },
            mb: { xs: 6, md: 8 },
            color: '#666666',
            maxWidth: '600px',
            mx: 'auto',
            px: { xs: 2, md: 0 }
          }}>
            Transform your resume in three simple steps with our advanced AI technology
          </Typography>

          <Grid container spacing={{ xs: 4, md: 6 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ 
                  width: { xs: 60, md: 80 }, 
                  height: { xs: 60, md: 80 }, 
                  bgcolor: '#0A66C2', 
                  mx: 'auto', 
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontWeight: 'bold'
                }}>
                  1
                </Avatar>
                <Typography variant="h5" sx={{ 
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  mb: { xs: 1.5, md: 2 }, 
                  fontWeight: 600 
                }}>
                  Upload Your Resume
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  color: '#666666', 
                  lineHeight: 1.6, 
                  mb: { xs: 2, md: 3 },
                  px: { xs: 1, md: 0 }
                }}>
                  Upload your existing resume in PDF, Word, or text format. 
                  Our AI instantly analyzes your experience and skills.
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: 1, 
                  flexWrap: 'wrap' 
                }}>
                  <Typography variant="caption" sx={{ 
                    bgcolor: '#E3F2FD', 
                    px: { xs: 1.5, md: 2 }, 
                    py: 0.5, 
                    borderRadius: 1, 
                    color: '#0A66C2', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', md: '0.75rem' }
                  }}>
                    PDF
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    bgcolor: '#E3F2FD', 
                    px: { xs: 1.5, md: 2 }, 
                    py: 0.5, 
                    borderRadius: 1, 
                    color: '#0A66C2', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', md: '0.75rem' }
                  }}>
                    Word
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    bgcolor: '#E3F2FD', 
                    px: { xs: 1.5, md: 2 }, 
                    py: 0.5, 
                    borderRadius: 1, 
                    color: '#0A66C2', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', md: '0.75rem' }
                  }}>
                    Text
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ 
                  width: { xs: 60, md: 80 }, 
                  height: { xs: 60, md: 80 }, 
                  bgcolor: '#0A66C2', 
                  mx: 'auto', 
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontWeight: 'bold'
                }}>
                  2
                </Avatar>
                <Typography variant="h5" sx={{ 
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  mb: { xs: 1.5, md: 2 }, 
                  fontWeight: 600 
                }}>
                  Add Job Description
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  color: '#666666', 
                  lineHeight: 1.6, 
                  mb: { xs: 2, md: 3 },
                  px: { xs: 1, md: 0 }
                }}>
                  Paste the job description you're applying for. Our AI analyzes 
                  requirements, keywords, and company culture.
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: 1, 
                  flexWrap: 'wrap' 
                }}>
                  <Typography variant="caption" sx={{ 
                    bgcolor: '#E8F5E8', 
                    px: { xs: 1.5, md: 2 }, 
                    py: 0.5, 
                    borderRadius: 1, 
                    color: '#2E7D32', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', md: '0.75rem' }
                  }}>
                    Keywords
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    bgcolor: '#E8F5E8', 
                    px: { xs: 1.5, md: 2 }, 
                    py: 0.5, 
                    borderRadius: 1, 
                    color: '#2E7D32', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', md: '0.75rem' }
                  }}>
                    Skills
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    bgcolor: '#E8F5E8', 
                    px: { xs: 1.5, md: 2 }, 
                    py: 0.5, 
                    borderRadius: 1, 
                    color: '#2E7D32', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', md: '0.75rem' }
                  }}>
                    Requirements
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar sx={{ 
                  width: { xs: 60, md: 80 }, 
                  height: { xs: 60, md: 80 }, 
                  bgcolor: '#0A66C2', 
                  mx: 'auto', 
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontWeight: 'bold'
                }}>
                  3
                </Avatar>
                <Typography variant="h5" sx={{ 
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  mb: { xs: 1.5, md: 2 }, 
                  fontWeight: 600 
                }}>
                  Preview, Compare & Download
                </Typography>
                <Typography variant="body1" sx={{ 
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  color: '#666666', 
                  lineHeight: 1.6, 
                  mb: { xs: 2, md: 3 },
                  px: { xs: 1, md: 0 }
                }}>
                  Preview your crafted resume, compare with the original, 
                  and download in your preferred format.
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: 1, 
                  flexWrap: 'wrap' 
                }}>
                  <Typography variant="caption" sx={{ 
                    bgcolor: '#FFF3E0', 
                    px: { xs: 1.5, md: 2 }, 
                    py: 0.5, 
                    borderRadius: 1, 
                    color: '#F57C00', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', md: '0.75rem' }
                  }}>
                    Preview
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    bgcolor: '#FFF3E0', 
                    px: { xs: 1.5, md: 2 }, 
                    py: 0.5, 
                    borderRadius: 1, 
                    color: '#F57C00', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', md: '0.75rem' }
                  }}>
                    Compare
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    bgcolor: '#FFF3E0', 
                    px: { xs: 1.5, md: 2 }, 
                    py: 0.5, 
                    borderRadius: 1, 
                    color: '#F57C00', 
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', md: '0.75rem' }
                  }}>
                    Download
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }} id="testimonials-section">
        <Typography variant="h2" align="center" sx={{ 
          fontSize: { xs: '1.8rem', md: '2.5rem' },
          mb: { xs: 6, md: 8 },
          fontWeight: 700,
          background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          What Our Users Say
        </Typography>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', p: { xs: 2, md: 3 } }}>
              <CardContent sx={{ p: { xs: 2, md: 0 } }}>
                <Typography variant="body1" sx={{ 
                  mb: { xs: 2, md: 3 }, 
                  fontStyle: 'italic', 
                  lineHeight: 1.6,
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}>
                  "JobTailorAI helped me land my dream job at a Fortune 500 company. 
                  The AI suggestions were spot-on and made my resume stand out."
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#0A66C2', mr: 2, width: { xs: 36, md: 40 }, height: { xs: 36, md: 40 } }}>S</Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }}>
                      Sarah Johnson
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: '#666666',
                      fontSize: { xs: '0.75rem', md: '0.8rem' }
                    }}>
                      Software Engineer at Microsoft
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', p: { xs: 2, md: 3 } }}>
              <CardContent sx={{ p: { xs: 2, md: 0 } }}>
                <Typography variant="body1" sx={{ 
                  mb: { xs: 2, md: 3 }, 
                  fontStyle: 'italic', 
                  lineHeight: 1.6,
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}>
                  "I was struggling to get interviews until I used this tool. 
                  Now I'm getting callbacks from top companies. Highly recommended!"
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#0A66C2', mr: 2, width: { xs: 36, md: 40 }, height: { xs: 36, md: 40 } }}>M</Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }}>
                      Michael Chen
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: '#666666',
                      fontSize: { xs: '0.75rem', md: '0.8rem' }
                    }}>
                      Product Manager at Google
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', p: { xs: 2, md: 3 } }}>
              <CardContent sx={{ p: { xs: 2, md: 0 } }}>
                <Typography variant="body1" sx={{ 
                  mb: { xs: 2, md: 3 }, 
                  fontStyle: 'italic', 
                  lineHeight: 1.6,
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}>
                  "The ATS enhancement feature is incredible. My resume now passes 
                  through applicant tracking systems with ease."
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#0A66C2', mr: 2, width: { xs: 36, md: 40 }, height: { xs: 36, md: 40 } }}>E</Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }}>
                      Emily Rodriguez
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: '#666666',
                      fontSize: { xs: '0.75rem', md: '0.8rem' }
                    }}>
                      Marketing Director at Amazon
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Enhanced CTA Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #0A66C2 0%, #378FE9 50%, #4CAF50 100%)', 
        py: { xs: 8, md: 12 },
        color: 'white',
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
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          opacity: 0.3
        }} />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="overline" sx={{
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.1em',
              mb: 2,
              display: 'block'
            }}>
              READY TO GET STARTED?
            </Typography>
            
            <Typography variant="h2" sx={{ 
              fontSize: { xs: '2.2rem', md: '3rem' },
              mb: { xs: 2, md: 3 },
              fontWeight: 900,
              px: { xs: 2, md: 0 },
              letterSpacing: '-0.02em',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Ready to Land Your Dream Job?
            </Typography>
            
            <Typography variant="h5" sx={{ 
              fontSize: { xs: '1.1rem', md: '1.4rem' },
              mb: { xs: 5, md: 7 },
              opacity: 0.9,
              fontWeight: 400,
              px: { xs: 2, md: 0 },
              lineHeight: 1.5,
              maxWidth: 600,
              mx: 'auto'
            }}>
              Join thousands of professionals who have successfully transformed their careers with AI-powered resumes
            </Typography>
            
            <Button 
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              className="enhanced-button"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                color: '#0A66C2',
                px: { xs: 5, md: 8 },
                py: { xs: 2, md: 2.5 },
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                fontWeight: 700,
                borderRadius: '50px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 1)',
                  transform: 'translateY(-4px) scale(1.05)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.5)'
                },
                '&:active': {
                  transform: 'translateY(-2px) scale(1.02)'
                }
              }}
            >
              {currentUser ? 'Continue Crafting' : 'Get Started Free'}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1a1a1a', color: 'white', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 3, md: 4 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 900, 
                    color: 'white',
                    fontSize: { xs: '1.4rem', md: '1.8rem' },
                    letterSpacing: '-0.5px'
                  }}>
                    JobTailor
                  </Typography>
                  <Box sx={{
                    bgcolor: 'white',
                    color: '#0A66C2',
                    px: 1.5,
                    py: 0.8,
                    borderRadius: 1.5,
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    AI
                  </Box>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ 
                color: '#cccccc', 
                lineHeight: 1.6, 
                mb: { xs: 2, md: 3 },
                fontSize: { xs: '0.85rem', md: '0.9rem' }
              }}>
                Powered by advanced AI technology to help professionals create 
                compelling resumes that get noticed by employers and pass ATS systems.
              </Typography>
            </Grid>

            <Grid item xs={6} md={2}>
              <Typography variant="h6" sx={{ 
                mb: { xs: 2, md: 3 }, 
                fontWeight: 600, 
                color: 'white',
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}>
                Product
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.5, md: 1 } }}>
                <Link 
                  component="button"
                  onClick={() => document.querySelector('#features-section')?.scrollIntoView({ behavior: 'smooth' })}
                  sx={{ 
                    color: '#cccccc', 
                    textDecoration: 'none', 
                    textAlign: 'left',
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    '&:hover': { color: '#0A66C2' } 
                  }}
                >
                  Features
                </Link>
                <Link 
                  component="button"
                  onClick={() => document.querySelector('#how-it-works-section')?.scrollIntoView({ behavior: 'smooth' })}
                  sx={{ 
                    color: '#cccccc', 
                    textDecoration: 'none', 
                    textAlign: 'left',
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    '&:hover': { color: '#0A66C2' } 
                  }}
                >
                  How it Works
                </Link>
                <Link 
                  component="button"
                  onClick={() => document.querySelector('#testimonials-section')?.scrollIntoView({ behavior: 'smooth' })}
                  sx={{ 
                    color: '#cccccc', 
                    textDecoration: 'none', 
                    textAlign: 'left',
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    '&:hover': { color: '#0A66C2' } 
                  }}
                >
                  Testimonials
                </Link>
                <Link 
                  component="button"
                  onClick={handleGetStarted}
                  sx={{ 
                    color: '#cccccc', 
                    textDecoration: 'none', 
                    textAlign: 'left',
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    '&:hover': { color: '#0A66C2' } 
                  }}
                >
                  Try Now
                </Link>
              </Box>
            </Grid>

            <Grid item xs={6} md={2}>
              <Typography variant="h6" sx={{ 
                mb: { xs: 2, md: 3 }, 
                fontWeight: 600, 
                color: 'white',
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}>
                Support
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.5, md: 1 } }}>
                <Link 
                  component="button"
                  onClick={() => setHelpCenterDialogOpen(true)}
                  sx={{ 
                    color: '#cccccc', 
                    textDecoration: 'none', 
                    textAlign: 'left',
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    '&:hover': { color: '#0A66C2' } 
                  }}
                >
                  Help Center
                </Link>
                <Link 
                  component="button"
                  onClick={() => setContactUsDialogOpen(true)}
                  sx={{ 
                    color: '#cccccc', 
                    textDecoration: 'none', 
                    textAlign: 'left',
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    '&:hover': { color: '#0A66C2' } 
                  }}
                >
                  Contact Us
                </Link>
                <Link 
                  component="button"
                  onClick={() => setFaqsDialogOpen(true)}
                  sx={{ 
                    color: '#cccccc', 
                    textDecoration: 'none', 
                    textAlign: 'left',
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    '&:hover': { color: '#0A66C2' } 
                  }}
                >
                  FAQ
                </Link>
                <Link 
                  href="mailto:support@resumeoptimizer.com"
                  sx={{ 
                    color: '#cccccc', 
                    textDecoration: 'none',
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    '&:hover': { color: '#0A66C2' } 
                  }}
                >
                  Email Support
                </Link>
              </Box>
            </Grid>

            <Grid item xs={6} md={2}>
              <Typography variant="h6" sx={{ 
                mb: { xs: 2, md: 3 }, 
                fontWeight: 600, 
                color: 'white',
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}>
                Legal
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.5, md: 1 } }}>
                <Link 
                  component="button"
                  onClick={() => setPrivacyDialogOpen(true)}
                  sx={{ 
                    color: '#cccccc', 
                    textDecoration: 'none', 
                    textAlign: 'left',
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    '&:hover': { color: '#0A66C2' } 
                  }}
                >
                  Privacy Policy
                </Link>
                <Link 
                  component="button"
                  onClick={() => setTermsDialogOpen(true)}
                  sx={{ 
                    color: '#cccccc', 
                    textDecoration: 'none', 
                    textAlign: 'left',
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    '&:hover': { color: '#0A66C2' } 
                  }}
                >
                  Terms of Service
                </Link>
                <Link 
                  component="button"
                  onClick={() => setCookieDialogOpen(true)}
                  sx={{ 
                    color: '#cccccc', 
                    textDecoration: 'none', 
                    textAlign: 'left',
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    '&:hover': { color: '#0A66C2' } 
                  }}
                >
                  Cookie Policy
                </Link>
                <Link 
                  href="mailto:legal@resumeoptimizer.com"
                  sx={{ 
                    color: '#cccccc', 
                    textDecoration: 'none',
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    '&:hover': { color: '#0A66C2' } 
                  }}
                >
                  Legal Inquiries
                </Link>
              </Box>
            </Grid>

            <Grid item xs={6} md={2}>
              <Typography variant="h6" sx={{ 
                mb: { xs: 2, md: 3 }, 
                fontWeight: 600, 
                color: 'white',
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}>
                Connect
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.5, md: 1 } }}>
                <Link 
                  href="https://linkedin.com/company/resumeoptimizer" 
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    color: '#cccccc', 
                    textDecoration: 'none',
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    '&:hover': { color: '#0A66C2' } 
                  }}
                >
                  LinkedIn
                </Link>
                <Link 
                  href="https://twitter.com/resumeoptimizer" 
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    color: '#cccccc', 
                    textDecoration: 'none',
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    '&:hover': { color: '#0A66C2' } 
                  }}
                >
                  Twitter
                </Link>
                <Link 
                  href="https://blog.resumeoptimizer.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    color: '#cccccc', 
                    textDecoration: 'none',
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    '&:hover': { color: '#0A66C2' } 
                  }}
                >
                  Blog
                </Link>
                <Link 
                  href="https://github.com/resumeoptimizer" 
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    color: '#cccccc', 
                    textDecoration: 'none',
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    '&:hover': { color: '#0A66C2' } 
                  }}
                >
                  GitHub
                </Link>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ 
            borderTop: '1px solid #333333', 
            mt: { xs: 4, md: 6 }, 
            pt: { xs: 3, md: 4 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="body2" sx={{ 
              color: '#cccccc',
              fontSize: { xs: '0.8rem', md: '0.9rem' }
            }}>
              © {new Date().getFullYear()} JobTailorAI. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: { xs: 2, md: 3 } }}>
              <Link 
                component="button"
                onClick={() => setPrivacyDialogOpen(true)}
                sx={{ 
                  color: '#cccccc', 
                  textDecoration: 'none', 
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                  '&:hover': { color: '#0A66C2' } 
                }}
              >
                Privacy
              </Link>
              <Link 
                component="button"
                onClick={() => setTermsDialogOpen(true)}
                sx={{ 
                  color: '#cccccc', 
                  textDecoration: 'none', 
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                  '&:hover': { color: '#0A66C2' } 
                }}
              >
                Terms
              </Link>
              <Link 
                component="button"
                onClick={() => setContactUsDialogOpen(true)}
                sx={{ 
                  color: '#cccccc', 
                  textDecoration: 'none', 
                  fontSize: { xs: '0.75rem', md: '0.875rem' },
                  '&:hover': { color: '#0A66C2' } 
                }}
              >
                Contact
              </Link>
            </Box>
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

      {/* Privacy Policy Dialog */}
      <Dialog
        open={privacyDialogOpen}
        onClose={() => setPrivacyDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, maxHeight: '80vh' } }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: '#0A66C2',
          fontWeight: 600,
          borderBottom: '1px solid #e0e0e0'
        }}>
          🔒 Privacy Policy
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            At JobTailorAI, we take your privacy seriously. This policy explains how we collect, use, and protect your information.
          </Typography>
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
            Information We Collect
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
            • Account information (email, name)<br/>
            • Resume content you upload<br/>
            • Job descriptions you provide<br/>
            • Usage analytics and performance data
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
            How We Use Your Information
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
            • To provide AI resume crafting services<br/>
            • To improve our algorithms and features<br/>
            • To communicate with you about your account<br/>
            • To ensure service security and prevent abuse
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
            Data Security
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
            We use industry-standard encryption and security measures to protect your data. 
            Your resume content is processed securely and never shared with third parties.
          </Typography>

          <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666' }}>
            For questions about this policy, contact us at privacy@resumeoptimizer.com
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setPrivacyDialogOpen(false)}
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)', px: 4 }}
          >
            I Understand
          </Button>
        </DialogActions>
      </Dialog>

      {/* Terms of Service Dialog */}
      <Dialog
        open={termsDialogOpen}
        onClose={() => setTermsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, maxHeight: '80vh' } }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: '#0A66C2',
          fontWeight: 600,
          borderBottom: '1px solid #e0e0e0'
        }}>
          📋 Terms of Service
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
            1. Service Description
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
            JobTailorAI provides AI-powered resume optimization services to help users create 
            job-specific resumes that are tailored to particular job descriptions.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
            2. User Responsibilities
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
            • Provide accurate information in your resume<br/>
            • Use the service for legitimate job applications<br/>
            • Maintain the confidentiality of your account<br/>
            • Comply with all applicable laws and regulations
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
            3. Intellectual Property
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
            You retain ownership of your resume content. JobTailorAI retains ownership 
            of the AI technology and service infrastructure.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
            4. Limitation of Liability
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
            JobTailorAI provides resume optimization services but does not guarantee 
            job placement or interview success. Use of our service is at your own discretion.
          </Typography>

          <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666' }}>
            For questions about these terms, contact us at legal@resumeoptimizer.com
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setTermsDialogOpen(false)}
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)', px: 4 }}
          >
            I Agree
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cookie Policy Dialog */}
      <Dialog
        open={cookieDialogOpen}
        onClose={() => setCookieDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: '#0A66C2',
          fontWeight: 600,
          borderBottom: '1px solid #e0e0e0'
        }}>
          🍪 Cookie Policy
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            We use cookies to enhance your experience on JobTailorAI.
          </Typography>
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
            Essential Cookies
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
            Required for the website to function properly, including authentication and security.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
            Analytics Cookies
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
            Help us understand how users interact with our service to improve functionality.
          </Typography>

          <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666' }}>
            You can manage cookie preferences in your browser settings.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setCookieDialogOpen(false)}
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)', px: 4 }}
          >
            Got It
          </Button>
        </DialogActions>
      </Dialog>

      {/* Help Center Dialog */}
      <Dialog
        open={helpCenterDialogOpen}
        onClose={() => setHelpCenterDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, maxHeight: '80vh' } }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: '#0A66C2',
          fontWeight: 600,
          borderBottom: '1px solid #e0e0e0'
        }}>
          🆘 Help Center
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Welcome to the JobTailorAI Help Center! Find answers to common questions and learn how to get the most out of our platform.
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
            🚀 Getting Started
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
            • Create your account and upload your resume<br/>
            • Paste a job description you're interested in<br/>
            • Let our AI craft your resume for that specific job<br/>
            • Preview, compare, and download your tailored resume
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
            💡 Pro Tips
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
            • Use the complete job description for best results<br/>
            • Review the comparison to understand changes<br/>
            • Download in Word format for easy editing<br/>
            • Create different versions for different job types
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
            🔧 Troubleshooting
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
            • Ensure your resume file is under 5MB<br/>
            • Use supported formats: PDF, Word, or text<br/>
            • Check your internet connection for uploads<br/>
            • Clear browser cache if experiencing issues
          </Typography>

          <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666' }}>
            Still need help? Contact our support team at support@resumeoptimizer.com
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setContactUsDialogOpen(true)}
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Contact Support
          </Button>
          <Button 
            onClick={() => setHelpCenterDialogOpen(false)}
            variant="contained"
            sx={{ background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)', px: 4 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
        </>
      )}
    </Box>
  );
}
