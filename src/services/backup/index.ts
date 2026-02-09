// ===========================================
// Backup Service - LocalStorage Backup with Versioning
// Provides automatic backup with restore functionality
// ===========================================

import { Assignment, ShiftTemplate } from '../types/index';
import { STORAGE_KEYS, getStorageItem, setStorageItem, runMigrations } from '../utils/storage';
import { exportToJSON } from '../utils/storage';

const BACKUP_KEY = 'restohub_backup';
const BACKUP_VERSIONS_KEY = 'restohub_backup_versions';
const MAX_BACKUP_VERSIONS = 10;
const AUTO_BACKUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

export interface BackupData {
  version: string;
  timestamp: number;
  data: {
    employees: unknown[];
    duties: unknown[];
    shifts: unknown[];
    assignments: unknown[];
    templates: ShiftTemplate[];
    aiRules: string;
    settings?: unknown;
  };
}

export interface BackupVersion {
  id: string;
  timestamp: number;
  description: string;
  size: number;
}

export interface BackupStats {
  totalBackups: number;
  latestBackup: number | null;
  storageUsed: number;
}

// Get all stored data for backup
function getAllData(): BackupData['data'] {
  return {
    employees: getStorageItem(STORAGE_KEYS.EMPLOYEES, []),
    duties: getStorageItem(STORAGE_KEYS.DUTIES, []),
    shifts: getStorageItem(STORAGE_KEYS.SHIFTS, []),
    assignments: getStorageItem(STORAGE_KEYS.ASSIGNMENTS, []),
    templates: getStorageItem(STORAGE_KEYS.TEMPLATES, []),
    aiRules: getStorageItem(STORAGE_KEYS.AI_RULES, ''),
  };
}

// Create a backup
export function createBackup(description: string = 'Ručna rezervna kopija'): BackupData {
  const data = getAllData();
  const backup: BackupData = {
    version: '1.0.0',
    timestamp: Date.now(),
    data,
  };

  // Save current backup
  setStorageItem(BACKUP_KEY, backup);

  // Add to versions list
  addBackupVersion(backup, description);

  console.log('[Backup] Backup created:', description);
  return backup;
}

// Get current backup
export function getCurrentBackup(): BackupData | null {
  return getStorageItem<BackupData | null>(BACKUP_KEY, null);
}

// Restore from backup
export function restoreFromBackup(backup: BackupData): boolean {
  try {
    // Validate backup structure
    if (!backup.version || !backup.data) {
      console.error('[Backup] Invalid backup structure');
      return false;
    }

    // Restore all data
    if (backup.data.employees) {
      setStorageItem(STORAGE_KEYS.EMPLOYEES, backup.data.employees);
    }
    if (backup.data.duties) {
      setStorageItem(STORAGE_KEYS.DUTIES, backup.data.duties);
    }
    if (backup.data.shifts) {
      setStorageItem(STORAGE_KEYS.SHIFTS, backup.data.shifts);
    }
    if (backup.data.assignments) {
      setStorageItem(STORAGE_KEYS.ASSIGNMENTS, backup.data.assignments);
    }
    if (backup.data.templates) {
      setStorageItem(STORAGE_KEYS.TEMPLATES, backup.data.templates);
    }
    if (backup.data.aiRules !== undefined) {
      setStorageItem(STORAGE_KEYS.AI_RULES, backup.data.aiRules);
    }

    // Run migrations after restore
    runMigrations();

    console.log('[Backup] Restore completed successfully');
    return true;
  } catch (error) {
    console.error('[Backup] Restore failed:', error);
    return false;
  }
}

// Add backup version to history
function addBackupVersion(backup: BackupData, description: string): void {
  const versions = getBackupVersions();
  const size = JSON.stringify(backup).length;

  const newVersion: BackupVersion = {
    id: `backup-${backup.timestamp}`,
    timestamp: backup.timestamp,
    description,
    size,
  };

  // Add new version at the beginning
  versions.unshift(newVersion);

  // Keep only MAX_BACKUP_VERSIONS
  const trimmedVersions = versions.slice(0, MAX_BACKUP_VERSIONS);
  setStorageItem(BACKUP_VERSIONS_KEY, trimmedVersions);
}

// Get all backup versions
export function getBackupVersions(): BackupVersion[] {
  return getStorageItem<BackupVersion[]>(BACKUP_VERSIONS_KEY, []);
}

// Delete a backup version
export function deleteBackupVersion(id: string): void {
  const versions = getBackupVersions().filter(v => v.id !== id);
  setStorageItem(BACKUP_VERSIONS_KEY, versions);
}

// Get backup statistics
export function getBackupStats(): BackupStats {
  const versions = getBackupVersions();
  const currentBackup = getCurrentBackup();

  return {
    totalBackups: versions.length,
    latestBackup: currentBackup?.timestamp || null,
    storageUsed: versions.reduce((sum, v) => sum + v.size, 0) + (currentBackup ? JSON.stringify(currentBackup).length : 0),
  };
}

// Export backup to file
export function exportBackupToFile(backup?: BackupData): void {
  const data = backup || getCurrentBackup();
  if (!data) {
    console.error('[Backup] No backup to export');
    return;
  }
  exportToJSON(data, `restohub-backup-${new Date().toISOString().split('T')[0]}.json`);
}

// Import backup from file
export async function importBackupFromFile(file: File): Promise<BackupData | null> {
  try {
    const text = await file.text();
    const backup = JSON.parse(text) as BackupData;
    
    // Validate
    if (!backup.version || !backup.data) {
      throw new Error('Invalid backup format');
    }

    return backup;
  } catch (error) {
    console.error('[Backup] Import failed:', error);
    return null;
  }
}

// Auto backup manager
let autoBackupInterval: ReturnType<typeof setInterval> | null = null;

export function startAutoBackup(description: string = 'Automatska rezervna kopija'): void {
  if (autoBackupInterval) {
    console.log('[Backup] Auto backup already running');
    return;
  }

  // Create initial backup
  createBackup(description);

  // Set up interval
  autoBackupInterval = setInterval(() => {
    createBackup(description);
  }, AUTO_BACKUP_INTERVAL);

  console.log('[Backup] Auto backup started');
}

export function stopAutoBackup(): void {
  if (autoBackupInterval) {
    clearInterval(autoBackupInterval);
    autoBackupInterval = null;
    console.log('[Backup] Auto backup stopped');
  }
}

export function isAutoBackupRunning(): boolean {
  return autoBackupInterval !== null;
}
