import { useState, useCallback } from 'react';
import { Employee } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../utils/storage';
import { generateEmployeeId } from '../utils/id';
import { INITIAL_EMPLOYEES } from '../data/initialData';
import { toast } from 'react-hot-toast';

export function useEmployees() {
    const [employees, setEmployees] = useState<Employee[]>(() =>
        getStorageItem(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES)
    );

    const addEmployee = useCallback((newEmp: Omit<Employee, 'id'>) => {
        setEmployees(prev => {
            const updated = [...prev, { ...newEmp, id: generateEmployeeId() }];
            setStorageItem(STORAGE_KEYS.EMPLOYEES, updated);
            return updated;
        });
        toast.success(`Dodat radnik: ${newEmp.name}`);
    }, []);

    const removeEmployee = useCallback((id: string) => {
        setEmployees(prev => {
            const employee = prev.find(e => e.id === id);
            const updated = prev.filter(e => e.id !== id);
            setStorageItem(STORAGE_KEYS.EMPLOYEES, updated);
            if (employee) toast.success(`Uklonjen radnik: ${employee.name}`);
            return updated;
        });
    }, []);

    const updateEmployee = useCallback((updatedEmployee: Employee) => {
        setEmployees(prev => {
            const updated = prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e);
            setStorageItem(STORAGE_KEYS.EMPLOYEES, updated);
            toast.success('Radnik ažuriran');
            return updated;
        });
    }, []);

    return {
        employees,
        setEmployees,
        addEmployee,
        removeEmployee,
        updateEmployee,
    };
}
