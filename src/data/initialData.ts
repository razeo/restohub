// ===========================================
// Initial Data for RestoHub
// Contains default/hardcoded data used to initialize the app
// ===========================================

import { Employee, Duty, Shift, Role, DayOfWeek, ShiftTemplate } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Marko Marković', role: Role.SERVER },
  { id: 'emp-2', name: 'Jovan Jovanović', role: Role.CHEF },
  { id: 'emp-3', name: 'Petar Petrović', role: Role.BARTENDER },
];

export const INITIAL_DUTIES: Duty[] = [
  { id: 'dt-1', label: 'Glavna smjena' },
  { id: 'dt-2', label: 'Pomoćna smjena' },
  { id: 'dt-3', label: 'Vikend' },
];

export const INITIAL_SHIFTS: Shift[] = [
  { id: 'sh-1', day: DayOfWeek.MONDAY, startTime: '08:00', endTime: '16:00', label: 'Jutarnja' },
  { id: 'sh-2', day: DayOfWeek.MONDAY, startTime: '16:00', endTime: '00:00', label: 'Večernja' },
  { id: 'sh-3', day: DayOfWeek.TUESDAY, startTime: '08:00', endTime: '16:00', label: 'Jutarnja' },
  { id: 'sh-4', day: DayOfWeek.TUESDAY, startTime: '16:00', endTime: '00:00', label: 'Večernja' },
  { id: 'sh-5', day: DayOfWeek.WEDNESDAY, startTime: '08:00', endTime: '16:00', label: 'Jutarnja' },
  { id: 'sh-6', day: DayOfWeek.WEDNESDAY, startTime: '16:00', endTime: '00:00', label: 'Večernja' },
  { id: 'sh-7', day: DayOfWeek.THURSDAY, startTime: '08:00', endTime: '16:00', label: 'Jutarnja' },
  { id: 'sh-8', day: DayOfWeek.THURSDAY, startTime: '16:00', endTime: '00:00', label: 'Večernja' },
  { id: 'sh-9', day: DayOfWeek.FRIDAY, startTime: '08:00', endTime: '16:00', label: 'Jutarnja' },
  { id: 'sh-10', day: DayOfWeek.FRIDAY, startTime: '16:00', endTime: '00:00', label: 'Večernja' },
  { id: 'sh-11', day: DayOfWeek.SATURDAY, startTime: '08:00', endTime: '16:00', label: 'Jutarnja' },
  { id: 'sh-12', day: DayOfWeek.SATURDAY, startTime: '16:00', endTime: '00:00', label: 'Večernja' },
  { id: 'sh-13', day: DayOfWeek.SUNDAY, startTime: '08:00', endTime: '16:00', label: 'Jutarnja' },
  { id: 'sh-14', day: DayOfWeek.SUNDAY, startTime: '16:00', endTime: '00:00', label: 'Večernja' },
];

export const DEFAULT_AI_RULES = `• Svaki radnik ima max 5 smjena sedmično
• Poštuj dostupnost radnika
• Barbier i Host ne mogu raditi noćne smjene
• Vikendi su za iskusne radnike`;

// Default shift templates
export const DEFAULT_TEMPLATES: ShiftTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Standardna sedmica',
    description: 'Standardna sedmica sa jutarnjim i večernjim smjenama',
    shifts: INITIAL_SHIFTS,
    createdAt: Date.now(),
  },
  {
    id: 'tpl-2',
    name: 'Vikend specijal',
    description: 'Vikend raspored sa dodatnom posadom',
    shifts: INITIAL_SHIFTS.filter(s => 
      s.day === DayOfWeek.SATURDAY || s.day === DayOfWeek.SUNDAY
    ),
    createdAt: Date.now(),
  },
];
