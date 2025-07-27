import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
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
  Person as PersonIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export function LandingPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, false = not auth, true = auth
  const [currentUser, setCurrentUser] = useState(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setProfileMenuAnchor(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
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
            {isAuthenticated === null ? (
              // Loading state
              <CircularProgress size={24} />
            ) : isAuthenticated ? (
              // Authenticated user: Show profile menu and optimize button
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
                  Welcome, {currentUser?.username || 'User'}
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
                    setProfileMenuAnchor(null);
                    navigate('/app/upload');
                  }}>
                    <ListItemIcon>
                      <AutoAwesomeIcon sx={{ color: '#0A66C2' }} />
                    </ListItemIcon>
                    <ListItemText primary="Resume Optimizer" />
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
              </>
            ) : (
              // Non-authenticated user: Show sign-in and get started buttons
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
            )}
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
                  {isAuthenticated 
                    ? `Welcome back, ${currentUser?.username || 'User'}!`
                    : 'Land Your Dream Job with AI-Optimized Resumes'
                  }
                </Typography>
                <Typography variant="h5" sx={{ 
                  color: '#666666',
                  mb: 4, 
                  fontWeight: 400,
                  lineHeight: 1.4
                }}>
                  {isAuthenticated
                    ? 'Ready to optimize another resume? Let\'s get started with your next career opportunity.'
                    : 'Transform your resume in seconds with our advanced AI technology. Get past ATS systems and land 3x more interviews.'
                  }
                </Typography>
                <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
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
                    {isAuthenticated ? 'Continue Optimizing' : 'Start Optimizing Now'}
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
              {isAuthenticated ? 'Continue Optimizing' : 'Get Started Free'}
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
    </Box>
  );
}
