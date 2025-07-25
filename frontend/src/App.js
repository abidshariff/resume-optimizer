import React, { useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Authenticator } from '@aws-amplify/ui-react';
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
  
  // Enhanced UX state for processing
  const [processingStep, setProcessingStep] = useState(0);
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
  }, [jobStatus, isPolling]);

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

  // Custom form fields for the Authenticator
  const formFields = {
    signIn: {
      username: {
        placeholder: 'Enter your username or email',
        label: 'Username or Email *',
        isRequired: true,
      },
    },
    signUp: {
      username: {
        placeholder: 'Enter your username',
        label: 'Username *',
        isRequired: true,
      },
      email: {
        placeholder: 'Enter your email',
        label: 'Email *',
        isRequired: true,
      },
    },
  };

  // Wrap the app with Authenticator for user authentication
  return (
    <ThemeProvider theme={theme}>
      <Authenticator 
        loginMechanisms={['username']}
        formFields={formFields}
      >
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
                          color="primary"
                          endIcon={<AutoAwesomeIcon />}
                          disabled={!jobDescription}
                          onClick={handleOptimize}
                          size="large"
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

                      {/* Progress Milestones */}
                      <Box sx={{ mb: 4, width: '100%', maxWidth: 600 }}>
                        <Typography variant="h6" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
                          Progress
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
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                backgroundColor: milestone.completed ? 'success.main' : 'grey.300',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 3,
                                transition: 'all 0.3s ease'
                              }}
                            >
                              {milestone.completed ? (
                                <CheckCircleIcon sx={{ color: 'white', fontSize: 22 }} />
                              ) : (
                                <Typography sx={{ fontSize: 18 }}>{milestone.icon}</Typography>
                              )}
                            </Box>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: milestone.completed ? 600 : 400,
                                color: milestone.completed ? 'text.primary' : 'text.secondary',
                                fontSize: '1.1rem'
                              }}
                            >
                              {milestone.label}
                              {milestone.completed && ' ✅'}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      {/* Status and Progress Bar Side by Side */}
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 4, 
                          mb: 4,
                          bgcolor: 'primary.50',
                          borderColor: 'primary.200',
                          width: '100%',
                          maxWidth: 700
                        }}
                      >
                        {/* Single Container with Status and Progress Side by Side */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 4,
                          '@media (max-width: 768px)': {
                            flexDirection: 'column',
                            gap: 3
                          }
                        }}>
                          {/* Status Message - Left Side */}
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            flex: '1 1 auto',
                            minWidth: 0
                          }}>
                            <CircularProgress size={32} sx={{ mr: 2, flexShrink: 0 }} />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body1" fontWeight={600} sx={{ 
                                fontSize: '1rem', 
                                lineHeight: 1.3,
                                wordBreak: 'break-word'
                              }}>
                                {getEnhancedStatusMessage(jobStatus, statusMessage)}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {/* Progress Bar - Right Side */}
                          <Box sx={{ 
                            flex: '1 1 auto',
                            minWidth: 200,
                            '@media (max-width: 768px)': {
                              width: '100%',
                              minWidth: 'auto'
                            }
                          }}>
                            <Typography variant="h6" gutterBottom sx={{ 
                              textAlign: 'center', 
                              mb: 2,
                              fontSize: '1.1rem'
                            }}>
                              Overall Progress
                            </Typography>
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
                            <Typography variant="h5" color="primary" sx={{ 
                              mt: 2, 
                              textAlign: 'center', 
                              fontWeight: 700,
                              fontSize: '1.5rem'
                            }}>
                              {Math.round((milestones.filter(m => m.completed).length / milestones.length) * 100)}% Complete
                            </Typography>
                          </Box>
                        </Box>

                        {/* Estimated time - Full width below */}
                        <Box sx={{ 
                          textAlign: 'center', 
                          mt: 3, 
                          pt: 2, 
                          borderTop: '1px solid', 
                          borderColor: 'primary.200' 
                        }}>
                          <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 500 }}>
                            ⏱️ Estimated time remaining: 30-45 seconds
                          </Typography>
                        </Box>
                      </Paper>

                      {/* Educational Tips - Below */}
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
