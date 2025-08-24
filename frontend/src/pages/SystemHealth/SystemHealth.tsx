import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const SystemHealth: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        System Health
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          System Health monitoring page - Coming soon with detailed system metrics, 
          health checks, and infrastructure status.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SystemHealth;
