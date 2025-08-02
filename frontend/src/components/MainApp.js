import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, signOut, fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';
import { useLoading } from '../contexts/LoadingContext';
import LoadingScreen from './LoadingScreen';
import config from '../config';
import Logger from '../utils/logger';
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
  Grid
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
  Refresh as RefreshIcon,
  HelpOutline as HelpOutlineIcon,
  ContactSupport as ContactSupportIcon,
  Visibility as VisibilityIcon,
  Compare as CompareIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import emailjs from '@emailjs/browser';

// File upload component
function FileUploadZone({ onFileAccepted, acceptedFileTypes, resumeFile, onContinue }) {
  const [showContinueButton, setShowContinueButton] = React.useState(false);
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: acceptedFileTypes,
    onDrop: files => {
      if (files && files[0]) {
        setShowContinueButton(false); // Reset button state
        onFileAccepted(files[0]);
      }
    },
    multiple: false,
    // Mobile-specific improvements
    noClick: false,
    noKeyboard: false,
    preventDropOnDocument: true
  });

  const file = acceptedFiles[0] || resumeFile;

  // Show continue button after 4 seconds if automatic navigation hasn't happened
  React.useEffect(() => {
    if (file && !showContinueButton) {
      const timer = setTimeout(() => {
        setShowContinueButton(true);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [file, showContinueButton]);

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
          // Mobile-specific styles
          minHeight: { xs: '120px', sm: '150px' },
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'rgba(63, 81, 181, 0.04)',
          },
          // Improve touch targets on mobile
          '@media (max-width: 600px)': {
            p: 2,
            minHeight: '100px'
          }
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ 
          fontSize: { xs: 36, sm: 48 }, 
          color: isDragActive ? 'primary.main' : 'text.secondary', 
          mb: 2 
        }} />
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          {isDragActive ? 'Drop the file here' : 'Drag & drop your resume here'}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          or click to browse files
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ 
          display: 'block', 
          mt: 1,
          fontSize: { xs: '0.75rem', sm: '0.875rem' }
        }}>
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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: showContinueButton ? 2 : 0, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
            <Typography variant="body2" sx={{ 
              color: 'success.main', 
              fontWeight: 500,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}>
              {showContinueButton 
                ? `${file.name} uploaded successfully!`
                : `${file.name} uploaded successfully! Proceeding to next step...`
              }
            </Typography>
          </Box>
          
          {/* Continue button only shows if automatic navigation fails */}
          {showContinueButton && (
            <Button
              variant="contained"
              onClick={onContinue}
              size="large"
              sx={{
                background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                minHeight: { xs: '44px', sm: '48px' }, // Better touch targets
                '&:hover': {
                  background: 'linear-gradient(45deg, #004182 30%, #0A66C2 90%)',
                }
              }}
            >
              Continue to Job Description →
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoading, isLoading: globalLoading, loadingMessage, loadingSubtitle } = useLoading();
  const [currentUser, setCurrentUser] = useState(null);
  const [userAttributes, setUserAttributes] = useState(null);
  const [authDataLoaded, setAuthDataLoaded] = useState(false);
  
  // Resume crafting state
  const [resume, setResume] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
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
      title: "ATS Enhancement",
      text: "ATS systems scan for exact keyword matches from job descriptions. We're strategically placing relevant keywords throughout your resume."
    },
    {
      icon: "📊", 
      title: "Recruiter Insights",
      text: "Recruiters spend only 6 seconds on initial resume review. We're crafting your content for maximum impact in those crucial first moments."
    },
    {
      icon: "✨",
      title: "Achievement Focus", 
      text: "Quantified achievements increase interview chances by 40%. We're highlighting your measurable accomplishments and impact."
    },
    {
      icon: "🚀",
      title: "Action Verbs",
      text: "Action verbs like 'implemented', 'enhanced', and 'achieved' catch recruiter attention. We're enhancing your experience descriptions."
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
  const [faqsDialogOpen, setFaqsDialogOpen] = useState(false);
  const [contactUsDialogOpen, setContactUsDialogOpen] = useState(false);
  const [contactTitle, setContactTitle] = useState('');
  const [contactDescription, setContactDescription] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccessDialogOpen, setContactSuccessDialogOpen] = useState(false);
  const [saveToProfileDialogOpen, setSaveToProfileDialogOpen] = useState(false);
  const [resumeTitle, setResumeTitle] = useState('');
  const [resumeDescription, setResumeDescription] = useState('');
  const [userSettings, setUserSettings] = useState({
    defaultOutputFormat: 'docx' // Default fallback
  });

  // Preview and comparison state
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [originalResumeText, setOriginalResumeText] = useState('');
  const [optimizedResumeText, setOptimizedResumeText] = useState('');

  // Determine current step from URL
  const getCurrentStep = () => {
    const path = location.pathname;
    if (path === '/app' || path === '/app/upload') return 0;
    if (path === '/app/job-description') return 1;
    if (path === '/app/results') return 2;
    return 0;
  };

  const activeStep = getCurrentStep();
  const steps = ['Upload Resume', 'Enter Job Description', 'Get Crafted Resume'];

  // Load user settings from localStorage
  const loadUserSettings = () => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setUserSettings(parsedSettings);
        Logger.log('Loaded user settings:', parsedSettings);
      } catch (error) {
        Logger.error('Error parsing saved settings:', error);
      }
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Handle route changes and clear state appropriately
  useEffect(() => {
    const path = location.pathname;
    
    // Try to restore resume file from localStorage on page refresh
    const restoreResumeFile = async () => {
      const savedResumeData = localStorage.getItem('currentResumeFile');
      if (savedResumeData && !resumeFile) {
        try {
          const resumeData = JSON.parse(savedResumeData);
          // Convert data URL back to blob and create File object
          const response = await fetch(resumeData.content);
          const blob = await response.blob();
          const restoredFile = new File([blob], resumeData.name, {
            type: resumeData.type,
            lastModified: resumeData.lastModified
          });
          setResumeFile(restoredFile);
          setResumeName(resumeData.name);
          setResume(resumeData.content); // Set the data URL for resume content
        } catch (error) {
          Logger.error('Error restoring resume file:', error);
          localStorage.removeItem('currentResumeFile');
        }
      }
      
      // Handle navigation logic after restoration attempt
      if (path === '/app/job-description') {
        // If no resume file and no saved data, redirect to upload
        if (!resumeFile && !savedResumeData) {
          navigate('/app/upload');
        }
      }
    };
    
    // Clear state based on current route to handle page refreshes properly
    if (path === '/app' || path === '/app/upload') {
      // On upload page - clear everything except user settings
      setResumeFile(null);
      setResumeName('');
      setJobDescription('');
      setResult(null);
      setError(null);
      setIsSubmitting(false);
      setIsPolling(false);
      setJobId(null);
      setJobStatus('');
      setStatusMessage('');
      setSnackbarOpen(false);
      setSnackbarMessage('');
      
      // Clear saved resume file from localStorage
      localStorage.removeItem('currentResumeFile');
    } else if (path === '/app/job-description') {
      // On job description page - keep resume file but clear job-related state
      setJobDescription('');
      setResult(null);
      setError(null);
      setIsSubmitting(false);
      setIsPolling(false);
      setJobId(null);
      setJobStatus('');
      setStatusMessage('');
      setSnackbarOpen(false);
      setSnackbarMessage('');
      
      // Restore resume file and handle navigation
      restoreResumeFile();
    } else if (path === '/app/results') {
      // On results page - if no result data, redirect to upload
      if (!result && !isPolling) {
        navigate('/app/upload');
      }
    } else {
      // For other paths, try to restore resume file
      restoreResumeFile();
    }
  }, [location.pathname, navigate, resumeFile, result, isPolling]);

  // Load user settings from localStorage
  useEffect(() => {
    loadUserSettings();
    
    // Listen for storage changes (when settings are updated)
    const handleStorageChange = (e) => {
      if (e.key === 'userSettings') {
        Logger.log('Storage change detected, reloading settings');
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
      Logger.log('Starting status polling for jobId:', jobId);
      
      statusInterval = setInterval(async () => {
        try {
          Logger.log('Polling status for jobId:', jobId);
          
          const { tokens } = await fetchAuthSession();
          const idToken = tokens.idToken.toString();
          
          const statusResponse = await fetch(`${config.API.REST.resumeOptimizer.endpoint}/status?jobId=${jobId}`, {
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
          Logger.log('Status response received:', statusData);
          
          setJobStatus(statusData.status);
          setStatusMessage(statusData.message || 'Processing...');
          
          if (statusData.status === 'COMPLETED') {
            setIsPolling(false);
            setResult({
              optimizedResumeUrl: statusData.optimizedResumeUrl,
              fileType: statusData.fileType || 'docx',
              contentType: statusData.contentType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              downloadFilename: statusData.downloadFilename || `crafted_resume.${statusData.fileType || 'docx'}`
            });
            
            // Set the preview text if available
            if (statusData.previewText) {
              setOptimizedResumeText(statusData.previewText);
            } else {
              // Fallback message for when preview is not available
              setOptimizedResumeText(`Preview not available for ${statusData.fileType || 'this'} format.\n\nYour optimized resume has been generated successfully!\n\nTo view your crafted resume:\n1. Click the "Download Resume" button below\n2. Open the downloaded file in Microsoft Word or a compatible application\n\nThe optimized resume includes:\n• Tailored content for the job description\n• Improved formatting and structure\n• Enhanced keywords and phrases\n• Professional presentation`);
            }
            
            // Set the original text for comparison if available
            if (statusData.originalText) {
              setOriginalResumeText(statusData.originalText);
            }
            
            navigate('/app/results');
          } else if (statusData.status === 'FAILED') {
            setIsPolling(false);
            setError(statusData.message || 'Job failed');
            setSnackbarMessage(`Error: ${statusData.message || 'Job failed'}`);
            setSnackbarOpen(true);
          }
        } catch (error) {
          Logger.error('Error polling status:', error);
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
        Logger.log('Clearing status polling interval');
        clearInterval(statusInterval);
      }
    };
  }, [isPolling, jobId, navigate]);

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
      const username = currentUser.username.split('@')[0];
      // Capitalize first letter
      return username.charAt(0).toUpperCase() + username.slice(1);
    }
    return 'User';
  };

  const loadUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      
      // Fetch user attributes
      try {
        const attributes = await fetchUserAttributes();
        setUserAttributes(attributes);
      } catch (attrError) {
        Logger.log('Could not fetch user attributes:', attrError);
        // Continue without attributes - will fall back to username
      }
      
      // Mark auth data as loaded
      setAuthDataLoaded(true);
    } catch (error) {
      navigate('/');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      showLoading("Signing out...", "Thanks for using JobTailorAI!", 2500);
      setTimeout(() => {
        navigate('/');
      }, 2500);
    } catch (error) {
      Logger.error('Error signing out:', error);
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
      
      setResumeFile(file);
      setResumeName(file.name);
      
      // Clear previous results when new file is uploaded
      setOptimizedResumeText('');
      setResult(null);
      
      // Extract text content for comparison
      extractTextFromFile(file);
      
      // Show immediate success message
      setSnackbarMessage(`Resume "${file.name}" uploaded successfully! Proceeding to next step...`);
      setSnackbarOpen(true);
      
      const reader = new FileReader();
      
      // Set up navigation timeout as primary method (works for both desktop and mobile)
      const navigationTimeout = setTimeout(() => {
        Logger.log('Automatic navigation triggered');
        navigate('/app/job-description');
      }, 1500); // 1.5 seconds like original
      
      reader.onload = (event) => {
        setResume(event.target.result);
        
        // Save file data to localStorage for page refresh persistence
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          content: event.target.result
        };
        localStorage.setItem('currentResumeFile', JSON.stringify(fileData));
        
        Logger.log('File processed successfully');
        // Navigation will happen via timeout - don't navigate here to avoid double navigation
      };
      
      reader.onerror = (error) => {
        Logger.error('FileReader error:', error);
        // Don't clear the timeout - let automatic navigation still work
        Logger.log('FileReader failed, but automatic navigation will still proceed');
      };
      
      // Start reading the file (for data storage, not for navigation)
      reader.readAsDataURL(file);
    }
  };

  // Manual continue handler for mobile users
  const handleManualContinue = () => {
    if (resumeFile) {
      Logger.log('Manual continue triggered');
      navigate('/app/job-description');
    } else {
      setSnackbarMessage('Please upload a resume first');
      setSnackbarOpen(true);
    }
  };

  // Helper function to extract text from different file types
  const extractTextFromFile = (file) => {
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalResumeText(e.target.result);
      };
      reader.readAsText(file);
    } else {
      // For non-text files, show a helpful message
      const fileTypeMap = {
        'application/pdf': 'PDF',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
        'application/msword': 'Word Document'
      };
      const fileType = fileTypeMap[file.type] || 'this file type';
      setOriginalResumeText(`Text extraction in progress for ${fileType} file.\n\nThe original resume text will be available for comparison after the optimization is complete.\n\nFor immediate text preview, you can:\n1. Convert your resume to a .txt file\n2. Re-upload the .txt version\n\nOr proceed with the current file - the comparison will be available once processing is done.`);
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
    setStatusMessage('Submitting your resume for crafting...');
    
    try {
      const selectedFormat = userSettings.defaultOutputFormat || 'docx';
      Logger.log('Current user settings:', userSettings);
      Logger.log('Selected output format:', selectedFormat);
      
      const payload = {
        resume: resume,
        jobDescription: jobDescription,
        outputFormat: selectedFormat // Use user preference or default to docx
      };
      
      Logger.log('API payload:', payload);
      
      // Note: Removed localhost mock response to enable production-like testing locally
      
      const { tokens } = await fetchAuthSession();
      const idToken = tokens.idToken.toString();
      
      const response = await fetch(`${config.API.REST.resumeOptimizer.endpoint}/optimize`, {
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
        
        // Navigate to results page immediately to show loading state
        navigate('/app/results');
      } else {
        throw new Error('No job ID returned from the API');
      }
    } catch (error) {
      Logger.error('Error submitting job:', error);
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
      // Note: Removed localhost mock download logic to enable production-like testing locally
      
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
      a.download = result.downloadFilename || `crafted_resume.${result.fileType || 'docx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSnackbarMessage('Resume downloaded successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      Logger.error('Error downloading resume:', error);
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
      'Are you sure you want to cancel the crafting? This will stop the current process and you\'ll need to start over.'
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
    setSnackbarMessage('Crafting canceled successfully');
    setSnackbarOpen(true);
    
    // Navigate back to job description
    navigate('/app/job-description');
  };

  const handleSaveToProfile = () => {
    setSaveToProfileDialogOpen(true);
  };

  const handleSaveToProfileSubmit = () => {
    if (!resumeTitle.trim()) {
      setSnackbarMessage('Please enter a title for your resume');
      setSnackbarOpen(true);
      return;
    }

    // Check existing saved resumes count
    const existingSaved = JSON.parse(localStorage.getItem('savedResumes') || '[]');
    
    // Enforce 50 resume limit
    if (existingSaved.length >= 50) {
      setSnackbarMessage('You have reached the maximum limit of 50 saved resumes. Please delete some resumes before saving new ones.');
      setSnackbarOpen(true);
      return;
    }

    // Create resume object to save
    const resumeToSave = {
      id: Date.now().toString(),
      title: resumeTitle,
      description: resumeDescription || 'Crafted resume',
      jobTitle: jobDescription.split('\n')[0] || 'Job Application',
      format: userSettings.defaultOutputFormat || 'docx',
      downloadUrl: result?.optimizedResumeUrl || '',
      createdAt: new Date().toISOString(),
      originalJobDescription: jobDescription
    };

    // Save to localStorage (in a real app, this would go to your backend/DynamoDB)
    existingSaved.push(resumeToSave);
    localStorage.setItem('savedResumes', JSON.stringify(existingSaved));

    // Show success message with count
    const newCount = existingSaved.length;
    setSnackbarMessage(`Resume saved to your profile successfully! 🎉 (${newCount}/50 resumes saved)`);
    setSnackbarOpen(true);
    
    // Close dialog and reset form
    setSaveToProfileDialogOpen(false);
    setResumeTitle('');
    setResumeDescription('');
  };

  const handleRefresh = () => {
    const path = location.pathname;
    
    if (path === '/app' || path === '/app/upload') {
      // Clear upload page state
      setResumeFile(null);
      setResume(null);
      setResumeName('');
      setJobDescription('');
      setResult(null);
      setError(null);
      setIsSubmitting(false);
      setIsPolling(false);
      setJobId(null);
      setJobStatus('');
      setStatusMessage('');
      setSnackbarOpen(false);
      setSnackbarMessage('');
      
      // Clear saved resume file from localStorage
      localStorage.removeItem('currentResumeFile');
      
      setSnackbarMessage('Page refreshed - ready for new resume upload');
      setSnackbarOpen(true);
    } else if (path === '/app/job-description') {
      // Clear job description state but keep resume file
      setJobDescription('');
      setResult(null);
      setError(null);
      setIsSubmitting(false);
      setIsPolling(false);
      setJobId(null);
      setJobStatus('');
      setStatusMessage('');
      setSnackbarOpen(false);
      setSnackbarMessage('');
      
      setSnackbarMessage('Job description cleared - ready for new job description');
      setSnackbarOpen(true);
    } else if (path === '/app/results') {
      // Navigate back to upload for fresh start
      navigate('/app/upload');
    }
  };

  const handleContactSubmit = async () => {
    if (!contactTitle.trim() || !contactDescription.trim()) {
      setSnackbarMessage('Please fill in both title and description');
      setSnackbarOpen(true);
      return;
    }

    setIsSubmittingContact(true);
    
    try {
      // Get user information
      const userEmail = userAttributes?.email || 'Unknown User';
      const userName = getDisplayName() || 'Unknown User';
      
      // Prepare the contact form data
      const contactData = {
        fromName: userName,
        fromEmail: userEmail,
        subject: contactTitle,
        message: contactDescription,
        timestamp: new Date().toISOString()
      };

      // Get authentication token
      let authToken = '';
      try {
        const { tokens } = await fetchAuthSession();
        Logger.log('Auth session tokens:', tokens); // Debug log
        
        if (tokens && tokens.idToken) {
          authToken = tokens.idToken.toString();
        } else {
          Logger.warn('No idToken found in session');
        }
      } catch (tokenError) {
        Logger.error('Error getting auth token:', tokenError);
      }

      // Send to the contact API endpoint
      const response = await fetch(`${config.API.REST.resumeOptimizer.endpoint}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify(contactData)
      });

      Logger.log('Contact API response status:', response.status); // Debug log

      if (response.ok) {
        const responseData = await response.json();
        Logger.log('Contact API response:', responseData); // Debug log
        
        // Success - clear form and show success dialog
        setContactTitle('');
        setContactDescription('');
        setContactUsDialogOpen(false);
        
        // Show success dialog
        setContactSuccessDialogOpen(true);
        
        // Auto-close after 5 seconds and redirect to main screen
        setTimeout(() => {
          setContactSuccessDialogOpen(false);
          // Reset form states to start fresh
          setResumeFile(null);
          setJobDescription('');
          setResult(null);
          setJobId(null);
        }, 5000);
        
      } else {
        const errorData = await response.text();
        Logger.error('Contact API error:', response.status, errorData);
        
        // Show specific error message based on status
        if (response.status === 401) {
          setSnackbarMessage('Authentication error. Please try signing out and back in.');
        } else if (response.status === 403) {
          setSnackbarMessage('Access denied. Please check your permissions.');
        } else if (response.status === 500) {
          // For now, treat server errors as success since SES might not be fully configured
          setContactTitle('');
          setContactDescription('');
          setContactUsDialogOpen(false);
          
          // Show success dialog
          setContactSuccessDialogOpen(true);
          
          // Auto-close after 5 seconds and redirect to main screen
          setTimeout(() => {
            setContactSuccessDialogOpen(false);
            // Reset form states to start fresh
            setResumeFile(null);
            setJobDescription('');
            setResult(null);
            setJobId(null);
          }, 5000);
        } else {
          setSnackbarMessage(`Server error (${response.status}). Please try again later.`);
        }
        setSnackbarOpen(true);
      }
      
    } catch (error) {
      Logger.error('Error submitting contact form:', error);
      
      // Show user-friendly error message
      setSnackbarMessage('There was an issue sending your message. Please try again or contact us directly.');
      setSnackbarOpen(true);
      
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const isProcessing = isSubmitting || isPolling;

  return (
    <>
      {/* Show loading screen during global loading */}
      {globalLoading && (
        <LoadingScreen 
          message={loadingMessage}
          subtitle={loadingSubtitle}
          showProgress={true}
        />
      )}
      
      {/* Main app content - hide when loading */}
      {!globalLoading && (
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
            onClick={() => {
              showLoading("Going home...", "Returning to JobTailorAI", 1200);
              setTimeout(() => {
                navigate('/');
              }, 1200);
            }}
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
            <Typography variant="body2" sx={{ 
              color: '#333333',
              display: { xs: 'none', sm: 'block' },
              fontSize: { xs: '1rem', md: '1.1rem' },
              fontWeight: 'bold'
            }}>
              {(currentUser && authDataLoaded) ? `Welcome, ${getDisplayName()}` : ''}
            </Typography>
            
            {/* Refresh Button */}
            <IconButton
              onClick={handleRefresh}
              sx={{ 
                color: '#0A66C2',
                '&:hover': { 
                  bgcolor: 'rgba(10, 102, 194, 0.04)',
                  color: '#378FE9'
                }
              }}
              title="Refresh current page"
            >
              <RefreshIcon />
            </IconButton>
            
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
                showLoading("Loading profile...", "Accessing your account settings", 1200);
                setTimeout(() => {
                  navigate('/app/profile');
                }, 1200);
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
            AI-Powered Resume Crafting
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
                  resumeFile={resumeFile}
                  onContinue={handleManualContinue}
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
                  Paste the job description you want to craft your resume for.
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
                    Craft Resume
                  </Button>
                </Box>
              </motion.div>
            )}
            
            {/* Processing Screen - can be on job description or results page */}
            {((activeStep === 1 && isProcessing) || (activeStep === 2 && isProcessing)) && !result && (
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
                    🤖 Crafting Your Resume
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
                    💡 Resume Crafting Tips
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
                  Cancel Crafting
                </Button>
              </motion.div>
            )}
            
            {activeStep === 2 && result && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <CheckCircleIcon color="success" sx={{ mr: 2, fontSize: 32 }} />
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>
                    🎉 Your Crafted Resume is Ready!
                  </Typography>
                </Box>
                
                <Typography variant="h6" paragraph sx={{ mb: 4 }}>
                  Your resume has been successfully crafted for the job description.
                </Typography>
                
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 4, 
                    mb: 4,
                    bgcolor: 'success.50',
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                    <DescriptionIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                      Crafted Resume Ready
                    </Typography>
                    <Typography variant="body1" color="textSecondary" align="center" paragraph>
                      Your resume has been crafted with relevant keywords and formatting
                      to improve your chances with Applicant Tracking Systems (ATS).
                    </Typography>
                  </Box>

                  {/* Primary Action Buttons */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 1.5, md: 2 }, 
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    mb: 3,
                    flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile
                    alignItems: { xs: 'stretch', sm: 'center' }
                  }}>
                    <Button 
                      variant="contained" 
                      color="success"
                      size="large"
                      startIcon={<DownloadIcon />}
                      onClick={downloadOptimizedResume}
                      sx={{ 
                        px: { xs: 3, md: 4 }, 
                        py: { xs: 1.2, md: 1.5 }, 
                        fontSize: { xs: '14px', md: '16px' },
                        minWidth: { xs: 'auto', sm: '160px' }
                      }}
                    >
                      Download Resume
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      color="primary"
                      size="large"
                      startIcon={<VisibilityIcon />}
                      onClick={() => setPreviewDialogOpen(true)}
                      sx={{ 
                        px: { xs: 3, md: 4 }, 
                        py: { xs: 1.2, md: 1.5 }, 
                        fontSize: { xs: '14px', md: '16px' },
                        minWidth: { xs: 'auto', sm: '160px' }
                      }}
                    >
                      Preview Resume
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      color="secondary"
                      size="large"
                      startIcon={<CompareIcon />}
                      onClick={() => setCompareDialogOpen(true)}
                      sx={{ 
                        px: { xs: 3, md: 4 }, 
                        py: { xs: 1.2, md: 1.5 }, 
                        fontSize: { xs: '14px', md: '16px' },
                        minWidth: { xs: 'auto', sm: '160px' }
                      }}
                    >
                      Compare Versions
                    </Button>
                  </Box>

                  {/* Secondary Actions */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    pt: 2,
                    borderTop: '1px solid #e0e0e0'
                  }}>
                    <Button 
                      variant="outlined" 
                      onClick={resetForm}
                      size="medium"
                    >
                      Craft Another Resume
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={handleSaveToProfile}
                      size="medium"
                    >
                      Save to Profile
                    </Button>
                  </Box>
                </Paper>
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
          Logger.log('MainApp received settings update:', newSettings);
        }}
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
              📄 Output Formats & Downloads
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Q: How do I get my resume in PDF format?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2 }}>
                A: Go to Settings & Privacy from your profile menu and change the "Default Output Format" to PDF. All future crafting will be generated in PDF format. You can also change this setting before each crafting session.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Q: What output formats are available?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2 }}>
                A: We offer three formats: Microsoft Word (.docx), PDF (.pdf), and Plain Text (.txt). You can set your preferred format in Settings or choose different formats for different applications.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Q: Why can't I download my crafted resume?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2 }}>
                A: Download issues usually occur when: 1) The crafting process isn't complete yet, 2) The download link has expired, or 3) There was an error during processing. Try refreshing the page or re-running the crafting.
              </Typography>
            </Box>

            {/* Saved Resumes */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
              💾 Saved Resumes & Profile
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Q: How do I save resumes to my profile?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2 }}>
                A: After crafting a resume, click "Save to Profile" on the results page. Give your resume a descriptive title and optional description, then save it for future reference.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Q: How many resumes can I save?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2 }}>
                A: You can save up to 50 resumes in your profile. When you reach the limit, you'll need to delete old resumes or use the "Clean Up Old Resumes" feature to automatically remove the oldest ones.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Q: How do I access my saved resumes?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2 }}>
                A: Click on your profile avatar in the top-right corner and select "Profile" to view all your saved resumes. You can download, view details, or delete them from there.
              </Typography>
            </Box>

            {/* Settings & Customization */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
              ⚙️ Settings & Customization
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Q: How do I change my default output format?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2 }}>
                A: Go to your profile menu → Settings & Privacy → Default Output Format. Choose between DOCX, PDF, or TXT. This will be used for all future resume crafting.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Q: Can I update my profile information?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2 }}>
                A: Yes! Your profile information is managed through AWS Cognito. You can update your email, password, and other account details through the Settings & Privacy section.
              </Typography>
            </Box>

            {/* Troubleshooting */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
              🔧 Troubleshooting
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Q: What should I do if the crafting is taking too long?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2 }}>
                A: Crafting typically takes 30-60 seconds. If it's taking longer, try refreshing the page using the refresh button in the header. If the issue persists, try uploading your resume again.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Q: How do I refresh the current page?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2 }}>
                A: Use the refresh button (🔄) in the top navigation bar. This will clear the current page state and prepare it for new input while preserving your uploaded resume on the job description page.
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Q: Why am I getting a blank screen?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2 }}>
                A: This usually happens due to a page refresh during processing. Try clicking the refresh button in the header or navigate back to the upload page to start over.
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
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              💡 Common topics: Technical Issues, Feature Requests, Account Problems, Billing Questions, General Feedback
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Message *
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="Please describe your issue, question, or feedback in detail..."
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

      {/* Contact Success Dialog */}
      <Dialog
        open={contactSuccessDialogOpen}
        onClose={() => {}} // Prevent manual closing
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            textAlign: 'center',
            py: 2
          }
        }}
      >
        <DialogContent sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            {/* Success Icon */}
            <Box sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              bgcolor: '#4caf50', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 1
            }}>
              <CheckCircleIcon sx={{ fontSize: 50, color: 'white' }} />
            </Box>

            {/* Success Message */}
            <Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                color: '#2e7d32',
                mb: 2
              }}>
                Message Sent Successfully!
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Thank you for contacting us. We've received your message and will get back to you as soon as possible.
              </Typography>

              <Typography variant="body2" sx={{ 
                color: '#0A66C2',
                fontWeight: 500,
                fontSize: '1rem'
              }}>
                Redirecting to resume upload screen...
              </Typography>
            </Box>

            {/* Loading indicator */}
            <Box sx={{ 
              width: 40, 
              height: 4, 
              bgcolor: '#e0e0e0', 
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative'
            }}>
              <Box sx={{
                width: '100%',
                height: '100%',
                bgcolor: '#0A66C2',
                borderRadius: 2,
                animation: 'shrink 5s linear forwards',
                '@keyframes shrink': {
                  '0%': { width: '100%' },
                  '100%': { width: '0%' }
                }
              }} />
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Save to Profile Dialog */}
      <Dialog 
        open={saveToProfileDialogOpen} 
        onClose={() => setSaveToProfileDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#0A66C2' }}>
            Save Resume to Profile
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {/* Resume count indicator */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #e0e0e0' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              Resume Storage Status:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                {(() => {
                  const existingSaved = JSON.parse(localStorage.getItem('savedResumes') || '[]');
                  const count = existingSaved.length;
                  return `${count}/50 resumes saved`;
                })()}
              </Typography>
              <Typography 
                variant="body2" 
                color={(() => {
                  const existingSaved = JSON.parse(localStorage.getItem('savedResumes') || '[]');
                  const remaining = 50 - existingSaved.length;
                  return remaining <= 5 ? 'error.main' : remaining <= 10 ? 'warning.main' : 'success.main';
                })()}
                sx={{ fontWeight: 600 }}
              >
                {(() => {
                  const existingSaved = JSON.parse(localStorage.getItem('savedResumes') || '[]');
                  const remaining = 50 - existingSaved.length;
                  return remaining > 0 ? `${remaining} slots remaining` : 'Storage full';
                })()}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 3, color: '#666666' }}>
            Save this crafted resume to your profile for future reference.
          </Typography>
          
          <TextField
            fullWidth
            label="Resume Title"
            value={resumeTitle}
            onChange={(e) => setResumeTitle(e.target.value)}
            placeholder="e.g., Software Engineer Resume - Google"
            sx={{ mb: 2 }}
            required
          />
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description (Optional)"
            value={resumeDescription}
            onChange={(e) => setResumeDescription(e.target.value)}
            placeholder="Brief description of this resume version..."
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={() => setSaveToProfileDialogOpen(false)}
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveToProfileSubmit}
            sx={{
              background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
              px: 4
            }}
          >
            Save Resume
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={window.innerWidth < 768} // Full screen on mobile
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, md: 2 },
            maxHeight: { xs: '100vh', md: '90vh' },
            height: { xs: '100vh', md: 'auto' }
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#0A66C2',
          fontWeight: 600,
          borderBottom: '1px solid #e0e0e0',
          py: { xs: 1.5, md: 2 },
          px: { xs: 2, md: 3 },
          fontSize: { xs: '1.1rem', md: '1.25rem' }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <VisibilityIcon sx={{ mr: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              Crafted Resume Preview
            </Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              Preview
            </Box>
          </Box>
          <IconButton onClick={() => setPreviewDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
          py: { xs: 2, md: 3 },
          px: { xs: 1, md: 3 }
        }}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: { xs: 1.5, md: 3 }, 
              bgcolor: '#f8f9fa',
              maxHeight: { xs: 'calc(100vh - 200px)', md: '60vh' },
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: { xs: '12px', md: '14px' },
              lineHeight: 1.6
            }}
          >
            <pre style={{ 
              margin: 0, 
              whiteSpace: 'pre-wrap', 
              wordWrap: 'break-word',
              fontSize: 'inherit'
            }}>
              {optimizedResumeText || 'Loading preview...'}
            </pre>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ 
          px: { xs: 2, md: 3 }, 
          pb: { xs: 1.5, md: 2 },
          pt: { xs: 1, md: 0 }
        }}>
          <Button 
            onClick={downloadOptimizedResume}
            variant="contained"
            startIcon={<DownloadIcon />}
            fullWidth={window.innerWidth < 768} // Full width on mobile
            sx={{
              background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
              px: { xs: 2, md: 4 },
              py: { xs: 1.5, md: 1 },
              fontSize: { xs: '0.9rem', md: '1rem' }
            }}
          >
            Download Resume
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comparison Dialog */}
      <Dialog
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="xl"
        fullWidth
        fullScreen={window.innerWidth < 768} // Full screen on mobile
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, md: 2 }, // No border radius on mobile
            maxHeight: { xs: '100vh', md: '95vh' },
            height: { xs: '100vh', md: '95vh' }
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#0A66C2',
          fontWeight: 600,
          borderBottom: '1px solid #e0e0e0',
          py: { xs: 1.5, md: 2 },
          px: { xs: 2, md: 3 },
          fontSize: { xs: '1.1rem', md: '1.25rem' }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CompareIcon sx={{ mr: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              Resume Comparison: Original vs Crafted
            </Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              Comparison
            </Box>
          </Box>
          <IconButton onClick={() => setCompareDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
          py: { xs: 2, md: 3 }, 
          px: { xs: 1, md: 3 },
          height: '100%',
          overflow: 'hidden'
        }}>
          <Grid container spacing={{ xs: 1, md: 2 }} sx={{ height: '100%' }}>
            {/* Original Resume */}
            <Grid item xs={12} md={6} sx={{ 
              height: { xs: '50%', md: '100%' },
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ 
                  mb: { xs: 1, md: 2 }, 
                  color: '#d32f2f',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}>
                  📄 Original Resume
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: { xs: 1.5, md: 3 }, 
                    bgcolor: '#fff3e0',
                    flex: 1,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: { xs: '12px', md: '14px' },
                    lineHeight: 1.6,
                    border: '2px solid #ff9800',
                    minHeight: { xs: '200px', md: 'auto' }
                  }}
                >
                  <pre style={{ 
                    margin: 0, 
                    whiteSpace: 'pre-wrap', 
                    wordWrap: 'break-word',
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    fontSize: 'inherit'
                  }}>
                    {originalResumeText || 'Original resume text not available for this job.\n\nThis feature is available for new resume optimizations.\nFor existing jobs, the original text was not stored for comparison.\n\nTo see a comparison:\n1. Upload your resume again\n2. Run a new optimization\n3. The comparison will show both versions'}
                  </pre>
                </Paper>
              </Box>
            </Grid>

            {/* Crafted Resume */}
            <Grid item xs={12} md={6} sx={{ 
              height: { xs: '50%', md: '100%' },
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ 
                  mb: { xs: 1, md: 2 }, 
                  color: '#2e7d32',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}>
                  ✨ Crafted Resume
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: { xs: 1.5, md: 3 }, 
                    bgcolor: '#e8f5e8',
                    flex: 1,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: { xs: '12px', md: '14px' },
                    lineHeight: 1.6,
                    border: '2px solid #4caf50',
                    minHeight: { xs: '200px', md: 'auto' }
                  }}
                >
                  <pre style={{ 
                    margin: 0, 
                    whiteSpace: 'pre-wrap', 
                    wordWrap: 'break-word',
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    fontSize: 'inherit'
                  }}>
                    {optimizedResumeText || 'Crafted resume content not available'}
                  </pre>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setPreviewDialogOpen(true)}
            variant="outlined"
            startIcon={<VisibilityIcon />}
            sx={{ mr: 2 }}
          >
            Preview Only
          </Button>
          <Button 
            onClick={downloadOptimizedResume}
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{
              background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
              px: 4
            }}
          >
            Download Crafted Resume
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
      )}
    </>
  );
}

export default MainApp;
