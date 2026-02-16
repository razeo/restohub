import { useState, useCallback, useEffect } from 'react';
import { SpecialDuty } from '../types';
import { STORAGE_KEYS, INITIAL_SPECIAL_DUTIES } from '../data/initialData';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { generateId } from '../utils/id';

export function useSpecialDuties() {
    const [specialDuties, setSpecialDuties] = useState<SpecialDuty[]>(() =>
        getStorageItem(STORAGE_KEYS.SPECIAL_DUTIES, INITIAL_SPECIAL_DUTIES)
    );

    useEffect(() => {
        setStorageItem(STORAGE_KEYS.SPECIAL_DUTIES, specialDuties);
    }, [specialDuties]);

    const addSpecialDuty = useCallback((label: string, color: string, description?: string) => {
        const newSD: SpecialDuty = {
            id: generateId('sd'),
            label,
            color,
            description
        };
        setSpecialDuties(prev => [...prev, newSD]);
        return newSD;
    }, []);

    const removeSpecialDuty = useCallback((id: string) => {
        setSpecialDuties(prev => prev.filter(sd => sd.id !== id));
    }, []);

    const updateSpecialDuty = useCallback((id: string, updates: Partial<SpecialDuty>) => {
        setSpecialDuties(prev => prev.map(sd => sd.id === id ? { ...sd, ...updates } : sd));
    }, []);

    return {
        specialDuties,
        setSpecialDuties,
        addSpecialDuty,
        removeSpecialDuty,
        updateSpecialDuty
    };
}
