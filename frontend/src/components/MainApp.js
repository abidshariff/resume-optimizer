import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, signOut, fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';
import { useLoading } from '../contexts/LoadingContext';
import LoadingScreen from './LoadingScreen';
import config from '../config';
import Logger from '../utils/logger';
import ProfileDialog from './ProfileDialog';
import SettingsDialog from './SettingsDialog';
import FormatSelector from './FormatSelector';
import StylishBackButton from './StylishBackButton';
// Removed JobTailorIcon import - using inline branding instead

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
  FormControlLabel,
  Switch,
  Tooltip,
  Grid,
  Divider,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,

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
  Info as InfoIcon,
  Email as EmailIcon,
  Clear as ClearIcon,
  Link as LinkIcon,
  GetApp as ExtractIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

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
    <Box sx={{ mt: 1, mb: 2, flex: 1 }}>
      <Paper
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 2,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backgroundColor: isDragActive ? 'rgba(63, 81, 181, 0.04)' : 'background.paper',
          minHeight: '100px',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'rgba(63, 81, 181, 0.04)',
          }
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ 
          fontSize: 32, 
          color: isDragActive ? 'primary.main' : 'text.secondary', 
          mb: 1 
        }} />
        <Typography variant="body1" gutterBottom>
          {isDragActive ? 'Drop the file here' : 'Drag & drop your resume here'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          or click to browse files
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ 
          display: 'block', 
          mt: 0.5
        }}>
          Supported formats: PDF, DOC, DOCX
        </Typography>
      </Paper>
      
      {file && (
        <Box sx={{ 
          mt: 1, 
          p: 1.5, 
          bgcolor: 'success.light', 
          borderRadius: 1,
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: showContinueButton ? 1 : 0, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ mr: 1, color: 'success.main', fontSize: 20 }} />
            <Typography variant="body2" sx={{ 
              color: 'success.main', 
              fontWeight: 500
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
              size="small"
              sx={{
                background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                color: 'white',
                px: 3,
                py: 1,
                '&:hover': {
                  background: 'linear-gradient(45deg, #004182 30%, #0A66C2 90%)',
                }
              }}
            >
              Continue to Job Details →
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
  const [jobTitle, setJobTitle] = useState('');
  const [generateCV, setGenerateCV] = useState(false); // Generate CV toggle
  const [selectedResumeFormat, setSelectedResumeFormat] = useState('pdf'); // Direct format selection
  const [selectedCoverLetterFormat, setSelectedCoverLetterFormat] = useState('pdf'); // Direct format selection
  const [jobUrl, setJobUrl] = useState(''); // Job URL for extraction
  const [companyName, setCompanyName] = useState(''); // Manual company name input
  const [manualJobDescription, setManualJobDescription] = useState(''); // Manual job description input
  const [urlExtractionFailed, setUrlExtractionFailed] = useState(false); // Track if URL extraction failed
  const [isExtracting, setIsExtracting] = useState(false); // Track if extraction is in progress
  // Note: Job data will be extracted during form submission, not stored in state
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

  // Define isProcessing early to avoid hoisting issues
  const isProcessing = isSubmitting || isPolling;

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
      icon: "🎯",
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
    defaultOutputFormat: 'pdf', // Default fallback
    resumeTemplate: 'professional' // Default template
  });

  // Preview and comparison state
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [originalResumeText, setOriginalResumeText] = useState('');
  const [optimizedResumeText, setOptimizedResumeText] = useState('');
  const [coverLetterText, setCoverLetterText] = useState(''); // Cover letter state
  const [coverLetterDialogOpen, setCoverLetterDialogOpen] = useState(false); // Cover letter dialog state

  // Determine current step from URL
  const getCurrentStep = () => {
    const path = location.pathname;
    if (path === '/app' || path === '/app/upload') return 0;
    if (path === '/app/job-description') return 1;
    if (path === '/app/results') return 2;
    return 0;
  };

  const activeStep = getCurrentStep();
  const steps = ['Upload Resume', 'Enter Job Details', 'Get Crafted Resume'];

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
      
      if (savedResumeData) {
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
          Logger.log('Resume file restored successfully');
        } catch (error) {
          Logger.error('Error restoring resume file:', error);
          localStorage.removeItem('currentResumeFile');
          // Only redirect to upload if we're on job-description and restoration failed
          if (path === '/app/job-description') {
            Logger.log('Resume restoration failed, redirecting to upload');
            navigate('/app/upload');
          }
        }
      } else if (path === '/app/job-description') {
        // Only redirect if there's no saved data at all
        Logger.log('No resume data found, redirecting to upload');
        navigate('/app/upload');
      }
    };
    
    // Clear state based on current route to handle page refreshes properly
    if (path === '/app' || path === '/app/upload') {
      // On upload page - clear everything except user settings
      setResumeFile(null);
      setResumeName('');
      setJobTitle('');
      setJobUrl('');
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
      setJobTitle('');
      setJobUrl('');
      setResult(null);
      setError(null);
      setIsSubmitting(false);
      setIsPolling(false);
      setJobId(null);
      setJobStatus('');
      setStatusMessage('');
      setSnackbarOpen(false);
      setSnackbarMessage('');
      
      // Only try to restore if we don't already have a resume file
      if (!resumeFile) {
        restoreResumeFile();
      }
    } else if (path === '/app/results') {
      // On results page - if no result data, redirect to upload
      if (!result && !isPolling) {
        navigate('/app/upload');
      }
    } else {
      // For other paths, try to restore resume file if we don't have one
      if (!resumeFile) {
        restoreResumeFile();
      }
    }
  }, [location.pathname, navigate, result, isPolling]); // Removed resumeFile from dependencies

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

  // Prevent page refresh/close during processing
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isProcessing || isPolling) {
        e.preventDefault();
        e.returnValue = 'Your resume is being crafted. Are you sure you want to leave? This will cancel the process.';
        return 'Your resume is being crafted. Are you sure you want to leave? This will cancel the process.';
      }
    };

    if (isProcessing || isPolling) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isProcessing, isPolling]);

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
            
            // Log the complete status data for debugging
            Logger.log('=== STATUS COMPLETION DEBUG ===');
            Logger.log('Complete status data received:', statusData);
            Logger.log('Cover letter URL from status:', statusData.coverLetterUrl);
            Logger.log('Generate CV flag:', generateCV);
            Logger.log('All status data keys:', Object.keys(statusData));
            Logger.log('Cover letter filename:', statusData.coverLetterFilename);
            Logger.log('Cover letter text length:', statusData.coverLetterText?.length || 0);
            Logger.log('ATS Score data:', statusData.atsScore);
            Logger.log('Full statusData:', statusData);
            
            setResult({
              optimizedResumeUrl: statusData.optimizedResumeUrl,
              fileType: statusData.fileType || 'docx',
              contentType: statusData.contentType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              downloadFilename: statusData.downloadFilename || `crafted_resume.${statusData.fileType || 'docx'}`,
              // Add cover letter URL if available
              coverLetterUrl: statusData.coverLetterUrl || null,
              coverLetterFilename: statusData.coverLetterFilename || `cover_letter.${statusData.fileType || 'docx'}`,
              // Add ATS score if available, or mock data for testing
              atsScore: statusData.atsScore || {
                overall: 85,
                rating: "Excellent",
                breakdown: {
                  keywords: 88,
                  formatting: 92,
                  skills: 82,
                  experience: 87,
                  contact: 95
                }
              }
            });
            
            // Set the preview text if available
            if (statusData.previewText) {
              setOptimizedResumeText(statusData.previewText);
            } else {
              // Fallback message for when preview is not available
              setOptimizedResumeText(`Preview not available for ${statusData.fileType || 'this'} format.\n\nYour optimized resume has been generated successfully!\n\nTo view your crafted resume:\n1. Click the "Download Resume" button below\n2. Open the downloaded file in Microsoft Word or a compatible application\n\nThe optimized resume includes:\n• Tailored content for the job description\n• Improved formatting and structure\n• Enhanced keywords and phrases\n• Professional presentation`);
            }
            
            // Set cover letter text if available
            if (statusData.coverLetterText) {
              setCoverLetterText(statusData.coverLetterText);
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
      showLoading("Signing out...", "Thanks for using JobTailor AI!", 2500);
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

  // Handle job URL extraction (called during form submission)
  const handleJobUrlExtraction = async (url) => {
    if (!url || !url.trim()) {
      return null;
    }

    try {
      Logger.log('Extracting job data from URL:', url);
      
      // Check if user is authenticated and get token
      let authToken = '';
      try {
        const user = await getCurrentUser();
        Logger.log('User authenticated:', user.username);
        
        const session = await fetchAuthSession();
        authToken = session.tokens?.idToken?.toString() || '';
        Logger.log('Auth token exists:', !!authToken);
        Logger.log('Auth token length:', authToken.length);
        
        if (!authToken) {
          throw new Error('No authentication token available');
        }
      } catch (authError) {
        Logger.error('Authentication error:', authError);
        throw new Error('Please log in to extract job data from URLs');
      }
      
      // Use direct fetch with proper authentication
      const apiEndpoint = config.API.REST.resumeOptimizer.endpoint;
      Logger.log('Making request to:', `${apiEndpoint}/extract-job-url`);
      
      const response = await fetch(`${apiEndpoint}/extract-job-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          jobUrl: url.trim()
        })
      });

      Logger.log('Response status:', response.status);
      Logger.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        Logger.error('Non-JSON response received:', textResponse);
        throw new Error(`Server returned non-JSON response (${response.status}). Response: ${textResponse.substring(0, 200)}`);
      }

      const data = await response.json();
      Logger.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${data.message || 'Failed to extract job data'}`);
      }

      if (data.success && data.data) {
        Logger.log('Job data extracted successfully:', data.data);
        return data.data;
      } else {
        throw new Error('No job data found in the response');
      }

    } catch (error) {
      Logger.error('Error extracting job data:', error);
      throw error;
    }
  };

  const handleOptimize = async () => {
    // Validation logic based on requirements:
    // 1. Job URL OR Job Title is mandatory
    // 2. If cover letter toggle is ON, Job URL is mandatory (needs company info)
    // 3. Job Title only = generic resume development
    // 4. Job URL = job-specific development
    
    if (!resume) {
      setSnackbarMessage('Please upload a resume');
      setSnackbarOpen(true);
      return;
    }

    // Cover letter enabled - Job Title + Company Name required (Job URL optional)
    if (generateCV) {
      if (!jobTitle.trim() || !companyName.trim()) {
        setSnackbarMessage('For cover letter generation, Job Title and Company Name are required');
        setSnackbarOpen(true);
        return;
      }
    } else {
      // Cover letter disabled - Job URL OR Job Title required
      if (!jobUrl.trim() && !jobTitle.trim()) {
        setSnackbarMessage('Please enter either a Job URL or Job Title');
        setSnackbarOpen(true);
        return;
      }
    }

    // Validate job title length
    if (jobTitle.length > 100) {
      setSnackbarMessage('Job title must be 100 characters or less');
      setSnackbarOpen(true);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setJobStatus('SUBMITTING');
    setStatusMessage('Submitting your resume for crafting...');
    
    try {
      Logger.log('Selected resume format:', selectedResumeFormat);
      Logger.log('Selected cover letter format:', selectedCoverLetterFormat);
      Logger.log('Generate CV:', generateCV);
      
      let finalCompanyName = companyName ? companyName.trim() : '';
      let finalJobDescription = manualJobDescription || '';
      let finalJobTitle = jobTitle ? jobTitle.trim() : '';
      
      // Extract job data if URL is provided
      if (jobUrl.trim()) {
        setStatusMessage('Extracting job information from URL...');
        
        try {
          const extractedData = await handleJobUrlExtraction(jobUrl);
          if (extractedData) {
            if (extractedData.company) {
              finalCompanyName = extractedData.company;
            }
            if (extractedData.description) {
              finalJobDescription = extractedData.description;
            }
            
            // Use extracted job title if user hasn't provided one
            if (!finalJobTitle && extractedData.job_title) {
              finalJobTitle = extractedData.job_title;
            }
            
            Logger.log('Job data extracted for processing:', extractedData);
            setUrlExtractionFailed(false);
          }
        } catch (extractError) {
          // URL extraction failed - enable manual fields for user input
          setUrlExtractionFailed(true);
          setSnackbarMessage(`URL extraction failed: ${extractError.message}. Please use the manual input fields below.`);
          setSnackbarOpen(true);
          
          // If we don't have manual inputs, stop the process
          if (!finalJobTitle || (generateCV && (!companyName.trim() || !manualJobDescription.trim()))) {
            throw new Error(`Failed to extract job data from URL. Please fill in the manual fields: Job Title${generateCV ? ', Company Name, and Job Description' : ''}.`);
          }
          
          // Use manual inputs - already set above
          // finalCompanyName and finalJobDescription are already set
          
          Logger.warn('Job extraction failed, using manual inputs:', extractError.message);
        }
      } else {
        // No URL provided - use manual inputs (already set above)
        // finalCompanyName and finalJobDescription are already set from state
      }
      
      // Final validation after extraction
      if (!finalJobTitle) {
        throw new Error('Job title is required. Please provide a job title or a valid job URL.');
      }
      
      if (generateCV && !finalCompanyName) {
        throw new Error('Company Name is required for cover letter generation.');
      }
      
      setStatusMessage('Processing your resume with AI...');
      
      const payload = {
        resume: resume,
        jobTitle: finalJobTitle,
        companyName: finalCompanyName,
        jobDescription: finalJobDescription,
        generateCV: generateCV,
        outputFormat: selectedResumeFormat,
        coverLetterFormat: generateCV ? selectedCoverLetterFormat : null,
        resumeTemplate: userSettings.resumeTemplate || 'professional'
      };
      
      Logger.log('=== API PAYLOAD DEBUG ===');
      Logger.log('API payload:', payload);
      Logger.log('Generate CV flag:', generateCV);
      Logger.log('Company name:', companyName);
      Logger.log('Job title:', finalJobTitle);
      Logger.log('Resume format:', selectedResumeFormat);
      Logger.log('Cover letter format:', selectedCoverLetterFormat);
      
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

  const downloadCoverLetter = async () => {
    Logger.log('=== COVER LETTER DOWNLOAD DEBUG ===');
    Logger.log('Download cover letter called. Result object:', result);
    Logger.log('Cover letter URL:', result?.coverLetterUrl);
    Logger.log('Cover letter text available:', !!coverLetterText);
    Logger.log('Generate CV flag was:', generateCV);
    Logger.log('Job URL provided:', !!jobUrl);
    Logger.log('Full result object keys:', result ? Object.keys(result) : 'No result');
    
    if (!result || !result.coverLetterUrl) {
      const errorMsg = !result 
        ? 'No result data available' 
        : 'No cover letter download URL available. The cover letter may not have been generated.';
      Logger.error('Cover letter download failed:', errorMsg);
      
      // Enhanced error message for debugging
      let debugMsg = errorMsg;
      if (result) {
        debugMsg += `\n\nDEBUG INFO:\n- Generate CV was: ${generateCV ? 'ENABLED' : 'DISABLED'}\n- Job URL provided: ${jobUrl ? 'YES' : 'NO'}\n- Available result keys: ${Object.keys(result).join(', ')}`;
        
        // If we have cover letter text but no URL, suggest checking backend logs
        if (coverLetterText) {
          debugMsg += `\n- Cover letter text is available (${coverLetterText.length} chars)\n- This indicates a backend file upload issue\n- Check CloudWatch logs for the AI Handler Lambda function`;
        }
      }
      
      setSnackbarMessage(debugMsg);
      setSnackbarOpen(true);
      return;
    }

    try {
      // For S3 pre-signed URLs, we don't need to add Authorization headers
      const coverLetterResponse = await fetch(result.coverLetterUrl, {
        method: 'GET'
      });
      
      if (!coverLetterResponse.ok) {
        throw new Error(`Failed to download cover letter: ${coverLetterResponse.status} ${coverLetterResponse.statusText}`);
      }
      
      // Get the response as a blob for binary data (Word documents)
      const blob = await coverLetterResponse.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.coverLetterFilename || `cover_letter.${result.fileType || 'docx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSnackbarMessage('Cover letter downloaded successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      Logger.error('Error downloading cover letter:', error);
      setSnackbarMessage(`Error downloading cover letter: ${error.message}`);
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
    setJobTitle('');
    setJobUrl('');
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
    
    // Navigate back to job details
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

    // Create resume object to save (including cover letter if available)
    const resumeToSave = {
      id: Date.now().toString(),
      title: resumeTitle,
      description: resumeDescription || 'Crafted resume',
      jobTitle: jobTitle || 'Job Application',
      companyName: '', // Will be filled during processing if URL provided
      format: selectedResumeFormat,
      downloadUrl: result?.optimizedResumeUrl || '',
      createdAt: new Date().toISOString(),
      originalJobDescription: '', // Will be filled during processing if URL provided
      // Include cover letter data if available
      hasCoverLetter: !!coverLetterText,
      coverLetterUrl: result?.coverLetterUrl || '',
      coverLetterText: coverLetterText || '',
      coverLetterFormat: selectedCoverLetterFormat
    };

    // Save to localStorage (in a real app, this would go to your backend/DynamoDB)
    existingSaved.push(resumeToSave);
    localStorage.setItem('savedResumes', JSON.stringify(existingSaved));

    // Show success message with count and cover letter info
    const newCount = existingSaved.length;
    const coverLetterMsg = coverLetterText ? ' (with cover letter)' : '';
    setSnackbarMessage(`Resume${coverLetterMsg} saved to your profile successfully! 🎉 (${newCount}/50 resumes saved)`);
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
      setJobTitle('');
      setJobUrl('');
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
      setJobTitle('');
      setJobUrl('');
      setResult(null);
      setError(null);
      setIsSubmitting(false);
      setIsPolling(false);
      setJobId(null);
      setJobStatus('');
      setStatusMessage('');
      setSnackbarOpen(false);
      setSnackbarMessage('');
      
      setSnackbarMessage('Job details cleared - ready for new job details');
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
          setJobTitle('');
          setJobUrl('');
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
            setJobTitle('');
            setJobUrl('');
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
              showLoading("Going home...", "Returning to JobTailor AI", 1200);
              setTimeout(() => {
                navigate('/');
              }, 1200);
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="h5" component="div" sx={{ 
                fontWeight: 800,
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
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}>
                AI
              </Box>
            </Box>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ 
              color: 'text.primary',
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
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </MenuItem>
              
              <MenuItem onClick={() => {
                setProfileMenuAnchor(null);
                setSettingsDialogOpen(true);
              }}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings & Privacy" />
              </MenuItem>
              
              <MenuItem onClick={() => {
                setProfileMenuAnchor(null);
                setFaqsDialogOpen(true);
              }}>
                <ListItemIcon>
                  <HelpOutlineIcon />
                </ListItemIcon>
                <ListItemText primary="FAQs & Help" />
              </MenuItem>
              
              <MenuItem onClick={() => {
                setProfileMenuAnchor(null);
                setContactUsDialogOpen(true);
              }}>
                <ListItemIcon>
                  <ContactSupportIcon />
                </ListItemIcon>
                <ListItemText primary="Contact Us" />
              </MenuItem>
              
              <MenuItem onClick={() => {
                setProfileMenuAnchor(null);
                handleSignOut();
              }}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Sign Out" />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Compact Main Content Container */}
      <Container maxWidth="xl" sx={{ py: 1, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Compact Progress Indicator */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          {steps.map((label, index) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: index <= activeStep ? '#0A66C2' : '#E0E0E0',
                color: index <= activeStep ? 'white' : '#999',
                fontWeight: 'bold',
                fontSize: '12px',
                mr: 1
              }}>
                {index < activeStep ? '✓' : index + 1}
              </Box>
              <Typography variant="caption" sx={{ 
                color: index <= activeStep ? '#0A66C2' : '#999',
                fontWeight: index <= activeStep ? 600 : 400,
                mr: index < steps.length - 1 ? 2 : 0
              }}>
                {label}
              </Typography>
              {index < steps.length - 1 && (
                <Box sx={{ width: 20, height: 2, background: index < activeStep ? '#0A66C2' : '#E0E0E0', mx: 1 }} />
              )}
            </Box>
          ))}
        </Box>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          {/* Compact Main Content Container */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 2,
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #0A66C2, #378FE9, #4CAF50)',
                borderRadius: '4px 4px 0 0'
              }
            }}
          >
            {activeStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Upload Resume
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
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Job Details
                </Typography>
                

                
                {/* Job URL Field */}
                <Box sx={{ mb: 1 }}>
                  <TextField
                    label="Job URL (Optional - for automatic extraction of job details)"
                    fullWidth
                    variant="outlined"
                    value={jobUrl}
                    onChange={(e) => {
                      setJobUrl(e.target.value);
                    }}
                    placeholder="e.g., https://careers.mastercard.com/us/en/job/..."
                    size="small"
                    required={false}
                    error={false}
                    disabled={false} // Job URL should always be editable
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        '&.Mui-disabled': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'action.disabled',
                          }
                        }
                      }
                    }}
                    InputProps={{
                      endAdornment: jobUrl.trim() && (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="open job URL"
                            onClick={() => window.open(jobUrl, '_blank')}
                            size="small"
                            sx={{ color: 'primary.main' }}
                            title="Open job URL in new tab"
                          >
                            <LinkIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            aria-label="clear job URL"
                            onClick={() => setJobUrl('')}
                            size="small"
                            sx={{ color: 'text.secondary' }}
                            title="Clear job URL"
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    helperText="Optional - for automatic extraction of job details"
                  />
                  
                  {/* Extract Button */}
                  {jobUrl.trim() && (
                    <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-start' }}>
                      <Button
                        variant="contained"
                        size="medium"
                        startIcon={isExtracting ? <CircularProgress size={16} color="inherit" /> : <ExtractIcon />}
                        disabled={isExtracting}
                        onClick={async () => {
                          try {
                            setIsExtracting(true);
                            setSnackbarMessage('Extracting job details...');
                            setSnackbarOpen(true);
                            
                            const extractedData = await handleJobUrlExtraction(jobUrl);
                            if (extractedData) {
                              if (extractedData.job_title) setJobTitle(extractedData.job_title);
                              if (extractedData.company) setCompanyName(extractedData.company);
                              if (extractedData.description) setManualJobDescription(extractedData.description);
                              
                              setSnackbarMessage('Job details extracted successfully!');
                              setSnackbarOpen(true);
                              setUrlExtractionFailed(false);
                            } else {
                              throw new Error('No data extracted from URL');
                            }
                          } catch (error) {
                            setUrlExtractionFailed(true);
                            setSnackbarMessage(`Extraction failed: ${error.message}`);
                            setSnackbarOpen(true);
                          } finally {
                            setIsExtracting(false);
                          }
                        }}
                        sx={{
                          background: isExtracting 
                            ? 'linear-gradient(45deg, #9E9E9E 30%, #BDBDBD 90%)' 
                            : 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
                          color: 'white',
                          fontWeight: 600,
                          borderRadius: '8px',
                          px: 3,
                          py: 1,
                          textTransform: 'none',
                          boxShadow: isExtracting 
                            ? '0 2px 8px rgba(158, 158, 158, 0.3)' 
                            : '0 3px 12px rgba(76, 175, 80, 0.3)',
                          '&:hover': {
                            background: isExtracting 
                              ? 'linear-gradient(45deg, #9E9E9E 30%, #BDBDBD 90%)' 
                              : 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)',
                            boxShadow: isExtracting 
                              ? '0 2px 8px rgba(158, 158, 158, 0.3)' 
                              : '0 4px 16px rgba(76, 175, 80, 0.4)',
                            transform: isExtracting ? 'none' : 'translateY(-1px)',
                          },
                          '&:active': {
                            transform: 'translateY(0px)',
                          },
                          '&:disabled': {
                            color: 'white',
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        {isExtracting ? 'Extracting...' : 'Extract Job Details'}
                      </Button>
                    </Box>
                  )}
                </Box>

                {/* OR Divider */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Divider sx={{ flex: 1 }} />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      px: 2, 
                      color: generateCV ? 'text.disabled' : 'text.secondary', 
                      fontWeight: 500,
                      fontSize: '0.875rem'
                    }}
                  >
                    {generateCV ? "OR (Job URL Required)" : "OR"}
                  </Typography>
                  <Divider sx={{ flex: 1 }} />
                </Box>
                
                {/* Job Title Field */}
                <TextField
                  label="Job Title (Required)"
                  fullWidth
                  variant="outlined"
                  value={jobTitle}
                  onChange={(e) => {
                    setJobTitle(e.target.value);
                  }}
                  placeholder="e.g., Senior Data Engineer, Software Developer, Product Manager"
                  inputProps={{ maxLength: 100 }}
                  size="small"
                  required={true}
                  error={!jobTitle.trim()}
                  InputProps={{
                    endAdornment: (
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        {jobTitle.length}/100
                      </Typography>
                    )
                  }}
                  sx={{ 
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                      '&.Mui-disabled': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'action.disabled',
                        }
                      }
                    }
                  }}
                  disabled={false} // Job title should always be editable

                  helperText="Enter the job title you're applying for"
                />
                
                {/* Company Name Field */}
                <TextField
                  label={generateCV ? "Company Name (Required)" : "Company Name (Optional)"}
                  fullWidth
                  variant="outlined"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Amazon, Microsoft, Google"
                  size="small"
                  required={generateCV}
                  error={generateCV && !companyName.trim()}
                  sx={{ mb: 1 }}
                  inputProps={{ maxLength: 100 }}
                  InputProps={{
                    endAdornment: (
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        {companyName.length}/100
                      </Typography>
                    )
                  }}

                  helperText={generateCV ? "Required for cover letter" : "Optional - helps with optimization"}
                />

                {/* Job Description Field */}
                <TextField
                  label="Job Description (Optional)"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={4}
                  value={manualJobDescription}
                  onChange={(e) => setManualJobDescription(e.target.value)}
                  placeholder="Paste the job description here for better optimization..."
                  size="small"
                  sx={{ 
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                      alignItems: 'flex-start'
                    }
                  }}

                  helperText="Optional - paste job description for better targeting"
                />
                
                {/* Generate CV Toggle */}
                <Box sx={{ 
                  mb: 1, 
                  p: 1, 
                  bgcolor: 'background.paper', 
                  borderRadius: 1, 
                  border: 1, 
                  borderColor: 'divider' 
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={generateCV}
                        onChange={(e) => setGenerateCV(e.target.checked)}
                        color="primary"
                        size="small"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          Generate Cover Letter
                        </Typography>
                        <Tooltip title="When enabled, a professional cover letter will be generated along with your optimized resume. Company name becomes required.">
                          <InfoIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        </Tooltip>
                      </Box>
                    }
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: 'block' }}>
                    {generateCV ? "Cover letter will be included" : "Add a professional cover letter"}
                  </Typography>
                </Box>
                
                {/* Output Format Selection */}
                <FormatSelector
                  selectedResumeFormat={selectedResumeFormat}
                  selectedCoverLetterFormat={selectedCoverLetterFormat}
                  showCoverLetter={generateCV}
                  onResumeFormatChange={(format) => {
                    setSelectedResumeFormat(format);
                    Logger.log('Resume format changed to:', format);
                  }}
                  onCoverLetterFormatChange={(format) => {
                    setSelectedCoverLetterFormat(format);
                    Logger.log('Cover letter format changed to:', format);
                  }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <StylishBackButton 
                    onClick={() => navigate('/app/upload')}
                  >
                    Back
                  </StylishBackButton>
                  <Button 
                    variant="contained"
                    disabled={
                      // Basic requirement: Job URL OR Job Title is required
                      (!jobUrl.trim() && !jobTitle.trim()) ||
                      // Company Name required when Generate CV is enabled
                      (generateCV && !companyName.trim())
                    }
                    onClick={handleOptimize}
                    size="medium"
                    sx={{
                      backgroundColor: '#0A66C2',
                      color: '#ffffff',
                      fontWeight: 600,
                      borderRadius: '20px',
                      padding: '8px 24px',
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
            
            {/* Clean Processing Screen */}
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
                  flex: 1
                }}
              >
                <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 600,
                    color: '#0A66C2',
                    mb: 4
                  }}>
                    Crafting Your Resume
                  </Typography>
                  
                  <LinearProgress 
                    sx={{ 
                      width: '100%', 
                      height: 8, 
                      borderRadius: 4,
                      mb: 2,
                      backgroundColor: '#f0f0f0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#0A66C2',
                        borderRadius: 4
                      }
                    }}
                  />
                  
                  <Typography variant="body2" sx={{ 
                    color: '#666',
                    mb: 3
                  }}>
                    Please wait while we optimize your resume...
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={cancelOptimization}
                    sx={{ textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                </Box>
              </motion.div>
            )}
            
            {activeStep === 2 && result && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                {/* Professional Success Header */}
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 3,
                  p: 2,
                  bgcolor: 'success.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'success.200'
                }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 600, 
                    color: 'success.dark',
                    mb: 1
                  }}>
                    Resume Successfully Optimized
                  </Typography>
                  {jobTitle && (
                    <Typography variant="body1" sx={{ 
                      color: 'text.primary',
                      fontWeight: 500
                    }}>
                      {jobTitle}{companyName && ` • ${companyName}`}
                    </Typography>
                  )}
                </Box>
                
                {/* Professional Cards Container */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  mb: 3,
                  flexDirection: { xs: 'column', md: 'row' }
                }}>
                  {/* Enhanced Resume Card with Integrated ATS Score */}
                  <Paper 
                    elevation={2}
                    sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      flex: 2,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    {/* Header with ATS Score */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <DescriptionIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Optimized Resume
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Ready for download • {result?.fileType?.toUpperCase() || 'DOCX'} format
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Integrated ATS Score */}
                      {result?.atsScore && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          p: 1.5,
                          bgcolor: result.atsScore.overall >= 80 ? 'success.50' : 
                                   result.atsScore.overall >= 60 ? 'warning.50' : 'error.50',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: result.atsScore.overall >= 80 ? 'success.200' : 
                                       result.atsScore.overall >= 60 ? 'warning.200' : 'error.200'
                        }}>
                          <Box sx={{ 
                            position: 'relative',
                            display: 'inline-flex'
                          }}>
                            <CircularProgress
                              variant="determinate"
                              value={result.atsScore.overall}
                              size={50}
                              thickness={4}
                              sx={{
                                color: result.atsScore.overall >= 80 ? 'success.main' : 
                                       result.atsScore.overall >= 60 ? 'warning.main' : 'error.main',
                              }}
                            />
                            <Box sx={{
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                            }}>
                              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                {result.atsScore.overall}
                              </Typography>
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              ATS Score
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: result.atsScore.overall >= 80 ? 'success.dark' : 
                                     result.atsScore.overall >= 60 ? 'warning.dark' : 'error.dark',
                              fontWeight: 500
                            }}>
                              {result.atsScore.overall >= 90 ? 'Excellent' :
                               result.atsScore.overall >= 80 ? 'Very Good' :
                               result.atsScore.overall >= 70 ? 'Good' :
                               result.atsScore.overall >= 60 ? 'Fair' : 'Needs Improvement'}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            gap: 0.5, 
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            mt: 1
                          }}>
                          {Object.entries(result.atsScore)
                            .filter(([key]) => key !== 'overall' && key !== 'rating')
                            .map(([category, score]) => (
                            <Box key={category} sx={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              alignItems: 'center',
                              px: 1,
                              py: 0.5,
                              bgcolor: score >= 80 ? 'success.50' : 
                                       score >= 60 ? 'warning.50' : 'error.50',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: score >= 80 ? 'success.200' : 
                                           score >= 60 ? 'warning.200' : 'error.200',
                              minWidth: '60px'
                            }}>
                              <Typography variant="caption" sx={{ 
                                textTransform: 'capitalize',
                                fontWeight: 500,
                                fontSize: '0.65rem',
                                textAlign: 'center',
                                lineHeight: 1
                              }}>
                                {category}
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                color: score >= 80 ? 'success.dark' : 
                                       score >= 60 ? 'warning.dark' : 'error.dark',
                              }}>
                                {score}%
                              </Typography>
                            </Box>
                          ))}
                          </Box>
                        </Box>
                      )}
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1.5,
                      flexWrap: 'wrap'
                    }}>
                      <Button 
                        variant="contained" 
                        size="medium"
                        startIcon={<DownloadIcon />}
                        onClick={downloadOptimizedResume}
                        sx={{ 
                          flex: 1,
                          minWidth: '140px',
                          fontWeight: 600
                        }}
                      >
                        Download Resume
                      </Button>
                      
                      <Button 
                        variant="outlined" 
                        size="medium"
                        startIcon={<VisibilityIcon />}
                        onClick={() => setPreviewDialogOpen(true)}
                        sx={{ fontWeight: 500 }}
                      >
                        Preview
                      </Button>
                      
                      <Button 
                        variant="outlined" 
                        size="medium"
                        startIcon={<CompareIcon />}
                        onClick={() => setCompareDialogOpen(true)}
                        sx={{ fontWeight: 500 }}
                      >
                        Compare
                      </Button>
                    </Box>
                  </Paper>

                  {/* Professional Cover Letter Card */}
                  {(coverLetterText || result?.coverLetterUrl) && (
                    <Paper 
                      elevation={2}
                      sx={{ 
                        p: 3, 
                        borderRadius: 3,
                        flex: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <EmailIcon sx={{ fontSize: 28, color: 'info.main' }} />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Cover Letter
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Personalized for this position
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1.5,
                        flexDirection: 'column'
                      }}>
                        <Button 
                          variant="contained" 
                          color="info"
                          size="medium"
                          startIcon={<DownloadIcon />}
                          onClick={downloadCoverLetter}
                          sx={{ fontWeight: 600 }}
                        >
                          Download Cover Letter
                        </Button>
                        
                        {coverLetterText && (
                          <Button 
                            variant="outlined" 
                            size="medium"
                            startIcon={<VisibilityIcon />}
                            onClick={() => setCoverLetterDialogOpen(true)}
                            sx={{ fontWeight: 500 }}
                          >
                            Preview Cover Letter
                          </Button>
                        )}
                      </Box>
                    </Paper>
                  )}
                </Box>



                {/* Professional Next Actions */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  gap: 3,
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Button 
                    variant="contained" 
                    onClick={resetForm}
                    startIcon={<RefreshIcon />}
                    size="large"
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      py: 1.2,
                      px: 4,
                      textTransform: 'none',
                      borderRadius: 2
                    }}
                  >
                    Create Another Resume
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    onClick={handleSaveToProfile}
                    startIcon={<PersonIcon />}
                    size="large"
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      py: 1.2,
                      px: 4,
                      textTransform: 'none',
                      borderRadius: 2
                    }}
                  >
                    Save to Profile
                  </Button>
                </Box>

                {/* AI Caution Message - Subtle styling */}
                <Box sx={{ 
                  mt: 4,
                  textAlign: 'center'
                }}>
                  <Typography variant="caption" sx={{ 
                    color: 'rgba(0,0,0,0.5)',
                    fontSize: '0.75rem',
                    lineHeight: 1.4,
                    fontStyle: 'italic'
                  }}>
                    AI-generated content • If you're not satisfied with the output, please{' '}
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => {
                        setContactUsDialogOpen(true);
                        setContactTitle('Resume Output Feedback');
                        setContactDescription('I am not satisfied with the AI-generated resume output. Here are the issues I found:\n\n');
                      }}
                      sx={{
                        color: 'rgba(10, 102, 194, 0.7)',
                        textDecoration: 'underline',
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        p: 0,
                        minWidth: 'auto',
                        fontStyle: 'italic',
                        '&:hover': {
                          backgroundColor: 'transparent',
                          color: '#0A66C2',
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      let us know
                    </Button>
                    {' '}and we'll improve our prompts accordingly.
                  </Typography>
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
              Find answers to common questions about JobTailor AI features and functionality.
            </Typography>

            {/* General Usage */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
              🚀 General Usage
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Q: How does JobTailor AI work?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 2 }}>
                A: Upload your resume, enter a job URL for automatic extraction or job title for generic optimization, and our AI will craft your resume to perfectly match the job requirements. Job URLs provide the most targeted optimization with company-specific intelligence.
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
                A: You can select your preferred output format directly on the job details page before crafting your resume. Choose from PDF, Word, or Text formats based on your needs.
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
                A: On the job details page, you'll see format selection cards where you can choose between DOCX, PDF, or TXT for both your resume and cover letter (if enabled).
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
                A: Use the refresh button (🔄) in the top navigation bar. This will clear the current page state and prepare it for new input while preserving your uploaded resume on the job details page.
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
                If you can't find the answer to your question here, please contact our support team. We're here to help you get the most out of JobTailor AI!
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
            Have a question, suggestion, or need help with JobTailor AI? We'd love to hear from you! 
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
          py: { xs: 1, md: 3 }, // Reduced top/bottom padding on mobile
          px: { xs: 0.5, md: 3 } // Reduced side padding on mobile for more text space
        }}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: { xs: 2, md: 3 }, // Increased mobile padding from 1.5 to 2
              bgcolor: '#f8f9fa',
              maxHeight: { xs: 'calc(100vh - 200px)', md: '60vh' },
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: { xs: '16px', md: '14px' }, // Increased from 12px to 16px for mobile
              lineHeight: { xs: 1.5, md: 1.6 }
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
              Compare: Original vs Crafted Resume
              <Box
                component="span"
                sx={{
                  ml: 1,
                  backgroundColor: '#ff9800',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  textTransform: 'uppercase',
                  verticalAlign: 'middle'
                }}
              >
                Beta
              </Box>
            </Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              Comparison
              <Box
                component="span"
                sx={{
                  ml: 1,
                  backgroundColor: '#ff9800',
                  color: 'white',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  padding: '1px 4px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  verticalAlign: 'middle'
                }}
              >
                Beta
              </Box>
            </Box>
          </Box>
          <IconButton onClick={() => setCompareDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
          py: { xs: 1, md: 3 }, // Reduced padding for more content space
          px: { xs: 0.5, md: 3 }, // Reduced side padding on mobile
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
                    p: { xs: 2, md: 3 }, // Increased mobile padding from 1.5 to 2
                    bgcolor: '#fff3e0',
                    flex: 1,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: { xs: '15px', md: '14px' }, // Increased from 12px to 15px for mobile
                    lineHeight: { xs: 1.4, md: 1.6 },
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
                  Crafted Resume
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: { xs: 2, md: 3 }, // Increased mobile padding from 1.5 to 2
                    bgcolor: '#e8f5e8',
                    flex: 1,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: { xs: '15px', md: '14px' }, // Increased from 12px to 15px for mobile
                    lineHeight: { xs: 1.4, md: 1.6 },
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
      
      {/* Cover Letter Preview Dialog */}
      <Dialog 
        open={coverLetterDialogOpen} 
        onClose={() => setCoverLetterDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#4CAF50', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1 
        }}>
          <DescriptionIcon />
          Cover Letter Preview
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ 
            p: 4, 
            fontFamily: 'Times New Roman, serif',
            fontSize: '12pt',
            lineHeight: 1.6,
            whiteSpace: 'pre-line',
            bgcolor: 'background.paper',
            color: 'text.primary',
            minHeight: '400px'
          }}>
            {coverLetterText || 'No cover letter available'}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setCoverLetterDialogOpen(false)}
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
      )}
    </>
  );
}

export default MainApp;
