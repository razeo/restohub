// ===========================================
// Permissions Editor Component for RestoHub (Admin only)
// ===========================================

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { usePermissions, usePermissionCheck } from '../../contexts/PermissionsContext';
import { Permissions } from '../../types/permissions';

interface PermissionSection {
  title: string;
  icon: string;
  permissions: (keyof Permissions)[];
}

const sections: PermissionSection[] = [
  {
    title: '📅 Raspored',
    icon: '📅',
    permissions: ['scheduleView', 'scheduleEdit'],
  },
  {
    title: '👥 Radnici',
    icon: '👥',
    permissions: ['employeesView', 'employeesAdd', 'employeesEdit', 'employeesDelete'],
  },
  {
    title: '🕐 Smjene',
    icon: '🕐',
    permissions: ['shiftsView', 'shiftsManage'],
  },
  {
    title: '📋 Dužnosti',
    icon: '📋',
    permissions: ['dutiesManage'],
  },
  {
    title: '📊 Izvještaji',
    icon: '📊',
    permissions: ['reportsView'],
  },
  {
    title: '⚙️ Postavke',
    icon: '⚙️',
    permissions: ['settingsAccess'],
  },
  {
    title: '🔐 Korisnici',
    icon: '🔐',
    permissions: ['usersManage'],
  },
];

const roleLabels: Record<string, string> = {
  admin: '👑 Admin',
  manager: '👨‍💼 Menadžer', 
  employee: '👷 Radnik',
};

function formatPermissionKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1') // camelCase to words
    .replace(/^./, str => str.toUpperCase()); // Capitalize first
}

export function PermissionsEditor() {
  const { permissions, updatePermission, setRolePermissions } = usePermissions();
  const [activeRole, setActiveRole] = useState('admin');
  const { canManageUsers } = usePermissionCheck();
  
  // Only allow admins to edit permissions
  if (!canManageUsers) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-slate-400">Pristup ograničen</h2>
        <p className="text-slate-500 mt-2">Samo administratori mogu uređivati dozvole.</p>
      </div>
    );
  }
  
  const handleSave = () => {
    toast.success('Dozvole su uspješno sačuvane!');
  };
  
  const handleRoleChange = (role: string) => {
    setActiveRole(role);
    setRolePermissions(role);
    toast.success(`Dozvole resetovane na default za ${roleLabels[role]}`);
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Upravljanje dozvolama</h2>
        <div className="flex gap-2">
          {Object.entries(roleLabels).map(([role, label]) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                activeRole === role
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Permissions sections */}
      <div className="space-y-4">
        {sections.map(section => (
          <div key={section.title} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{section.icon}</span>
              <h3 className="font-semibold text-slate-800">{section.title}</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {section.permissions.map(permKey => {
                const permLabel = formatPermissionKey(permKey);
                
                return (
                  <label
                    key={permKey}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={permissions[permKey] || false}
                      onChange={(e) => updatePermission(permKey, e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">{permLabel}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Save button */}
      <div className="mt-6">
        <button
          onClick={handleSave}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          💾 Sačuvaj promjene
        </button>
      </div>
      
      {/* JSON preview */}
      <div className="mt-6 p-4 bg-slate-50 rounded-xl">
        <h4 className="text-sm font-semibold text-slate-600 mb-2">JSON pregled:</h4>
        <pre className="text-xs text-slate-500 overflow-auto max-h-40">
          {JSON.stringify(permissions, null, 2)}
        </pre>
      </div>
    </div>
  );
}
