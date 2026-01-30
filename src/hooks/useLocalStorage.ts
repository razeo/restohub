import { useState } from 'react';

// ===========================================
// Safe localStorage hook with error handling
// Handles corrupted data and provides type safety
// ===========================================

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      localStorage.removeItem(key);
      setStoredValue(defaultValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}

/**
 * Helper function to safely parse JSON from localStorage
 */
export function safeParse<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Error parsing localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Clear all localStorage data for this app
 */
export function clearAllData(): void {
  const keys = [
    'shift_scheduler_employees',
    'shift_scheduler_shifts',
    'shift_scheduler_duties',
    'shift_scheduler_assignments',
    'shift_scheduler_ai_rules',
  ];
  
  keys.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing "${key}":`, error);
    }
  });
}
