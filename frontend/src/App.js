import React, { useState, useEffect } from 'react';
import { API, Auth } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
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
  createTheme
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
  Error as ErrorIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

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
  
  // Legacy variables for backward compatibility with existing UI
  const isProcessing = isSubmitting || isPolling;
  const optimizedResume = result ? 'Resume ready for download' : null;
  const optimizedResumeType = result?.contentType || 'text/plain';

  const steps = ['Upload Resume', 'Enter Job Description', 'Get Optimized Resume'];

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

  // Poll for job status
  useEffect(() => {
    let intervalId;
    
    if (isPolling && jobId) {
      intervalId = setInterval(async () => {
        try {
          const statusResponse = await API.get('resumeOptimizer', '/status', {
            queryStringParameters: {
              jobId: jobId
            }
          });
          
          console.log('Status response:', statusResponse);
          setJobStatus(statusResponse.status);
          setStatusMessage(statusResponse.message || '');
          
          // If job is complete, stop polling and set result
          if (statusResponse.status === 'COMPLETED') {
            setIsPolling(false);
            setResult(statusResponse);
            setActiveStep(2);
          } else if (statusResponse.status === 'FAILED') {
            setIsPolling(false);
            setError(statusResponse.message || 'Job failed');
            setSnackbarMessage(`Error: ${statusResponse.message || 'Job failed'}`);
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
  }, [isPolling, jobId]);

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
      console.log("Starting resume optimization...");
      
      // Check payload size before sending
      const payload = {
        resume: resume,
        jobDescription: jobDescription,
        outputFormat: outputFormat
      };
      const payloadSize = new Blob([JSON.stringify(payload)]).size;
      console.log(`Payload size: ${(payloadSize / 1024 / 1024).toFixed(2)} MB`);
      
      if (payloadSize > 10 * 1024 * 1024) { // 10MB limit
        throw new Error(`Payload too large: ${(payloadSize / 1024 / 1024).toFixed(2)} MB. Maximum allowed is 10 MB.`);
      }
      
      // Submit the job and get job ID immediately
      const response = await API.post('resumeOptimizer', '/optimize', {
        body: payload
      });
      
      console.log("API response received:", response);
      
      if (response.jobId) {
        setJobId(response.jobId);
        setJobStatus(response.status || 'PROCESSING');
        setStatusMessage(response.message || 'Job submitted and processing started');
        setIsPolling(true);
        setIsSubmitting(false);
      } else {
        throw new Error('No job ID returned from the API');
      }
    } catch (error) {
      console.error('Error submitting job:', error);
      
      let errorMessage = error.message;
      
      // Handle specific HTTP status codes
      if (error.response) {
        const status = error.response.status;
        if (status === 413) {
          errorMessage = 'File or request too large. Please try with a smaller resume file or shorter job description.';
        } else if (status === 502 || status === 504) {
          errorMessage = 'Server timeout. Please try again in a moment.';
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      }
      
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
      // Fetch the optimized resume content
      const resumeResponse = await fetch(result.optimizedResumeUrl);
      if (!resumeResponse.ok) {
        throw new Error(`Failed to fetch optimized resume: ${resumeResponse.status} ${resumeResponse.statusText}`);
      }
      
      const contentType = result.contentType || 'text/plain';
      const fileExtension = result.fileType || 'txt';
      const filename = result.downloadFilename || `optimized_resume.${fileExtension}`;
      
      let blob;
      if (contentType.includes('application/')) {
        // For binary files like Word documents
        blob = await resumeResponse.blob();
      } else {
        // For text files
        const resumeText = await resumeResponse.text();
        blob = new Blob([resumeText], { type: contentType });
      }
      
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
  };

  // Wrap the app with Authenticator for user authentication
  return (
    <ThemeProvider theme={theme}>
      <Authenticator>
        {({ signOut, user }) => (
          <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar position="static" color="primary" elevation={0}>
              <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AutoAwesomeIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    Resume Optimizer
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'secondary.main',
                      width: 32,
                      height: 32,
                      fontSize: '0.875rem',
                      mr: 1
                    }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    {user.username}
                  </Typography>
                  <IconButton color="inherit" onClick={signOut} size="small">
                    <LogoutIcon />
                  </IconButton>
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
                  variant="h3" 
                  component="h1" 
                  align="center" 
                  gutterBottom
                  sx={{ 
                    mb: 1,
                    background: 'linear-gradient(45deg, #3f51b5 30%, #f50057 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  AI Resume Optimizer
                </Typography>
                <Typography 
                  variant="h6" 
                  component="h2" 
                  align="center" 
                  color="textSecondary"
                  gutterBottom
                  sx={{ mb: 4, fontWeight: 400 }}
                >
                  Tailor your resume to match job descriptions with AI
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
                  
                  {activeStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
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
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button 
                          variant="outlined" 
                          onClick={() => setActiveStep(0)}
                        >
                          Back
                        </Button>
                        <Button 
                          variant="contained" 
                          color="primary"
                          endIcon={<AutoAwesomeIcon />}
                          disabled={!jobDescription || isProcessing}
                          onClick={handleOptimize}
                        >
                          {isProcessing ? (
                            <>
                              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                              Optimizing...
                            </>
                          ) : 'Optimize Resume'}
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
                <Divider sx={{ mb: 3 }} />
                <Typography variant="body2" color="textSecondary">
                  Resume Optimizer uses AI to tailor your resume to specific job descriptions,
                  increasing your chances of getting past Applicant Tracking Systems (ATS).
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Your data is processed securely and not stored permanently.
                </Typography>
              </Box>
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
          </Box>
        )}
      </Authenticator>
    </ThemeProvider>
  );
}

export default App;
