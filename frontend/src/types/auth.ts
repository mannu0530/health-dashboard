export enum UserRole {
  MANAGEMENT = 'management',
  DEVOPS = 'devops',
  QA = 'qa',
  DEV = 'dev',
  OTHER = 'other'
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface Permission {
  resource: string;
  action: string;
  allowed: boolean;
}

export const RolePermissions: Record<UserRole, string[]> = {
  [UserRole.MANAGEMENT]: [
    'dashboard:read',
    'system-health:read',
    'performance:read',
    'alerts:read',
    'alerts:write',
    'users:read',
    'users:write',
    'settings:read',
    'settings:write'
  ],
  [UserRole.DEVOPS]: [
    'dashboard:read',
    'system-health:read',
    'performance:read',
    'alerts:read',
    'alerts:write',
    'settings:read'
  ],
  [UserRole.QA]: [
    'dashboard:read',
    'system-health:read',
    'performance:read',
    'settings:read'
  ],
  [UserRole.DEV]: [
    'dashboard:read',
    'system-health:read',
    'performance:read',
    'settings:read'
  ],
  [UserRole.OTHER]: [
    'dashboard:read',
    'system-health:read'
  ]
};
