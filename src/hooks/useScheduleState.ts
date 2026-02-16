import { useState, useMemo, useCallback } from 'react';
import { useEmployees } from './useEmployees';
import { useShifts } from './useShifts';
import { useDuties } from './useDuties';
import { useZones } from './useZones';
import { useSpecialDuties } from './useSpecialDuties';
import { useAssignments } from './useAssignments';
import { STORAGE_KEYS, getStorageItem, setStorageItem, clearAllStorage } from '../utils/storage';
import { getMonday, formatDateToId, addWeeks } from '../utils/date';
import { ChatMessage, ScheduleState } from '../types';
import { DEFAULT_AI_RULES, INITIAL_EMPLOYEES, INITIAL_SHIFTS, INITIAL_DUTIES, INITIAL_ZONES, INITIAL_SPECIAL_DUTIES } from '../data/initialData';
import { toast } from 'react-hot-toast';

export function useScheduleState() {
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
    const currentWeekId = useMemo(() => formatDateToId(currentWeekStart), [currentWeekStart]);

    const { employees, setEmployees, addEmployee, removeEmployee, updateEmployee } = useEmployees();
    const { shifts, setShifts, addShift, addShifts, removeShift, updateShift } = useShifts();
    const { duties, setDuties, addDuty, removeDuty, updateDuty } = useDuties();
    const { zones, setZones, addZone, removeZone, updateZone } = useZones();
    const { specialDuties, setSpecialDuties, addSpecialDuty, removeSpecialDuty, updateSpecialDuty } = useSpecialDuties();
    const { assignments, setAssignments, removeAssignment, manualAssign, clearAssignmentsForEmployee, clearAssignmentsForShift } = useAssignments(currentWeekId);

    const [aiRules, setAiRules] = useState<string>(() =>
        getStorageItem(STORAGE_KEYS.AI_RULES, DEFAULT_AI_RULES)
    );
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

    const weekAssignments = useMemo(() =>
        assignments.filter(a => a.weekId === currentWeekId),
        [assignments, currentWeekId]
    );

    const navigateWeek = useCallback((direction: number) =>
        setCurrentWeekStart(prev => addWeeks(prev, direction)), []);

    const handleUpdateAiRules = useCallback((rules: string) => {
        setAiRules(rules);
        setStorageItem(STORAGE_KEYS.AI_RULES, rules);
    }, []);

    const handleResetAll = useCallback(() => {
        if (window.confirm('Da li ste sigurni da želite resetovati sve podatke?')) {
            clearAllStorage();
            setEmployees(INITIAL_EMPLOYEES);
            setShifts(INITIAL_SHIFTS);
            setDuties(INITIAL_DUTIES);
            setZones(INITIAL_ZONES);
            setSpecialDuties(INITIAL_SPECIAL_DUTIES);
            setAiRules(DEFAULT_AI_RULES);
            setAssignments([]);
            setChatMessages([]);
            toast.success('Svi podaci su resetovani');
        }
    }, [setEmployees, setShifts, setDuties, setZones, setSpecialDuties, setAssignments]);

    const handleRemoveEmployee = useCallback((id: string) => {
        removeEmployee(id);
        clearAssignmentsForEmployee(id);
    }, [removeEmployee, clearAssignmentsForEmployee]);

    const handleRemoveShift = useCallback((id: string) => {
        removeShift(id);
        clearAssignmentsForShift(id);
    }, [removeShift, clearAssignmentsForShift]);

    const scheduleState: ScheduleState = useMemo(() => ({
        employees,
        shifts,
        assignments,
        duties,
        zones,
        specialDuties,
        currentWeekId,
        aiRules,
    }), [employees, shifts, assignments, duties, zones, specialDuties, currentWeekId, aiRules]);

    return {
        employees,
        shifts,
        duties,
        assignments,
        weekAssignments,
        aiRules,
        chatMessages,
        currentWeekStart,
        currentWeekId,
        scheduleState,
        setChatMessages,
        setAssignments,
        addEmployee,
        removeEmployee: handleRemoveEmployee,
        updateEmployee,
        addShift,
        addShifts,
        removeShift: handleRemoveShift,
        updateShift,
        addDuty,
        removeDuty,
        updateDuty,
        zones,
        addZone,
        removeZone,
        updateZone,
        specialDuties,
        addSpecialDuty,
        removeSpecialDuty,
        updateSpecialDuty,
        manualAssign,
        removeAssignment,
        navigateWeek,
        handleUpdateAiRules,
        handleResetAll,
        setEmployees,
        setShifts,
        setDuties,
        setZones,
        setSpecialDuties,
    };
}
