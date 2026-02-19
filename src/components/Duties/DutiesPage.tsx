import React from 'react';
import { Duty } from '../../types';

interface DutiesPageProps {
  duties: Duty[];
  onAdd: (duty: Omit<Duty, 'id'>) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, duty: Partial<Duty>) => void;
}

export function DutiesPage({ duties, onAdd, onRemove, onUpdate }: DutiesPageProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Upravljanje dužnostima
      </h2>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <p className="text-gray-500 dark:text-gray-400">
          Dužnosti: {duties.length}
        </p>
        {duties.map(duty => (
          <div key={duty.id} className="flex items-center justify-between py-2 border-b dark:border-gray-700">
            <span className="text-gray-800 dark:text-white">{duty.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
