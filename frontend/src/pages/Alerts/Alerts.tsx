import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Alerts: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Alerts & Notifications
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Alerts management page - Coming soon with alert configuration, 
          notification settings, and alert history management.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Alerts;
