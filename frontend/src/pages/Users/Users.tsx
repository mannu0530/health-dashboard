import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Users: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          User management page - Coming soon with user administration, 
          role management, and permission configuration.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Users;
