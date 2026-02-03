// ===========================================
// Permissions Context for RestoHub
// ===========================================

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Permissions, getDefaultPermissions } from '../types/permissions';
import { getStorageItem, setStorageItem } from '../utils/storage';

const PERMISSIONS_KEY = 'restohub_permissions';

interface PermissionsContextType {
  permissions: Permissions;
  updatePermission: (key: keyof Permissions, value: boolean) => void;
  resetPermissions: (role?: string) => void;
  setRolePermissions: (role: string) => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<Permissions>(() => {
    const saved = getStorageItem<Permissions | null>(PERMISSIONS_KEY, null);
    return saved || getDefaultPermissions('admin');
  });
  
  useEffect(() => {
    setStorageItem(PERMISSIONS_KEY, permissions);
  }, [permissions]);
  
  const updatePermission = (key: keyof Permissions, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [key]: value,
    }));
  };
  
  const resetPermissions = (role: string = 'admin') => {
    setPermissions(getDefaultPermissions(role));
  };
  
  const setRolePermissions = (role: string) => {
    setPermissions(getDefaultPermissions(role));
  };
  
  return (
    <PermissionsContext.Provider value={{ permissions, updatePermission, resetPermissions, setRolePermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions(): PermissionsContextType {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within PermissionsProvider');
  }
  return context;
}

// Convenience hook for permission checks
export function usePermissionCheck() {
  const { permissions } = usePermissions();
  
  return {
    canViewSchedule: permissions.scheduleView,
    canEditSchedule: permissions.scheduleEdit,
    canViewEmployees: permissions.employeesView,
    canAddEmployees: permissions.employeesAdd,
    canEditEmployees: permissions.employeesEdit,
    canDeleteEmployees: permissions.employeesDelete,
    canViewShifts: permissions.shiftsView,
    canManageShifts: permissions.shiftsManage,
    canManageDuties: permissions.dutiesManage,
    canViewReports: permissions.reportsView,
    canAccessSettings: permissions.settingsAccess,
    canManageUsers: permissions.usersManage,
  };
}
