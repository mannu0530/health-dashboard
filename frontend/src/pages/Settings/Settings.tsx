import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Settings: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Settings page - Coming soon with user preferences, 
          system configuration, and personalization options.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Settings;
