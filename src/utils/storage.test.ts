// ===========================================
// Storage Utilities Tests
// ===========================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getStorageItem, 
  setStorageItem, 
  STORAGE_KEYS,
  clearAllStorage
} from '../utils/storage';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock document for DOM-dependent functions
const documentMock = {
  createElement: vi.fn().mockReturnValue({
    href: '',
    download: '',
    click: vi.fn(),
  }),
};

Object.defineProperty(globalThis, 'document', {
  value: documentMock,
  writable: true,
});

describe('Storage Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStorageItem', () => {
    it('returns default value when key not found', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const result = getStorageItem('test-key', 'default');
      expect(result).toBe('default');
    });

    it('returns parsed JSON when data exists', () => {
      localStorageMock.getItem.mockReturnValue('{"name":"test"}');
      const result = getStorageItem('test-key', {});
      expect(result).toEqual({ name: 'test' });
    });

    it('returns default for invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      const result = getStorageItem('test-key', 'default');
      expect(result).toBe('default');
    });

    it('returns default when stored value is not an array but array expected', () => {
      localStorageMock.getItem.mockReturnValue('{"not":"array"}');
      const result = getStorageItem('test-key', []);
      expect(result).toEqual([]);
    });
  });

  describe('setStorageItem', () => {
    it('stores JSON string in localStorage', () => {
      setStorageItem('test-key', { data: 'value' });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-key',
        '{"data":"value"}'
      );
    });
  });

  describe('STORAGE_KEYS', () => {
    it('has all required keys', () => {
      expect(STORAGE_KEYS.EMPLOYEES).toBe('shift_scheduler_employees');
      expect(STORAGE_KEYS.DUTIES).toBe('shift_scheduler_duties');
      expect(STORAGE_KEYS.SHIFTS).toBe('shift_scheduler_shifts');
      expect(STORAGE_KEYS.ASSIGNMENTS).toBe('shift_scheduler_assignments');
      expect(STORAGE_KEYS.AI_RULES).toBe('shift_scheduler_ai_rules');
    });
  });

  describe('clearAllStorage', () => {
    it('removes all storage keys', () => {
      clearAllStorage();
      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(Object.keys(STORAGE_KEYS).length);
    });
  });
});
