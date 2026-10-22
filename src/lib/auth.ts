import { createContext, useContext, useEffect, useState, ReactNode, createElement } from 'react';

export type UserRole = 'admin' | 'creator' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export const PRESET_USERS: Record<UserRole, UserProfile> = {
  admin: {
    id: 'user-admin-01',
    email: 'admin@formflow.app',
    name: 'Sathwik (Admin)',
    role: 'admin',
  },
  creator: {
    id: 'user-creator-01',
    email: 'creator@formflow.app',
    name: 'Sarah (Form Creator)',
    role: 'creator',
  },
  viewer: {
    id: 'user-viewer-01',
    email: 'viewer@formflow.app',
    name: 'Alex (Auditor / Viewer)',
    role: 'viewer',
  },
};

export interface RolePermissions {
  canCreateForm: boolean;
  canEditForm: boolean;
  canDeleteForm: boolean;
  canDuplicateForm: boolean;
  canPublishForm: boolean;
  canDeleteResponse: boolean;
  canExportCSV: boolean;
  canManageWebhooks: boolean;
  canAccessAdminSettings: boolean;
  canViewAuditLogs: boolean;
}

export function getPermissions(role: UserRole): RolePermissions {
  switch (role) {
    case 'admin':
      return {
        canCreateForm: true,
        canEditForm: true,
        canDeleteForm: true,
        canDuplicateForm: true,
        canPublishForm: true,
        canDeleteResponse: true,
        canExportCSV: true,
        canManageWebhooks: true,
        canAccessAdminSettings: true,
        canViewAuditLogs: true,
      };
    case 'creator':
      return {
        canCreateForm: true,
        canEditForm: true,
        canDeleteForm: false, // Protected: only admins can permanently destroy forms
        canDuplicateForm: true,
        canPublishForm: true,
        canDeleteResponse: false, // Cannot tamper with raw submissions
        canExportCSV: true,
        canManageWebhooks: true,
        canAccessAdminSettings: false,
        canViewAuditLogs: false,
      };
    case 'viewer':
      return {
        canCreateForm: false,
        canEditForm: false,
        canDeleteForm: false,
        canDuplicateForm: false,
        canPublishForm: false,
        canDeleteResponse: false,
        canExportCSV: true, // Read-only analytics export allowed
        canManageWebhooks: false,
        canAccessAdminSettings: false,
        canViewAuditLogs: false,
      };
  }
}

interface AuthContextType {
  role: UserRole;
  user: UserProfile;
  permissions: RolePermissions;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  role: 'admin',
  user: PRESET_USERS.admin,
  permissions: getPermissions('admin'),
  setRole: () => {},
});

const ROLE_STORAGE_KEY = 'formflow_current_role';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null;
    if (saved && (saved === 'admin' || saved === 'creator' || saved === 'viewer')) {
      return saved;
    }
    return 'admin';
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem(ROLE_STORAGE_KEY, newRole);
  };

  const user = PRESET_USERS[role];
  const permissions = getPermissions(role);

  return createElement(
    AuthContext.Provider,
    { value: { role, user, permissions, setRole } },
    children
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
