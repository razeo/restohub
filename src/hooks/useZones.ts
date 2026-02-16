import { useState, useCallback, useEffect } from 'react';
import { Zone } from '../types';
import { STORAGE_KEYS, INITIAL_ZONES } from '../data/initialData';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { generateId } from '../utils/id';

export function useZones() {
    const [zones, setZones] = useState<Zone[]>(() =>
        getStorageItem(STORAGE_KEYS.ZONES, INITIAL_ZONES)
    );

    useEffect(() => {
        setStorageItem(STORAGE_KEYS.ZONES, zones);
    }, [zones]);

    const addZone = useCallback((label: string, color: string, description?: string) => {
        const newZone: Zone = {
            id: generateId('zone'),
            label,
            color,
            description
        };
        setZones(prev => [...prev, newZone]);
        return newZone;
    }, []);

    const removeZone = useCallback((id: string) => {
        setZones(prev => prev.filter(z => z.id !== id));
    }, []);

    const updateZone = useCallback((id: string, updates: Partial<Zone>) => {
        setZones(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
    }, []);

    return {
        zones,
        setZones,
        addZone,
        removeZone,
        updateZone
    };
}
