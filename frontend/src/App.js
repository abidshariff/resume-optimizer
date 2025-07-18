import React, { useState } from 'react';
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
  ArrowForward as ArrowForwardIcon
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

function App() {
  const [resume, setResume] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [optimizedResume, setOptimizedResume] = useState(null);
  const [optimizedResumeType, setOptimizedResumeType] = useState('text/plain');
  const [optimizedResumeExtension, setOptimizedResumeExtension] = useState('txt');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const steps = ['Upload Resume', 'Enter Job Description', 'Get Optimized Resume'];

  const handleResumeChange = (file) => {
    if (file) {
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

    setIsProcessing(true);
    setError(null);
    
    try {
      console.log("Starting resume optimization...");
      
      // Get the current session and token
      const session = await Auth.currentSession();
      const token = session.getIdToken().getJwtToken();
      
      console.log("Authentication token retrieved successfully");
      console.log("Token:", token.substring(0, 20) + "...");  // Log part of the token for debugging
      
      // Use Amplify's API.post method with authentication
      const response = await API.post('resumeOptimizer', '/optimize', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,  // No Bearer prefix, Amplify adds it
          'Accept': 'application/json'
        },
        body: {
          resume: resume,
          jobDescription: jobDescription
        },
        response: true  // Get the full response object
      });
      
      console.log("API response received:", response);
      
      // Parse the response - it might be in different formats depending on how API Gateway returns it
      let responseData = response;
      if (response.body) {
        // If the response has a body property, it's likely from API Gateway
        responseData = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
      }
      
      console.log("Parsed response data:", responseData);
      
      if (responseData && responseData.optimizedResumeUrl) {
        console.log("Fetching optimized resume from URL:", responseData.optimizedResumeUrl);
        
        // Use the fileType from the response instead of parsing from URL
        const fileExtension = responseData.fileType || 'txt';
        let contentType = responseData.contentType || 'text/plain';
        
        // Fallback logic if fileType is not provided
        if (!responseData.fileType) {
          // Extract just the filename part before query parameters
          const urlPath = new URL(responseData.optimizedResumeUrl).pathname;
          const cleanFileExtension = urlPath.split('.').pop().toLowerCase();
          
          if (cleanFileExtension === 'docx' || cleanFileExtension === 'doc') {
            if (cleanFileExtension === 'docx') {
              contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            } else {
              contentType = 'application/msword';
            }
            setOptimizedResumeExtension(cleanFileExtension);
          }
        } else {
          setOptimizedResumeExtension(fileExtension);
        }
        
        setOptimizedResumeType(contentType);
        
        // Fetch the optimized resume content
        const resumeResponse = await fetch(responseData.optimizedResumeUrl);
        if (!resumeResponse.ok) {
          throw new Error(`Failed to fetch optimized resume: ${resumeResponse.status} ${resumeResponse.statusText}`);
        }
        
        // Handle different content types
        if (contentType.includes('application/')) {
          // For binary files like Word documents
          const resumeBlob = await resumeResponse.blob();
          setOptimizedResume(resumeBlob);
        } else {
          // For text files
          const resumeText = await resumeResponse.text();
          setOptimizedResume(resumeText);
        }
        
        console.log("Optimized resume content retrieved successfully");
        
        setActiveStep(2);
      } else {
        console.error("Invalid API response:", response);
        throw new Error('No optimized resume URL returned in the API response');
      }
    } catch (error) {
      console.error('Error optimizing resume:', error);
      
      // More detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
      }
      
      setError(`Error optimizing resume: ${error.message}`);
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadOptimizedResume = () => {
    let blob;
    
    if (optimizedResume instanceof Blob) {
      // If it's already a Blob (binary data like Word document)
      blob = optimizedResume;
    } else {
      // If it's text data
      blob = new Blob([optimizedResume], { type: optimizedResumeType });
    }
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized-resume.${optimizedResumeExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up
    
    setSnackbarMessage('Resume downloaded successfully!');
    setSnackbarOpen(true);
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
                  
                  {activeStep === 2 && optimizedResume && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <AutoAwesomeIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h5">
                          Your Optimized Resume
                        </Typography>
                      </Box>
                      
                      {optimizedResumeType.includes('application/') ? (
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 3, 
                            maxHeight: '500px', 
                            overflow: 'auto',
                            mb: 3,
                            bgcolor: 'grey.50',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <DescriptionIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                          <Typography variant="h6" gutterBottom>
                            Word Document Ready for Download
                          </Typography>
                          <Typography variant="body2" color="textSecondary" align="center" paragraph>
                            Your optimized resume has been prepared as a Word document.
                            Click the download button below to save it to your computer.
                          </Typography>
                          <Button 
                            variant="contained" 
                            color="primary"
                            startIcon={<DownloadIcon />}
                            onClick={downloadOptimizedResume}
                            sx={{ mt: 2 }}
                          >
                            Download Word Document
                          </Button>
                        </Paper>
                      ) : (
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 3, 
                            maxHeight: '500px', 
                            overflow: 'auto',
                            fontFamily: '"Courier New", monospace',
                            whiteSpace: 'pre-wrap',
                            mb: 3,
                            bgcolor: 'grey.50'
                          }}
                        >
                          {optimizedResume}
                        </Paper>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button 
                          variant="outlined" 
                          onClick={() => setActiveStep(1)}
                        >
                          Back to Job Description
                        </Button>
                        <Button 
                          variant="contained" 
                          color="primary"
                          startIcon={<DownloadIcon />}
                          onClick={downloadOptimizedResume}
                        >
                          {optimizedResumeType.includes('application/') 
                            ? 'Download Word Document' 
                            : 'Download Optimized Resume'}
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
