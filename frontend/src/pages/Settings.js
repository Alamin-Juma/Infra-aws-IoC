import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import {
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
} from '@mui/material';
import { ExpandMore, Save } from '@mui/icons-material';

const Settings = () => {
  const [userSettings, setUserSettings] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    theme: 'light',
    notifications: true,
    emailNotifications: true,
    language: 'en'
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  
  const handleSettingChange = (e) => {
    const { name, value, checked } = e.target;
    setUserSettings(prev => ({
      ...prev,
      [name]: name === 'notifications' || name === 'emailNotifications' ? checked : value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const saveSettings = () => {
    // In a real app, save settings to backend/API
    setAlert({
      show: true,
      message: 'Settings saved successfully',
      severity: 'success'
    });
    
    // Hide alert after 5 seconds
    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, 5000);
  };
  
  const changePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setAlert({
        show: true,
        message: 'All password fields are required',
        severity: 'error'
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setAlert({
        show: true,
        message: 'New passwords do not match',
        severity: 'error'
      });
      return;
    }
    
    try {
      // In a real app, use Cognito to change password
      // const user = await Auth.currentAuthenticatedUser();
      // await Auth.changePassword(user, currentPassword, newPassword);
      
      setAlert({
        show: true,
        message: 'Password changed successfully',
        severity: 'success'
      });
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setAlert({
        show: true,
        message: error.message || 'Failed to change password',
        severity: 'error'
      });
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Name"
                  name="name"
                  value={userSettings.name}
                  onChange={handleSettingChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  name="email"
                  value={userSettings.email}
                  onChange={handleSettingChange}
                  fullWidth
                  margin="normal"
                  disabled
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset" margin="normal">
                  <FormLabel component="legend">Language</FormLabel>
                  <RadioGroup
                    name="language"
                    value={userSettings.language}
                    onChange={handleSettingChange}
                    row
                  >
                    <FormControlLabel value="en" control={<Radio />} label="English" />
                    <FormControlLabel value="es" control={<Radio />} label="Spanish" />
                    <FormControlLabel value="fr" control={<Radio />} label="French" />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preferences
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Theme</FormLabel>
              <RadioGroup
                name="theme"
                value={userSettings.theme}
                onChange={handleSettingChange}
                row
              >
                <FormControlLabel value="light" control={<Radio />} label="Light" />
                <FormControlLabel value="dark" control={<Radio />} label="Dark" />
                <FormControlLabel value="system" control={<Radio />} label="System" />
              </RadioGroup>
            </FormControl>
            
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userSettings.notifications}
                    onChange={handleSettingChange}
                    name="notifications"
                  />
                }
                label="Enable Notifications"
              />
            </Box>
            
            <Box sx={{ mt: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userSettings.emailNotifications}
                    onChange={handleSettingChange}
                    name="emailNotifications"
                    disabled={!userSettings.notifications}
                  />
                }
                label="Email Notifications"
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={saveSettings}
            startIcon={<Save />}
          >
            Save Settings
          </Button>
        </Grid>
        
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Change Password</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={changePassword}
                  >
                    Change Password
                  </Button>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </>
  );
};

export default Settings;