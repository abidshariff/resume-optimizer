import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  FormControlLabel,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';

function SettingsDialog({ open, onClose }) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoSave: true,
    darkMode: false,
    defaultOutputFormat: 'docx',
    optimizationLevel: 'balanced'
  });

  const handleSettingChange = (setting) => (event) => {
    setSettings(prev => ({
      ...prev,
      [setting]: event.target.checked !== undefined ? event.target.checked : event.target.value
    }));
  };

  const handleSave = () => {
    // TODO: Save settings to backend or local storage
    localStorage.setItem('resumeOptimizerSettings', JSON.stringify(settings));
    console.log('Settings saved:', settings);
    onClose();
  };

  const handleReset = () => {
    setSettings({
      emailNotifications: true,
      autoSave: true,
      darkMode: false,
      defaultOutputFormat: 'docx',
      optimizationLevel: 'balanced'
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          border: '1px solid #0A66C2'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#F8F9FA', 
        borderBottom: '1px solid #E0E0E0',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Avatar sx={{ bgcolor: '#0A66C2' }}>
          <SettingsIcon />
        </Avatar>
        <Typography variant="h6" sx={{ color: '#0A66C2', fontWeight: 600 }}>
          Application Settings
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <List>
          <ListItem>
            <ListItemText 
              primary="Email Notifications"
              secondary="Receive email updates about your resume optimization progress"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.emailNotifications}
                onChange={handleSettingChange('emailNotifications')}
                color="primary"
              />
            </ListItemSecondaryAction>
          </ListItem>

          <Divider />

          <ListItem>
            <ListItemText 
              primary="Auto-Save"
              secondary="Automatically save your work as you make changes"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.autoSave}
                onChange={handleSettingChange('autoSave')}
                color="primary"
              />
            </ListItemSecondaryAction>
          </ListItem>

          <Divider />

          <ListItem>
            <ListItemText 
              primary="Dark Mode"
              secondary="Use dark theme for the application"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.darkMode}
                onChange={handleSettingChange('darkMode')}
                color="primary"
                disabled
              />
            </ListItemSecondaryAction>
          </ListItem>

          <Divider />

          <ListItem>
            <Box sx={{ width: '100%' }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Default Output Format</InputLabel>
                <Select
                  value={settings.defaultOutputFormat}
                  onChange={handleSettingChange('defaultOutputFormat')}
                  label="Default Output Format"
                >
                  <MenuItem value="docx">Word Document (.docx)</MenuItem>
                  <MenuItem value="pdf">PDF Document (.pdf)</MenuItem>
                  <MenuItem value="txt">Plain Text (.txt)</MenuItem>
                </Select>
              </FormControl>
              
              <Typography variant="body2" color="text.secondary">
                Choose the default format for downloaded optimized resumes
              </Typography>
            </Box>
          </ListItem>

          <Divider />

          <ListItem>
            <Box sx={{ width: '100%' }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Optimization Level</InputLabel>
                <Select
                  value={settings.optimizationLevel}
                  onChange={handleSettingChange('optimizationLevel')}
                  label="Optimization Level"
                >
                  <MenuItem value="conservative">Conservative - Minimal changes</MenuItem>
                  <MenuItem value="balanced">Balanced - Moderate optimization</MenuItem>
                  <MenuItem value="aggressive">Aggressive - Maximum optimization</MenuItem>
                </Select>
              </FormControl>
              
              <Typography variant="body2" color="text.secondary">
                Control how extensively the AI modifies your resume content
              </Typography>
            </Box>
          </ListItem>
        </List>

        <Box sx={{ p: 3 }}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Note:</strong> Some settings may require you to refresh the page or restart the application to take effect.
            </Typography>
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={handleReset}
          sx={{ color: '#666' }}
        >
          Reset to Defaults
        </Button>
        <Button 
          onClick={onClose}
          sx={{ color: '#666' }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #085A9F 30%, #2B7BD6 90%)',
            }
          }}
        >
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SettingsDialog;
