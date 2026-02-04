// ===========================================
// Simple Employees Page
// ===========================================

import { useState } from 'react';
import { Employee, Role } from '../../types';

const ROLE_LABELS: Record<Role, string> = {
  [Role.SERVER]: 'Konobar',
  [Role.CHEF]: 'Kuvar',
  [Role.BARTENDER]: 'Barmen',
  [Role.HOST]: 'Hostesa',
  [Role.MANAGER]: 'Menadžer',
  [Role.DISHWASHER]: 'Perac sudova',
  [Role.HEAD_WAITER]: 'Glavni konobar',
};

interface EmployeesPageProps {
  employees: Employee[];
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  onRemoveEmployee: (id: string) => void;
}

export function EmployeesPage({ employees, onAddEmployee, onRemoveEmployee }: EmployeesPageProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.SERVER);

  const handleAdd = () => {
    if (name.trim()) {
      onAddEmployee({
        name: name.trim(),
        role,
      });
      setName('');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Radnici</h2>
          <p className="text-slate-500">{employees.length} radnika</p>
        </div>
      </div>

      {/* Add Employee Form */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <h3 className="font-semibold text-slate-700 mb-3">Dodaj novog radnika</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ime i prezime"
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Dodaj
          </button>
        </div>
      </div>

      {/* Employees List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {employees.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Nema radnika. Dodajte prvog radnika.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Ime</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Uloga</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(employee => (
                <tr key={employee.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{employee.name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-slate-100 rounded-full text-xs">
                      {ROLE_LABELS[employee.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onRemoveEmployee(employee.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Obriši
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
