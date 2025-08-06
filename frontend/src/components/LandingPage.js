import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut, fetchAuthSession } from 'aws-amplify/auth';
import { useLoading } from '../contexts/LoadingContext';
import ProfileDialog from './ProfileDialog';
import SettingsDialog from './SettingsDialog';
import LoadingScreen from './LoadingScreen';
import MobileResumeMockups from './MobileResumeMockups';
import MobileStats from './MobileStats';
import LoggerTest from './LoggerTest';
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
      icon: <AutoAwesomeIcon sx={{ fontSize: 40, color: '#0A66C2' }} />,
      title: 'ATS Optimization',
      description: 'Ensure your resume passes Applicant Tracking Systems with keyword optimization and proper formatting.'
    },
    {
      icon: <WorkIcon sx={{ fontSize: 40, color: '#0A66C2' }} />,
      title: 'Job-Specific Tailoring',
      description: 'Each resume is uniquely crafted for the specific job you\'re applying to, not generic templates.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Temporary Logger Test Component - Remove in production */}
      {(process.env.NODE_ENV === 'development' || process.env.REACT_APP_TEST_MODE === 'true') && <LoggerTest />}
      
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
                <AutoAwesomeIcon sx={{ mr: { xs: 1, md: 2 }, color: '#0A66C2', fontSize: { xs: 24, md: 28 } }} />
                <Typography variant="h5" component="div" sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  JobTailorAI
                </Typography>
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
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2a2a2a 100%)',
        py: { xs: 4, md: 6 },
        minHeight: { xs: 'calc(100vh - 64px)', md: 'calc(100vh - 80px)' }, // Subtract AppBar height
        display: 'flex',
        alignItems: 'center',
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
          <Grid container spacing={{ xs: 3, md: 8 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography variant="h1" sx={{ 
                  fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem', lg: '3.2rem' },
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: { xs: 2, md: 3 },
                  lineHeight: { xs: 1.3, md: 1.2 },
                  textAlign: { xs: 'center', md: 'left' },
                  maxWidth: { xs: '100%', md: '90%', lg: '85%' },
                  letterSpacing: '-0.02em'
                }}>
                  {(currentUser && authDataLoaded)
                    ? `Welcome back, ${getDisplayName()}!`
                    : 'Land Your Dream Job with AI-Crafted Resumes'
                  }
                </Typography>
                <Typography variant="h5" sx={{ 
                  fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.2rem', lg: '1.3rem' },
                  color: '#cccccc',
                  mb: { xs: 4, md: 5 }, 
                  fontWeight: 400,
                  lineHeight: { xs: 1.5, md: 1.4 },
                  textAlign: { xs: 'center', md: 'left' },
                  maxWidth: { xs: '100%', md: '85%', lg: '80%' },
                  letterSpacing: '0.01em'
                }}>
                  {currentUser
                    ? 'Ready to craft another resume? Let\'s get started with your next career opportunity.'
                    : 'Transform your resume in seconds with our advanced AI technology. Get past ATS systems and land 3x more interviews.'
                  }
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: { xs: 'center', md: 'flex-start' }, 
                  mb: { xs: 3, md: 4 }
                }}>
                  <Button 
                    variant="contained" 
                    size={isMobile ? "medium" : "large"}
                    onClick={handleGetStarted}
                    endIcon={<PlayArrowIcon />}
                    sx={{
                      py: { xs: 1.5, md: 2 },
                      px: { xs: 3, md: 4 },
                      fontSize: { xs: '0.9rem', md: '1.1rem' },
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
                  height: { xs: '220px', sm: '480px', md: '530px' },
                  pt: 2
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
                    alignItems: 'center',
                    gap: { sm: 2, md: 3 },
                    flexDirection: 'row'
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
                      width: { xs: '130px', sm: '300px', md: '340px' },
                      height: { xs: '190px', sm: '450px', md: '500px' },
                      bgcolor: '#f9f9f9',
                      borderRadius: 2,
                      border: '2px solid #ddd',
                      position: 'relative',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      overflow: 'hidden',
                      p: { xs: 0.8, md: 1.8 }
                    }}>
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
                      <Box sx={{ mb: 1.2 }}>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '9px', md: '11px' }, 
                          fontWeight: 'bold', 
                          color: '#333',
                          mb: 0.5,
                          textDecoration: 'underline'
                        }}>
                          SUMMARY
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '4px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.3
                        }}>
                          Experienced data engineer with background in ETL processes and database management.
                        </Typography>
                      </Box>

                      {/* Experience Section */}
                      <Box sx={{ mb: 1.2 }}>
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
                          lineHeight: 1.2,
                          mb: 0.2
                        }}>
                          • Built ETL pipelines using Python and SQL for data processing
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.2,
                          mb: 0.2
                        }}>
                          • Managed PostgreSQL and MySQL databases for reporting
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.2,
                          mb: 0.2
                        }}>
                          • Worked with team on data migration and cleanup projects
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.2,
                          mb: 0.3
                        }}>
                          • Optimized database queries to improve performance
                        </Typography>
                        
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '8px', md: '10px' }, 
                          fontWeight: 'bold',
                          color: '#444',
                          mb: 0.2
                        }}>
                          Junior Data Analyst - DataSoft LLC (2020-2022)
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.2,
                          mb: 0.2
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
                      <Box sx={{ mb: 1 }}>
                        <Typography sx={{ 
                          fontSize: { xs: '6px', sm: '9px', md: '11px' }, 
                          fontWeight: 'bold', 
                          color: '#333',
                          mb: 0.5,
                          textDecoration: 'underline'
                        }}>
                          TECHNICAL SKILLS
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.3
                        }}>
                          Python, SQL, PostgreSQL, MySQL, Excel, Git
                        </Typography>
                      </Box>
                      
                      {/* Education Section */}
                      <Box sx={{ mb: 1 }}>
                        <Typography sx={{ 
                          fontSize: { xs: '6px', sm: '9px', md: '11px' }, 
                          fontWeight: 'bold', 
                          color: '#333',
                          mb: 0.5,
                          textDecoration: 'underline'
                        }}>
                          EDUCATION
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '8px', md: '10px' }, 
                          fontWeight: 'bold', 
                          color: '#444',
                          mb: 0.3
                        }}>
                          BS Computer Science - State University
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#555',
                          lineHeight: 1.2
                        }}>
                          2018-2022 | GPA: 3.5
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                  </Box>

                  {/* AI Transformation Arrow in the middle */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.7 }}
                    animate={{ scale: 1.2, opacity: 1 }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                    style={{ 
                      margin: { xs: '0 4px', sm: '0 25px' }, 
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%'
                    }}
                  >
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mt: { xs: 4, sm: 6, md: 7 } // Move down slightly to align with middle of resumes
                    }}>
                      <AutoAwesomeIcon sx={{ 
                        fontSize: { xs: 18, sm: 35, md: 45 }, 
                        color: '#0A66C2',
                        filter: 'drop-shadow(0 0 15px rgba(10, 102, 194, 0.6))',
                        transform: 'rotate(0deg)'
                      }} />
                    </Box>
                  </motion.div>

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
                      width: { xs: '130px', sm: '320px', md: '370px' },
                      height: { xs: '190px', sm: '450px', md: '500px' },
                      bgcolor: 'white',
                      borderRadius: 2,
                      border: '2px solid #0A66C2',
                      position: 'relative',
                      boxShadow: '0 8px 30px rgba(10, 102, 194, 0.3)',
                      overflow: 'hidden',
                      p: { xs: 0.8, md: 1.8 }
                    }}>
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
                      <Box sx={{ mb: 1.2 }}>
                        <Typography sx={{ 
                          fontSize: { xs: '6px', sm: '9px', md: '11px' }, 
                          fontWeight: 'bold', 
                          color: '#0A66C2',
                          mb: 0.5,
                          borderBottom: '1px solid #0A66C2',
                          pb: 0.2
                        }}>
                          PROFESSIONAL SUMMARY
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.3
                        }}>
                          AI/ML Developer with expertise in machine learning, deep learning, and data science. Proven track record in developing intelligent systems and predictive models.
                        </Typography>
                      </Box>

                      {/* Experience Section */}
                      <Box sx={{ mb: 1.2 }}>
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
                          lineHeight: 1.2,
                          mb: 0.3
                        }}>
                          • Developed end-to-end ML pipelines using TensorFlow & PyTorch
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.2,
                          mb: 0.2
                        }}>
                          • Built predictive models achieving 95% accuracy for forecasting
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.2,
                          mb: 0.2
                        }}>
                          • Implemented MLOps practices for model deployment and monitoring
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.2,
                          mb: 0.2
                        }}>
                          • Led cross-functional AI initiatives with engineering and product teams
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.2,
                          mb: 0.3
                        }}>
                          • Optimized neural networks reducing inference time by 40%
                        </Typography>
                        
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '8px', md: '10px' }, 
                          fontWeight: 'bold',
                          color: '#0A66C2',
                          mb: 0.2
                        }}>
                          Data Scientist - DataSoft LLC (2020-2022)
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.2,
                          mb: 0.2
                        }}>
                          • Built advanced predictive analytics models for customer segmentation
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.2,
                          mb: 0.2
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
                      <Box sx={{ mb: 1 }}>
                        <Typography sx={{ 
                          fontSize: { xs: '6px', sm: '9px', md: '11px' }, 
                          fontWeight: 'bold', 
                          color: '#0A66C2',
                          mb: 0.5,
                          borderBottom: '1px solid #0A66C2',
                          pb: 0.2
                        }}>
                          CORE COMPETENCIES
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.3
                        }}>
                          Python, TensorFlow, PyTorch, Scikit-learn, Keras, Neural Networks, Deep Learning, NLP, Computer Vision, MLOps, AWS SageMaker
                        </Typography>
                      </Box>
                      
                      {/* Education Section - Enhanced */}
                      <Box sx={{ mb: 1 }}>
                        <Typography sx={{ 
                          fontSize: { xs: '6px', sm: '9px', md: '11px' }, 
                          fontWeight: 'bold', 
                          color: '#0A66C2',
                          mb: 0.5,
                          borderBottom: '1px solid #0A66C2',
                          pb: 0.2
                        }}>
                          EDUCATION & CERTIFICATIONS
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '8px', md: '10px' }, 
                          fontWeight: 'bold', 
                          color: '#0A66C2',
                          mb: 0.3
                        }}>
                          BS Computer Science
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '5px', sm: '7.5px', md: '9px' }, 
                          color: '#333',
                          lineHeight: 1.2
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
                        <Box sx={{
                          fontSize: { xs: '6px', sm: '7px', md: '8px' },
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
                              width: { xs: '5px', sm: '6px', md: '7px' },
                              height: { xs: '5px', sm: '6px', md: '7px' },
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
                            color: '#0A66C2', 
                            fontWeight: 'bold',
                            mb: 0.5
                          }}>
                            {stat.number}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: '#cccccc',
                            fontSize: { sm: '10px', md: '12px' }
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

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }} id="features-section">
        <Typography variant="h2" align="center" sx={{ 
          fontSize: { xs: '1.8rem', md: '2.5rem' },
          mb: { xs: 6, md: 8 },
          fontWeight: 700,
          background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Why Choose JobTailorAI?
        </Typography>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ 
                height: '100%', 
                textAlign: 'center', 
                p: { xs: 2, md: 0 },
                '&:hover': { 
                  transform: 'translateY(-4px)', 
                  transition: 'all 0.3s ease' 
                } 
              }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Box sx={{ mb: { xs: 2, md: 3 } }}>{feature.icon}</Box>
                  <Typography variant="h6" sx={{ 
                    mb: { xs: 1.5, md: 2 }, 
                    fontWeight: 600,
                    fontSize: { xs: '1.1rem', md: '1.25rem' }
                  }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#666666', 
                    lineHeight: 1.6,
                    fontSize: { xs: '0.85rem', md: '0.9rem' }
                  }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

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

      {/* CTA Section */}
      <Box sx={{ 
        bgcolor: 'linear-gradient(135deg, #0A66C2 0%, #378FE9 100%)', 
        py: { xs: 4, md: 6 },
        color: 'white'
      }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" sx={{ 
              fontSize: { xs: '1.8rem', md: '2.5rem' },
              mb: { xs: 2, md: 3 },
              fontWeight: 700,
              px: { xs: 2, md: 0 }
            }}>
              Ready to Land Your Dream Job?
            </Typography>
            <Typography variant="h5" sx={{ 
              fontSize: { xs: '1rem', md: '1.25rem' },
              mb: { xs: 4, md: 6 },
              opacity: 0.9,
              fontWeight: 300,
              px: { xs: 2, md: 0 }
            }}>
              Join thousands of professionals who have successfully crafted their resumes
            </Typography>
            <Button 
              variant="contained"
              size={isMobile ? "medium" : "large"}
              onClick={handleGetStarted}
              sx={{
                bgcolor: 'white',
                color: '#0A66C2',
                px: { xs: 4, md: 6 },
                py: { xs: 1.5, md: 2 },
                fontSize: { xs: '1rem', md: '1.2rem' },
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
      <Box sx={{ bgcolor: '#1a1a1a', color: 'white', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 3, md: 4 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 3 } }}>
                <WorkIcon sx={{ fontSize: { xs: 28, md: 32 }, mr: 2, color: '#0A66C2' }} />
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  color: 'white',
                  fontSize: { xs: '1.2rem', md: '1.5rem' }
                }}>
                  JobTailorAI
                </Typography>
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
