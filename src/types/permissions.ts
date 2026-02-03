// ===========================================
// Permissions Types for RestoHub
// ===========================================

export interface Permissions {
  // Schedule
  scheduleView: boolean;
  scheduleEdit: boolean;
  
  // Employees
  employeesView: boolean;
  employeesAdd: boolean;
  employeesEdit: boolean;
  employeesDelete: boolean;
  
  // Shifts
  shiftsView: boolean;
  shiftsManage: boolean;
  
  // Duties
  dutiesManage: boolean;
  
  // Reports
  reportsView: boolean;
  
  // Settings
  settingsAccess: boolean;
  
  // Users
  usersManage: boolean;
}

export const defaultPermissions: Record<string, Permissions> = {
  admin: {
    scheduleView: true,
    scheduleEdit: true,
    employeesView: true,
    employeesAdd: true,
    employeesEdit: true,
    employeesDelete: true,
    shiftsView: true,
    shiftsManage: true,
    dutiesManage: true,
    reportsView: true,
    settingsAccess: true,
    usersManage: true,
  },
  manager: {
    scheduleView: true,
    scheduleEdit: true,
    employeesView: true,
    employeesAdd: true,
    employeesEdit: true,
    employeesDelete: false,
    shiftsView: true,
    shiftsManage: true,
    dutiesManage: true,
    reportsView: true,
    settingsAccess: false,
    usersManage: false,
  },
  employee: {
    scheduleView: true,
    scheduleEdit: false,
    employeesView: false,
    employeesAdd: false,
    employeesEdit: false,
    employeesDelete: false,
    shiftsView: true,
    shiftsManage: false,
    dutiesManage: false,
    reportsView: false,
    settingsAccess: false,
    usersManage: false,
  },
};

export function getDefaultPermissions(role: string): Permissions {
  return defaultPermissions[role] || defaultPermissions.employee;
}
