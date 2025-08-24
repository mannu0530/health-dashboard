import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  HealthAndSafety as HealthIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { logout } from '../../store/slices/authSlice';
import { User, UserRole, RolePermissions } from '../../types/auth';

interface SidebarProps {
  user: User | null;
  onItemClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return RolePermissions[user.role].includes(permission);
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      permission: 'dashboard:read',
    },
    {
      text: 'System Health',
      icon: <HealthIcon />,
      path: '/system-health',
      permission: 'system-health:read',
    },
    {
      text: 'Performance',
      icon: <SpeedIcon />,
      path: '/performance',
      permission: 'performance:read',
    },
    {
      text: 'Alerts',
      icon: <WarningIcon />,
      path: '/alerts',
      permission: 'alerts:read',
    },
    {
      text: 'Users',
      icon: <PeopleIcon />,
      path: '/users',
      permission: 'users:read',
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      permission: 'settings:read',
    },
  ];

  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case UserRole.MANAGEMENT:
        return '#1976d2';
      case UserRole.DEVOPS:
        return '#dc004e';
      case UserRole.QA:
        return '#2e7d32';
      case UserRole.DEV:
        return '#ed6c02';
      default:
        return '#757575';
    }
  };

  const getRoleLabel = (role: UserRole): string => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <Box>
      {/* User Profile Section */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Avatar
          sx={{
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 1,
            bgcolor: 'primary.main',
          }}
        >
          {user?.firstName?.charAt(0) || 'U'}
        </Avatar>
        <Typography variant="h6" noWrap>
          {user?.firstName} {user?.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {user?.email}
        </Typography>
        <Chip
          label={getRoleLabel(user?.role || UserRole.OTHER)}
          size="small"
          sx={{
            mt: 1,
            bgcolor: getRoleColor(user?.role || UserRole.OTHER),
            color: 'white',
            fontWeight: 'bold',
          }}
        />
      </Box>

      {/* Navigation Menu */}
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => {
          if (!hasPermission(item.permission)) return null;
          
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => {
                  navigate(item.path);
                  onItemClick?.();
                }}
                sx={{
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.main',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'primary.contrastText' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Logout Button */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
