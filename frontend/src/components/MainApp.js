import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, signOut, fetchAuthSession } from 'aws-amplify/auth';
import ProfileDialog from './ProfileDialog';
import SettingsDialog from './SettingsDialog';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  TextField, 
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Rating
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  AutoAwesome as AutoAwesomeIcon,
  Download as DownloadIcon,
  Logout as LogoutIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

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
        <Box sx={{ 
          mt: 2, 
          p: 2, 
          bgcolor: 'success.light', 
          borderRadius: 1,
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
          <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
            {file.name} uploaded successfully! Proceeding to next step...
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // UI state
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  
  // Enhanced UX state for processing
  const [currentTip, setCurrentTip] = useState(0);

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
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userSettings, setUserSettings] = useState({
    defaultOutputFormat: 'docx' // Default fallback
  });

  // Determine current step from URL
  const getCurrentStep = () => {
    const path = location.pathname;
    if (path === '/app' || path === '/app/upload') return 0;
    if (path === '/app/job-description') return 1;
    if (path === '/app/results') return 2;
    return 0;
  };

  const activeStep = getCurrentStep();
  const steps = ['Upload Resume', 'Enter Job Description', 'Get Optimized Resume'];

  // Load user settings from localStorage
  const loadUserSettings = () => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setUserSettings(parsedSettings);
        console.log('Loaded user settings:', parsedSettings);
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Load user settings from localStorage
  useEffect(() => {
    loadUserSettings();
    
    // Listen for storage changes (when settings are updated)
    const handleStorageChange = (e) => {
      if (e.key === 'userSettings') {
        console.log('Storage change detected, reloading settings');
        loadUserSettings();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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

  // Poll for job status when isPolling is true
  useEffect(() => {
    let statusInterval;
    
    if (isPolling && jobId) {
      console.log('Starting status polling for jobId:', jobId);
      
      statusInterval = setInterval(async () => {
        try {
          console.log('Polling status for jobId:', jobId);
          
          const { tokens } = await fetchAuthSession();
          const idToken = tokens.idToken.toString();
          
          const statusResponse = await fetch(`https://xnmokev79k.execute-api.us-east-1.amazonaws.com/dev/status?jobId=${jobId}`, {
            method: 'GET',
            headers: {
              'Authorization': idToken,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          if (!statusResponse.ok) {
            throw new Error(`Status check failed: ${statusResponse.status}`);
          }
          
          const statusData = await statusResponse.json();
          console.log('Status response received:', statusData);
          
          setJobStatus(statusData.status);
          setStatusMessage(statusData.message || 'Processing...');
          
          if (statusData.status === 'COMPLETED') {
            setIsPolling(false);
            setResult({
              optimizedResumeUrl: statusData.optimizedResumeUrl,
              fileType: statusData.fileType || 'docx',
              contentType: statusData.contentType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              downloadFilename: statusData.downloadFilename || `optimized_resume.${statusData.fileType || 'docx'}`
            });
            navigate('/app/results');
          } else if (statusData.status === 'FAILED') {
            setIsPolling(false);
            setError(statusData.message || 'Job failed');
            setSnackbarMessage(`Error: ${statusData.message || 'Job failed'}`);
            setSnackbarOpen(true);
          }
        } catch (error) {
          console.error('Error polling status:', error);
          // Don't stop polling on network errors, but limit retries
          if (error.message.includes('Status check failed')) {
            setIsPolling(false);
            setError(`Status check failed: ${error.message}`);
            setSnackbarMessage(`Error checking status: ${error.message}`);
            setSnackbarOpen(true);
          }
        }
      }, 3000); // Poll every 3 seconds
    }
    
    return () => {
      if (statusInterval) {
        console.log('Clearing status polling interval');
        clearInterval(statusInterval);
      }
    };
  }, [isPolling, jobId, navigate]);

  const loadUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      navigate('/');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
        
        // Show success message
        setSnackbarMessage(`Resume "${file.name}" uploaded successfully! Proceeding to next step...`);
        setSnackbarOpen(true);
        
        // Auto-navigate to next step after a brief delay
        setTimeout(() => {
          navigate('/app/job-description');
        }, 1500);
      };
      reader.readAsDataURL(file);
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
      const selectedFormat = userSettings.defaultOutputFormat || 'docx';
      console.log('Current user settings:', userSettings);
      console.log('Selected output format:', selectedFormat);
      
      const payload = {
        resume: resume,
        jobDescription: jobDescription,
        outputFormat: selectedFormat // Use user preference or default to docx
      };
      
      console.log('API payload:', payload);
      
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
          setStatusMessage(`Resume optimization completed (mock - ${selectedFormat})`);
          
          // Generate mock content based on selected format
          let mockContent, contentType, fileExtension;
          
          if (selectedFormat === 'pdf') {
            // Create a simple PDF-like content (in real app, this would be binary)
            mockContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

Mock PDF Resume Content
Generated: ${new Date().toLocaleString()}
Format: PDF Document (.pdf)

This is a mock PDF resume for local testing.
In production, this would be a properly formatted PDF file.`;
            contentType = 'application/pdf';
            fileExtension = 'pdf';
          } else if (selectedFormat === 'docx') {
            // Create a mock Word document content
            mockContent = `MOCK WORD DOCUMENT (.docx)
            
JOHN DOE
Email: john.doe@email.com | Phone: (555) 123-4567

PROFESSIONAL SUMMARY
Experienced professional with expertise in various technologies.

SKILLS
• JavaScript, React, Node.js
• Python, Django, Flask
• AWS, Docker, Kubernetes

EXPERIENCE
Senior Software Engineer | Tech Company
2020 - Present
• Developed scalable web applications
• Implemented CI/CD pipelines
• Led cross-functional teams

Generated: ${new Date().toLocaleString()}
Format: Mock Word Document (.docx)`;
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            fileExtension = 'docx';
          } else {
            // Default to text format
            mockContent = `JOHN DOE
Email: john.doe@email.com | Phone: (555) 123-4567

================================================================================

PROFESSIONAL SUMMARY
--------------------------------------------------------------------------------
Experienced professional with expertise in various technologies.

SKILLS
--------------------------------------------------------------------------------
• JavaScript, React, Node.js
• Python, Django, Flask  
• AWS, Docker, Kubernetes

EXPERIENCE
--------------------------------------------------------------------------------
Senior Software Engineer | Tech Company
2020 - Present
• Developed scalable web applications
• Implemented CI/CD pipelines
• Led cross-functional teams

================================================================================
Generated: ${new Date().toLocaleString()}
Format: Mock Plain Text (.txt)`;
            contentType = 'text/plain';
            fileExtension = 'txt';
          }
          
          setResult({
            optimizedResume: mockContent,
            optimizedResumeUrl: '#',
            contentType: contentType,
            fileType: fileExtension,
            downloadFilename: `mock_optimized_resume.${fileExtension}`
          });
          setIsPolling(false);
          navigate('/app/results');
        }, 5000);
        
        return;
      }
      
      const { tokens } = await fetchAuthSession();
      const idToken = tokens.idToken.toString();
      
      const response = await fetch('https://xnmokev79k.execute-api.us-east-1.amazonaws.com/dev/optimize', {
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
      // Handle localhost mock data
      if (window.location.hostname === 'localhost' && result.optimizedResumeUrl === '#') {
        const blob = new Blob([result.optimizedResume], { type: result.contentType || 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.downloadFilename || `optimized_resume.${result.fileType || 'txt'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }
      
      // For S3 pre-signed URLs, we don't need to add Authorization headers
      // The authentication is already included in the URL
      const resumeResponse = await fetch(result.optimizedResumeUrl, {
        method: 'GET'
      });
      
      if (!resumeResponse.ok) {
        throw new Error(`Failed to download resume: ${resumeResponse.status} ${resumeResponse.statusText}`);
      }
      
      // Get the response as a blob for binary data (Word documents)
      const blob = await resumeResponse.blob();
      
      // Create download link
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
    setResume(null);
    setResumeName('');
    setJobDescription('');
    navigate('/app/upload');
  };

  const cancelOptimization = () => {
    // Show confirmation dialog
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel the optimization? This will stop the current process and you\'ll need to start over.'
    );
    
    if (!confirmCancel) {
      return;
    }
    
    // Stop polling
    setIsPolling(false);
    
    // Reset job state
    setJobId(null);
    setJobStatus(null);
    setStatusMessage('');
    setResult(null);
    setError(null);
    
    // Show confirmation message
    setSnackbarMessage('Optimization canceled successfully');
    setSnackbarOpen(true);
    
    // Navigate back to job description
    navigate('/app/job-description');
  };

  const handleRatingSubmit = () => {
    // Here you could send the rating to your backend
    console.log('User rating submitted:', userRating);
    
    // Show success message
    setSnackbarMessage(`Thank you for rating us ${userRating} star${userRating !== 1 ? 's' : ''}! 🌟`);
    setSnackbarOpen(true);
    
    // Close dialog
    setRatingDialogOpen(false);
  };

  const isProcessing = isSubmitting || isPolling;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
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
                    onClick={() => navigate('/app/upload')}
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
                  minHeight: '600px'
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 4, width: '100%', maxWidth: 700 }}>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                    🤖 Optimizing Your Resume
                  </Typography>
                  <Typography variant="h6" color="textSecondary" paragraph>
                    Our AI is analyzing your resume and tailoring it to the job description.
                  </Typography>
                </Box>

                <Box sx={{ width: '100%', maxWidth: 400, mb: 4 }}>
                  <LinearProgress 
                    variant="indeterminate"
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
                  <Typography variant="body2" color="textSecondary" sx={{ 
                    textAlign: 'center',
                    mt: 2,
                    fontWeight: 500
                  }}>
                    ⏱️ Time to complete: 30-45 seconds
                  </Typography>
                </Box>

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

                <Button 
                  variant="outlined" 
                  onClick={cancelOptimization}
                  disabled={isSubmitting}
                  color="error"
                  sx={{
                    borderColor: '#d32f2f',
                    color: '#d32f2f',
                    '&:hover': {
                      borderColor: '#b71c1c',
                      backgroundColor: 'rgba(211, 47, 47, 0.04)'
                    },
                    '&:disabled': {
                      borderColor: '#ccc',
                      color: '#ccc'
                    }
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Cancel Optimization'}
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
                    variant="outlined" 
                    color="primary"
                    onClick={() => setRatingDialogOpen(true)}
                    size="large"
                  >
                    ⭐ Rate Your Experience
                  </Button>
                </Box>
              </motion.div>
            )}
          </Paper>
        </motion.div>
      </Container>
      
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

      {/* Profile Dialog */}
      <ProfileDialog 
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
      />

      {/* Settings Dialog */}
      <SettingsDialog 
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        onSettingsChange={(newSettings) => {
          setUserSettings(newSettings);
          console.log('MainApp received settings update:', newSettings);
        }}
      />

      {/* Rating Dialog */}
      <Dialog 
        open={ratingDialogOpen} 
        onClose={() => setRatingDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#0A66C2' }}>
            ⭐ Rate Your Experience
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body1" sx={{ mb: 3, color: '#666666' }}>
            How would you rate your resume optimization experience?
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Rating
              name="user-rating"
              value={userRating}
              onChange={(event, newValue) => {
                setUserRating(newValue || 1);
              }}
              size="large"
              sx={{
                fontSize: '3rem',
                '& .MuiRating-iconFilled': {
                  color: '#FFD700',
                },
                '& .MuiRating-iconHover': {
                  color: '#FFD700',
                }
              }}
            />
          </Box>
          
          <Typography variant="h6" sx={{ color: '#0A66C2', fontWeight: 600 }}>
            {userRating === 1 && "We'll do better next time! 😔"}
            {userRating === 2 && "Thanks for the feedback! 🙂"}
            {userRating === 3 && "Good to know! 😊"}
            {userRating === 4 && "Great! We're glad you liked it! 😄"}
            {userRating === 5 && "Awesome! You made our day! 🎉"}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={() => setRatingDialogOpen(false)}
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleRatingSubmit}
            sx={{
              background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
              px: 4
            }}
          >
            Submit Rating
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MainApp;
