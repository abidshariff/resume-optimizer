import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, signOut, fetchAuthSession, deleteUser } from 'aws-amplify/auth';
import ProfileDialog from './ProfileDialog';
import SettingsDialog from './SettingsDialog';
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
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  AutoAwesome as AutoAwesomeIcon,
  Download as DownloadIcon,
  Logout as LogoutIcon,
  CheckCircle as CheckCircleIcon,
  DeleteForever as DeleteForeverIcon,
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
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

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

  useEffect(() => {
    loadUser();
  }, []);

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
      const payload = {
        resume: resume,
        jobDescription: jobDescription,
        outputFormat: 'word'
      };
      
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
          setStatusMessage('Resume optimization completed (mock)');
          setResult({
            optimizedResume: 'This is a mock optimized resume for local testing.',
            optimizedResumeUrl: '#',
            contentType: 'text/plain',
            fileType: 'txt'
          });
          setIsPolling(false);
          navigate('/app/results');
        }, 5000);
        
        return;
      }
      
      const { tokens } = await fetchAuthSession();
      const idToken = tokens.idToken.toString();
      
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
      if (window.location.hostname === 'localhost' && result.optimizedResumeUrl === '#') {
        const blob = new Blob([result.optimizedResume], { type: result.contentType || 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `optimized_resume.${result.fileType || 'txt'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }
      
      const { tokens } = await fetchAuthSession();
      const idToken = tokens.idToken.toString();
      
      const resumeResponse = await fetch(result.optimizedResumeUrl, {
        method: 'GET',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        }
      });
      
      if (!resumeResponse.ok) {
        throw new Error(`Failed to fetch optimized resume: ${resumeResponse.status}`);
      }
      
      const responseText = await resumeResponse.text();
      const binaryString = atob(responseText);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const contentType = result.contentType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const blob = new Blob([bytes], { type: contentType });
      
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

  const handleDeleteProfile = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setSnackbarMessage('Please type "DELETE" to confirm account deletion');
      setSnackbarOpen(true);
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUser();
      setSnackbarMessage('Account successfully deleted. You will be signed out.');
      setSnackbarOpen(true);
      setDeleteConfirmDialogOpen(false);
      setDeleteConfirmText('');
      
      setTimeout(() => {
        handleSignOut();
      }, 2000);
      
    } catch (error) {
      console.error('Error deleting account:', error);
      setSnackbarMessage(`Error deleting account: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const isProcessing = isSubmitting || isPolling;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
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
                <ListItemText primary="Settings" />
              </MenuItem>
              
              <MenuItem onClick={() => {
                setDeleteConfirmDialogOpen(true);
                setProfileMenuAnchor(null);
              }}>
                <ListItemIcon>
                  <DeleteForeverIcon sx={{ color: '#CC1016' }} />
                </ListItemIcon>
                <ListItemText primary="Delete Account" sx={{ color: '#CC1016' }} />
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
                  minHeight: '500px'
                }}
              >
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  🤖 Optimizing Your Resume
                </Typography>
                <Typography variant="h6" color="textSecondary" paragraph sx={{ mb: 4 }}>
                  Our AI is analyzing your resume and tailoring it to the job description.
                </Typography>
                
                <Box sx={{ width: '100%', maxWidth: 400, mb: 4 }}>
                  <LinearProgress 
                    variant="indeterminate"
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)'
                      }
                    }}
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ 
                    textAlign: 'center',
                    mt: 2
                  }}>
                    ⏱️ This typically takes 30-60 seconds...
                  </Typography>
                </Box>

                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/app/job-description')}
                  disabled={isSubmitting}
                >
                  Cancel Optimization
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
                    variant="contained" 
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={downloadOptimizedResume}
                    size="large"
                  >
                    Download Again
                  </Button>
                </Box>
              </motion.div>
            )}
          </Paper>
        </motion.div>
      </Container>
      
      {/* Delete Account Dialog */}
      <Dialog 
        open={deleteConfirmDialogOpen} 
        onClose={() => setDeleteConfirmDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #CC1016 30%, #FF4444 90%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center'
        }}>
          <DeleteForeverIcon sx={{ mr: 1 }} />
          Delete Account
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
            ⚠️ This action cannot be undone. To confirm deletion, please type <strong>DELETE</strong>:
          </Typography>
          <TextField
            fullWidth
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDeleteConfirmDialogOpen(false)} 
            variant="outlined"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteProfile} 
            variant="contained"
            disabled={deleteConfirmText !== 'DELETE' || isDeleting}
            sx={{
              backgroundColor: '#CC1016',
              '&:hover': { backgroundColor: '#AA0E14' }
            }}
            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteForeverIcon />}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
      
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
      />
    </Box>
  );
}

export default MainApp;
