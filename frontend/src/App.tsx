import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAppSelector, useAppDispatch } from './hooks/reduxHooks';
import { checkAuthStatus } from './store/slices/authSlice';

// Layout Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import SystemHealth from './pages/SystemHealth/SystemHealth';
import Performance from './pages/Performance/Performance';
import Alerts from './pages/Alerts/Alerts';
import Users from './pages/Users/Users';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound/NotFound';

// Types
import { UserRole } from './types/auth';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* System Health - Accessible by all authenticated users */}
        <Route path="system-health" element={<SystemHealth />} />
        
        {/* Performance - Accessible by DevOps, QA, Dev, and Management */}
        <Route
          path="performance"
          element={
            <ProtectedRoute
              allowedRoles={[UserRole.DEVOPS, UserRole.QA, UserRole.DEV, UserRole.MANAGEMENT]}
            >
              <Performance />
            </ProtectedRoute>
          }
        />
        
        {/* Alerts - Accessible by DevOps and Management */}
        <Route
          path="alerts"
          element={
            <ProtectedRoute
              allowedRoles={[UserRole.DEVOPS, UserRole.MANAGEMENT]}
            >
              <Alerts />
            </ProtectedRoute>
          }
        />
        
        {/* Users - Accessible by Management only */}
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={[UserRole.MANAGEMENT]}>
              <Users />
            </ProtectedRoute>
          }
        />
        
        {/* Settings - Accessible by all authenticated users */}
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
