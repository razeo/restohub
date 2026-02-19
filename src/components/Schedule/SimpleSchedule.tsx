import React from 'react';
import { Employee, Shift, Assignment } from '../../types';

interface SimpleScheduleProps {
  currentWeekStart: Date;
  employees: Employee[];
  shifts: Shift[];
  assignments: Assignment[];
}

export function SimpleSchedule({ currentWeekStart, employees, shifts, assignments }: SimpleScheduleProps) {
  const weekDays = ['Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja'];
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Raspored - {currentWeekStart.toLocaleDateString('sr-RS')}
      </h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <p className="text-gray-500 mb-4"> Nedjelja: {weekDays[0]} - {weekDays[6]}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.length === 0 ? (
            <p className="text-gray-400 col-span-full text-center py-8">
              Nema dodjela za ovu sedmicu
            </p>
          ) : (
            assignments.slice(0, 9).map((assignment, i) => {
              const emp = employees.find(e => e.id === assignment.employeeId);
              const shift = shifts.find(s => s.id === assignment.shiftId);
              return (
                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="font-medium text-gray-800 dark:text-white">{emp?.name || '-'}</p>
                  <p className="text-sm text-gray-500">{shift?.label || '-'}</p>
                </div>
              );
            })
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">
            {employees.length} radnika | {shifts.length} smjena | {assignments.length} dodjela
          </p>
        </div>
      </div>
    </div>
  );
}
