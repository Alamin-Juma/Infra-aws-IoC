import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const NotFound = () => {
  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h1" color="primary" sx={{ fontSize: 100 }}>
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" paragraph>
        The page you are looking for does not exist or has been moved.
      </Typography>
      <Box mt={2}>
        <img 
          src="https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif" 
          alt="404 animation"
          style={{ maxWidth: '100%', height: 'auto', maxHeight: '300px' }}
        />
      </Box>
    </Paper>
  );
};

export default NotFound;