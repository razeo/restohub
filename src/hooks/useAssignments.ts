import { useState, useCallback } from 'react';
import { Assignment, DayOfWeek } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../utils/storage';
import { generateAssignmentId } from '../utils/id';

export function useAssignments(currentWeekId: string) {
    const [assignments, setAssignments] = useState<Assignment[]>(() =>
        getStorageItem(STORAGE_KEYS.ASSIGNMENTS, [])
    );

    const removeAssignment = useCallback((id: string) => {
        setAssignments(prev => {
            const filtered = prev.filter(a => a.id !== id);
            setStorageItem(STORAGE_KEYS.ASSIGNMENTS, filtered);
            return filtered;
        });
    }, []);

    const manualAssign = useCallback((shiftId: string, employeeId: string, day: DayOfWeek) => {
        let isDuplicate = false;
        setAssignments(prev => {
            isDuplicate = prev.some(a =>
                a.shiftId === shiftId &&
                a.employeeId === employeeId &&
                a.day === day &&
                a.weekId === currentWeekId
            );

            if (isDuplicate) return prev;

            const newAssignment: Assignment = {
                id: generateAssignmentId(),
                shiftId,
                employeeId,
                weekId: currentWeekId,
                day
            };

            const updated = [...prev, newAssignment];
            setStorageItem(STORAGE_KEYS.ASSIGNMENTS, updated);
            return updated;
        });
        return !isDuplicate;
    }, [currentWeekId]);

    const clearAssignmentsForEmployee = useCallback((employeeId: string) => {
        setAssignments(prev => {
            const filtered = prev.filter(a => a.employeeId !== employeeId);
            setStorageItem(STORAGE_KEYS.ASSIGNMENTS, filtered);
            return filtered;
        });
    }, []);

    const clearAssignmentsForShift = useCallback((shiftId: string) => {
        setAssignments(prev => {
            const filtered = prev.filter(a => a.shiftId !== shiftId);
            setStorageItem(STORAGE_KEYS.ASSIGNMENTS, filtered);
            return filtered;
        });
    }, []);

    return {
        assignments,
        setAssignments,
        removeAssignment,
        manualAssign,
        clearAssignmentsForEmployee,
        clearAssignmentsForShift,
    };
}
