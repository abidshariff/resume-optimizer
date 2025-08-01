import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  TextField, 
  Button,
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { 
  Person as PersonIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Language as WebsiteIcon,
  AutoAwesome as AutoAwesomeIcon,
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getCurrentUser, fetchUserAttributes, signOut } from 'aws-amplify/auth';

function Profile() {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState('personal');
  const [currentUser, setCurrentUser] = useState(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [userInfo, setUserInfo] = useState({
    email: '',
    name: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    bio: ''
  });
  const [savedResumes, setSavedResumes] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [downloadingResumeId, setDownloadingResumeId] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedResumeDetails, setSelectedResumeDetails] = useState(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
    loadSavedResumes();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      const attributes = await fetchUserAttributes();
      
      setUserInfo({
        email: attributes.email || '',
        name: attributes.name || attributes.given_name + ' ' + attributes.family_name || '',
        phone: attributes.phone_number || '',
        location: attributes['custom:location'] || '',
        linkedin: attributes['custom:linkedin'] || '',
        github: attributes['custom:github'] || '',
        website: attributes['custom:website'] || '',
        bio: attributes['custom:bio'] || ''
      });
    } catch (error) {
      console.error('Error loading user data:', error);
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

  const getDisplayName = () => {
    if (userInfo.name) return userInfo.name;
    if (currentUser?.username) return currentUser.username;
    return 'User';
  };

  const loadSavedResumes = () => {
    // Load saved resumes from localStorage for now
    // In a real app, this would come from your backend/DynamoDB
    const saved = localStorage.getItem('savedResumes');
    if (saved) {
      setSavedResumes(JSON.parse(saved));
    }
  };

  const handleSaveProfile = () => {
    // Save profile data
    // In a real app, this would update Cognito user attributes
    localStorage.setItem('userProfile', JSON.stringify(userInfo));
    setEditMode(false);
    setSnackbarMessage('Profile updated successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleDeleteResume = (resumeId) => {
    const updatedResumes = savedResumes.filter(resume => resume.id !== resumeId);
    setSavedResumes(updatedResumes);
    localStorage.setItem('savedResumes', JSON.stringify(updatedResumes));
    setDeleteDialogOpen(false);
    setSnackbarMessage('Resume deleted successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleBulkDeleteOldResumes = () => {
    // Sort resumes by creation date and keep only the 40 most recent ones
    const sortedResumes = [...savedResumes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const resumesToKeep = sortedResumes.slice(0, 40);
    const deletedCount = savedResumes.length - resumesToKeep.length;
    
    setSavedResumes(resumesToKeep);
    localStorage.setItem('savedResumes', JSON.stringify(resumesToKeep));
    setBulkDeleteDialogOpen(false);
    
    setSnackbarMessage(`${deletedCount} oldest resumes deleted successfully! You now have ${resumesToKeep.length}/50 resumes.`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const menuItems = [
    { id: 'personal', label: 'Personal Details', icon: <PersonIcon /> },
    { id: 'resumes', label: 'Saved Resumes', icon: <DescriptionIcon /> }
  ];

  const renderPersonalDetails = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#0A66C2' }}>
            Personal Details
          </Typography>
          <Button
            variant={editMode ? "contained" : "outlined"}
            startIcon={<EditIcon />}
            onClick={() => setEditMode(!editMode)}
            sx={{
              background: editMode ? 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)' : 'transparent'
            }}
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: '#0A66C2',
                  fontSize: '3rem'
                }}
              >
                {userInfo.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {userInfo.name || 'Your Name'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userInfo.email}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                  disabled={!editMode}
                  variant={editMode ? "outlined" : "filled"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={userInfo.email}
                  disabled
                  variant="filled"
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                  disabled={!editMode}
                  variant={editMode ? "outlined" : "filled"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={userInfo.location}
                  onChange={(e) => setUserInfo({...userInfo, location: e.target.value})}
                  disabled={!editMode}
                  variant={editMode ? "outlined" : "filled"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="LinkedIn Profile"
                  value={userInfo.linkedin}
                  onChange={(e) => setUserInfo({...userInfo, linkedin: e.target.value})}
                  disabled={!editMode}
                  variant={editMode ? "outlined" : "filled"}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GitHub Profile"
                  value={userInfo.github}
                  onChange={(e) => setUserInfo({...userInfo, github: e.target.value})}
                  disabled={!editMode}
                  variant={editMode ? "outlined" : "filled"}
                  placeholder="https://github.com/yourusername"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website"
                  value={userInfo.website}
                  onChange={(e) => setUserInfo({...userInfo, website: e.target.value})}
                  disabled={!editMode}
                  variant={editMode ? "outlined" : "filled"}
                  placeholder="https://yourwebsite.com"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Bio"
                  value={userInfo.bio}
                  onChange={(e) => setUserInfo({...userInfo, bio: e.target.value})}
                  disabled={!editMode}
                  variant={editMode ? "outlined" : "filled"}
                  placeholder="Tell us about yourself..."
                />
              </Grid>
            </Grid>

            {editMode && (
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  sx={{
                    background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                  }}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </motion.div>
  );

  const handleDownloadResume = async (resume) => {
    setDownloadingResumeId(resume.id);
    
    try {
      // Check if this is mock data (localhost with # URL)
      if (window.location.hostname === 'localhost' && resume.downloadUrl === '#') {
        setSnackbarMessage('This is demo data - download not available');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
        return;
      }

      // Check if URL is empty or invalid
      if (!resume.downloadUrl || resume.downloadUrl === '') {
        setSnackbarMessage('Download URL not available for this resume');
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
        return;
      }

      // For S3 pre-signed URLs or valid URLs, attempt download
      const response = await fetch(resume.downloadUrl, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resume.title}.${resume.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSnackbarMessage('Resume downloaded successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Download error:', error);
      setSnackbarMessage('Download failed - the link may have expired. Please re-optimize your resume.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setDownloadingResumeId(null);
    }
  };

  const handleViewDetails = (resume) => {
    setSelectedResumeDetails(resume);
    setDetailsDialogOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderSavedResumes = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#0A66C2' }}>
            Saved Resumes
          </Typography>
          <Box sx={{ textAlign: 'right' }}>
            <Typography 
              variant="body2" 
              color={savedResumes.length >= 45 ? 'error.main' : 'text.secondary'}
              sx={{ fontWeight: savedResumes.length >= 45 ? 600 : 400 }}
            >
              {savedResumes.length}/50 resumes saved
            </Typography>
            {savedResumes.length >= 45 && (
              <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.5 }}>
                {savedResumes.length >= 50 ? 'Limit reached!' : 'Approaching limit'}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Warning alert when approaching or at limit */}
        {savedResumes.length >= 45 && (
          <Alert 
            severity={savedResumes.length >= 50 ? 'error' : 'warning'} 
            sx={{ mb: 3 }}
            action={
              savedResumes.length >= 50 && (
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={() => setBulkDeleteDialogOpen(true)}
                  sx={{ fontWeight: 600 }}
                >
                  Clean Up Old Resumes
                </Button>
              )
            }
          >
            {savedResumes.length >= 50 
              ? 'You have reached the maximum limit of 50 saved resumes. Please delete some resumes to save new ones.'
              : `You are approaching the limit of 50 saved resumes. You have ${50 - savedResumes.length} slots remaining.`
            }
          </Alert>
        )}

        {savedResumes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <DescriptionIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No saved resumes yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start optimizing resumes to see them here
            </Typography>
            <Button
              variant="contained"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => navigate('/app/upload')}
              sx={{
                background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #0A66C2 60%, #378FE9 100%)',
                }
              }}
            >
              Optimize Your First Resume
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {savedResumes.map((resume) => (
              <Grid item xs={12} md={6} lg={4} key={resume.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    {/* Header with icon and title */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor: '#e3f2fd',
                          mr: 2,
                          mt: 0.5
                        }}
                      >
                        <DescriptionIcon sx={{ color: '#0A66C2', fontSize: 20 }} />
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            lineHeight: 1.3,
                            mb: 1,
                            wordBreak: 'break-word'
                          }}
                        >
                          {resume.title}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Metadata chips */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip 
                        label={resume.format.toUpperCase()} 
                        size="small" 
                        sx={{ 
                          bgcolor: '#0A66C2',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      />
                      <Chip 
                        label={formatDate(resume.createdAt)} 
                        size="small" 
                        variant="outlined"
                        sx={{ 
                          borderColor: '#0A66C2',
                          color: '#0A66C2',
                          fontSize: '0.75rem'
                        }}
                      />
                    </Box>

                    {/* Creation time and view details */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: '0.75rem'
                        }}
                      >
                        Created at {formatTime(resume.createdAt)}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => handleViewDetails(resume)}
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          minWidth: 'auto',
                          p: 0.5,
                          color: '#0A66C2'
                        }}
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={downloadingResumeId === resume.id ? 
                        <CircularProgress size={16} color="inherit" /> : 
                        <DownloadIcon />
                      }
                      onClick={() => handleDownloadResume(resume)}
                      disabled={downloadingResumeId === resume.id}
                      sx={{
                        background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #0A66C2 60%, #378FE9 100%)',
                        },
                        '&:disabled': {
                          background: '#ccc',
                        },
                        textTransform: 'none',
                        fontWeight: 600,
                        minWidth: 100
                      }}
                    >
                      {downloadingResumeId === resume.id ? 'Downloading...' : 'Download'}
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setResumeToDelete(resume);
                        setDeleteDialogOpen(true);
                      }}
                      sx={{
                        color: '#d32f2f',
                        '&:hover': {
                          bgcolor: 'rgba(211, 47, 47, 0.04)'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </motion.div>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            onClick={() => navigate('/app/upload')}
            sx={{ mr: 2, color: 'white' }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8
              }
            }}
            onClick={() => navigate('/app/upload')}
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
              color: '#666666',
              display: { xs: 'none', sm: 'block' }
            }}>
              Welcome, {getDisplayName()}
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
                navigate('/app/profile');
              }}>
                <ListItemIcon>
                  <PersonIcon sx={{ color: '#0A66C2' }} />
                </ListItemIcon>
                <ListItemText primary="Profile" />
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

    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Left Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#0A66C2' }}>
              Profile Menu
            </Typography>
            <List>
              {menuItems.map((item) => (
                <ListItemButton
                  key={item.id}
                  selected={selectedSection === item.id}
                  onClick={() => setSelectedSection(item.id)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    '&.Mui-selected': {
                      backgroundColor: '#e3f2fd',
                      '&:hover': {
                        backgroundColor: '#e3f2fd',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: selectedSection === item.id ? '#0A66C2' : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    sx={{ 
                      '& .MuiListItemText-primary': {
                        fontWeight: selectedSection === item.id ? 600 : 400,
                        color: selectedSection === item.id ? '#0A66C2' : 'inherit'
                      }
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {selectedSection === 'personal' && renderPersonalDetails()}
          {selectedSection === 'resumes' && renderSavedResumes()}
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: '#d32f2f',
          fontWeight: 600
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Resume
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete this resume? This action cannot be undone.
            </Typography>
            
            {resumeToDelete && (
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Resume Details:
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Title:</strong> {resumeToDelete.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Job:</strong> {resumeToDelete.jobTitle}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>Format:</strong> {resumeToDelete.format.toUpperCase()}
                </Typography>
                <Typography variant="body2">
                  <strong>Created:</strong> {formatDate(resumeToDelete.createdAt)} at {formatTime(resumeToDelete.createdAt)}
                </Typography>
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleDeleteResume(resumeToDelete?.id)}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{
              bgcolor: '#d32f2f',
              '&:hover': {
                bgcolor: '#b71c1c'
              }
            }}
          >
            Delete Resume
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resume Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
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
          pb: 1
        }}>
          <DescriptionIcon sx={{ mr: 1 }} />
          Resume Details
        </DialogTitle>
        <DialogContent>
          {selectedResumeDetails && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#0A66C2' }}>
                      Basic Information
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Title:</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedResumeDetails.title}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Job Position:</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedResumeDetails.jobTitle}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Format:</Typography>
                      <Chip 
                        label={selectedResumeDetails.format.toUpperCase()} 
                        size="small" 
                        sx={{ 
                          bgcolor: '#0A66C2',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          mt: 0.5
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>Created:</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(selectedResumeDetails.createdAt)} at {formatTime(selectedResumeDetails.createdAt)}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#0A66C2' }}>
                      Download Information
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Download Status:</Typography>
                      {selectedResumeDetails.downloadUrl && selectedResumeDetails.downloadUrl !== '' && selectedResumeDetails.downloadUrl !== '#' ? (
                        <Chip 
                          label="Available" 
                          color="success" 
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      ) : (
                        <Chip 
                          label="Not Available" 
                          color="error" 
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={downloadingResumeId === selectedResumeDetails.id ? 
                        <CircularProgress size={16} color="inherit" /> : 
                        <DownloadIcon />
                      }
                      onClick={() => handleDownloadResume(selectedResumeDetails)}
                      disabled={downloadingResumeId === selectedResumeDetails.id}
                      fullWidth
                      sx={{
                        background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #0A66C2 60%, #378FE9 100%)',
                        },
                        '&:disabled': {
                          background: '#ccc',
                        },
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      {downloadingResumeId === selectedResumeDetails.id ? 'Downloading...' : 'Download Resume'}
                    </Button>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#0A66C2' }}>
                      Description
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {selectedResumeDetails.description || 'No description available'}
                    </Typography>
                  </Paper>
                </Grid>
                
                {selectedResumeDetails.originalJobDescription && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#0A66C2' }}>
                        Original Job Description
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          lineHeight: 1.6,
                          maxHeight: 200,
                          overflow: 'auto',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {selectedResumeDetails.originalJobDescription}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDetailsDialogOpen(false)}
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: '#d32f2f',
          fontWeight: 600
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Clean Up Old Resumes
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              This will automatically delete your oldest resumes, keeping only the 40 most recent ones. 
              This will free up 10 slots for new resumes.
            </Typography>
            
            <Paper sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 1, border: '1px solid #ffb74d' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#f57c00' }}>
                What will happen:
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                • <strong>{savedResumes.length - 40}</strong> oldest resumes will be permanently deleted
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                • <strong>40</strong> most recent resumes will be kept
              </Typography>
              <Typography variant="body2">
                • You'll have <strong>10 free slots</strong> for new resumes
              </Typography>
            </Paper>

            <Typography variant="body2" color="error.main" sx={{ mt: 2, fontWeight: 500 }}>
              ⚠️ This action cannot be undone. Deleted resumes cannot be recovered.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setBulkDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBulkDeleteOldResumes}
            color="warning"
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{
              bgcolor: '#f57c00',
              '&:hover': {
                bgcolor: '#ef6c00'
              }
            }}
          >
            Clean Up Old Resumes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: '0.875rem'
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
    </Box>
  );
}

export default Profile;
