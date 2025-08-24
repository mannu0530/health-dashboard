import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAppSelector } from '../../hooks/reduxHooks';

// Mock data - in real app, this would come from Redux store
const mockSystemMetrics = {
  cpu: 65,
  memory: 78,
  disk: 45,
  network: 32,
};

const mockPerformanceData = [
  { time: '00:00', cpu: 45, memory: 60, disk: 30 },
  { time: '04:00', cpu: 55, memory: 65, disk: 35 },
  { time: '08:00', cpu: 75, memory: 80, disk: 45 },
  { time: '12:00', cpu: 85, memory: 85, disk: 55 },
  { time: '16:00', cpu: 70, memory: 75, disk: 50 },
  { time: '20:00', cpu: 60, memory: 70, disk: 40 },
];

const mockAlertData = [
  { severity: 'critical', count: 2, color: '#f44336' },
  { severity: 'warning', count: 5, color: '#ff9800' },
  { severity: 'info', count: 8, color: '#2196f3' },
  { severity: 'success', count: 15, color: '#4caf50' },
];

const mockRecentAlerts = [
  { id: 1, message: 'High CPU usage detected', severity: 'warning', time: '2 min ago' },
  { id: 2, message: 'Database connection restored', severity: 'success', time: '5 min ago' },
  { id: 3, message: 'Memory usage above threshold', severity: 'critical', time: '8 min ago' },
  { id: 4, message: 'Backup completed successfully', severity: 'info', time: '12 min ago' },
];

const Dashboard: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getMetricColor = (value: number) => {
    if (value >= 80) return 'error';
    if (value >= 60) return 'warning';
    return 'success';
  };

  const getMetricIcon = (value: number) => {
    if (value >= 80) return <Error color="error" />;
    if (value >= 60) return <Warning color="warning" />;
    return <CheckCircle color="success" />;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'success':
        return <CheckCircle color="success" />;
      default:
        return <CheckCircle color="info" />;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Welcome back, {user?.firstName}!
        </Typography>
        <Tooltip title="Refresh data">
          <IconButton onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* System Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography color="text.secondary" gutterBottom>
                  CPU Usage
                </Typography>
                {getMetricIcon(mockSystemMetrics.cpu)}
              </Box>
              <Typography variant="h4" component="div">
                {mockSystemMetrics.cpu}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={mockSystemMetrics.cpu}
                color={getMetricColor(mockSystemMetrics.cpu) as any}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography color="text.secondary" gutterBottom>
                  Memory Usage
                </Typography>
                {getMetricIcon(mockSystemMetrics.memory)}
              </Box>
              <Typography variant="h4" component="div">
                {mockSystemMetrics.memory}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={mockSystemMetrics.memory}
                color={getMetricColor(mockSystemMetrics.memory) as any}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography color="text.secondary" gutterBottom>
                  Disk Usage
                </Typography>
                {getMetricIcon(mockSystemMetrics.disk)}
              </Box>
              <Typography variant="h4" component="div">
                {mockSystemMetrics.disk}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={mockSystemMetrics.disk}
                color={getMetricColor(mockSystemMetrics.disk) as any}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography color="text.secondary" gutterBottom>
                  Network
                </Typography>
                {getMetricIcon(mockSystemMetrics.network)}
              </Box>
              <Typography variant="h4" component="div">
                {mockSystemMetrics.network}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={mockSystemMetrics.network}
                color={getMetricColor(mockSystemMetrics.network) as any}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Performance Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Performance Overview
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
                <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" />
                <Line type="monotone" dataKey="disk" stroke="#ffc658" name="Disk %" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Alerts Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Alerts Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockAlertData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ severity, count }) => `${severity}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {mockAlertData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Alerts */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Alerts
            </Typography>
            <Box>
              {mockRecentAlerts.map((alert) => (
                <Box
                  key={alert.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  {getSeverityIcon(alert.severity)}
                  <Box sx={{ ml: 2, flexGrow: 1 }}>
                    <Typography variant="body2">{alert.message}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {alert.time}
                    </Typography>
                  </Box>
                  <Chip
                    label={alert.severity}
                    size="small"
                    color={
                      alert.severity === 'critical' ? 'error' :
                      alert.severity === 'warning' ? 'warning' :
                      alert.severity === 'success' ? 'success' : 'info'
                    }
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
