import { useState, useCallback } from 'react';
import { Shift } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../utils/storage';
import { generateShiftId } from '../utils/id';
import { INITIAL_SHIFTS } from '../data/initialData';
import { toast } from 'react-hot-toast';

export function useShifts() {
    const [shifts, setShifts] = useState<Shift[]>(() =>
        getStorageItem(STORAGE_KEYS.SHIFTS, INITIAL_SHIFTS)
    );

    const addShift = useCallback((newShift: Omit<Shift, 'id'>) => {
        setShifts(prev => {
            const updated = [...prev, { ...newShift, id: generateShiftId() }];
            setStorageItem(STORAGE_KEYS.SHIFTS, updated);
            return updated;
        });
        toast.success(`Dodata smjena: ${newShift.label}`);
    }, []);

    const addShifts = useCallback((newShifts: Omit<Shift, 'id'>[]) => {
        setShifts(prev => {
            const updated = [
                ...prev,
                ...newShifts.map(s => ({ ...s, id: generateShiftId() }))
            ];
            setStorageItem(STORAGE_KEYS.SHIFTS, updated);
            return updated;
        });
        if (newShifts.length > 0) {
            toast.success(`Dodato ${newShifts.length} smjena`);
        }
    }, []);

    const removeShift = useCallback((id: string) => {
        setShifts(prev => {
            const shift = prev.find(s => s.id === id);
            const updated = prev.filter(s => s.id !== id);
            setStorageItem(STORAGE_KEYS.SHIFTS, updated);
            if (shift) toast.success(`Uklonjena smjena: ${shift.label}`);
            return updated;
        });
    }, []);

    const updateShift = useCallback((updatedShift: Shift) => {
        setShifts(prev => {
            const updated = prev.map(s => s.id === updatedShift.id ? updatedShift : s);
            setStorageItem(STORAGE_KEYS.SHIFTS, updated);
            toast.success(`Ažurirana smjena: ${updatedShift.label}`);
            return updated;
        });
    }, []);

    return {
        shifts,
        setShifts,
        addShift,
        addShifts,
        removeShift,
        updateShift,
    };
}
