// ===========================================
// Date Utilities Tests
// ===========================================

import { describe, it, expect } from 'vitest';
import { 
  getMonday, 
  formatDateToId, 
  addWeeks, 
  dayOfWeekToDate,
  getDayName 
} from '../utils/date';
import { DayOfWeek } from '../types';

describe('Date Utilities', () => {
  describe('getMonday', () => {
    it('returns Monday for Tuesday', () => {
      const tuesday = new Date('2026-01-28T12:00:00'); // Tuesday
      const monday = getMonday(tuesday);
      expect(monday.getDay()).toBe(1); // Monday
      expect(monday.getDate()).toBe(26);
    });

    it('returns same day for Monday', () => {
      const monday = new Date('2026-01-26T12:00:00'); // Monday
      const result = getMonday(monday);
      expect(result.getDay()).toBe(1);
      expect(result.getDate()).toBe(26);
    });

    it('returns Monday for Sunday', () => {
      const sunday = new Date('2026-02-01T12:00:00'); // Sunday
      const monday = getMonday(sunday);
      expect(monday.getDay()).toBe(1);
      expect(monday.getDate()).toBe(26);
    });
  });

  describe('formatDateToId', () => {
    it('formats date as YYYY-MM-DD', () => {
      const date = new Date('2026-01-26');
      expect(formatDateToId(date)).toBe('2026-01-26');
    });

    it('pads single digit months and days', () => {
      const date = new Date('2026-01-05');
      expect(formatDateToId(date)).toBe('2026-01-05');
    });
  });

  describe('addWeeks', () => {
    it('adds 1 week', () => {
      const date = new Date('2026-01-26');
      const result = addWeeks(date, 1);
      expect(result.getDate()).toBe(2); // Feb 2
    });

    it('subtracts 1 week', () => {
      const date = new Date('2026-01-26');
      const result = addWeeks(date, -1);
      expect(result.getDate()).toBe(19);
    });
  });

  describe('dayOfWeekToDate', () => {
    it('converts Monday to correct date', () => {
      const weekStart = new Date('2026-01-26T00:00:00'); // Monday
      const result = dayOfWeekToDate(weekStart, DayOfWeek.MONDAY);
      expect(result.getDay()).toBe(1);
      expect(result.getDate()).toBe(26);
    });

    it('converts Friday to correct date', () => {
      const weekStart = new Date('2026-01-26T00:00:00'); // Monday
      const result = dayOfWeekToDate(weekStart, DayOfWeek.FRIDAY);
      expect(result.getDay()).toBe(5);
      expect(result.getDate()).toBe(30);
    });
  });

  describe('getDayName', () => {
    it('returns correct day name in Croatian', () => {
      const monday = new Date('2026-01-26');
      expect(getDayName(monday)).toBe('Ponedjeljak');
    });

    it('returns Nedjelja for Sunday', () => {
      const sunday = new Date('2026-02-01');
      expect(getDayName(sunday)).toBe('Nedjelja');
    });
  });
});
