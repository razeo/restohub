import { useState, useEffect } from 'react';
import { Duty } from '../types';
import { STORAGE_KEYS } from '../data/initialData';

export function useDuties() {
  const [duties, setDuties] = useState<Duty[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.DUTIES);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DUTIES, JSON.stringify(duties));
  }, [duties]);

  const addDuty = (label: string, color: string) => {
    const newDuty: Duty = {
      id: `duty-${Date.now()}`,
      label,
      color,
    };
    setDuties(prev => [...prev, newDuty]);
  };

  const removeDuty = (id: string) => {
    setDuties(prev => prev.filter(d => d.id !== id));
  };

  const updateDuty = (id: string, updates: Partial<Duty>) => {
    setDuties(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  return { duties, addDuty, removeDuty, updateDuty };
}
