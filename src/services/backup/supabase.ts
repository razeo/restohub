// ===========================================
// Supabase Backup Service
// Syncs backup data with Supabase for cloud backup
// ===========================================

import { BackupData, BackupVersion } from './index';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface SyncResult {
  success: boolean;
  lastSync: number | null;
  error?: string;
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

// Get Supabase configuration
export function getSupabaseConfig(): SupabaseConfig | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
  };
}

// Supabase client initialization (lazy loaded)
let supabaseClient: unknown = null;

async function getSupabaseClient(): Promise<{
  from: (table: string) => Promise<{
    select: (columns?: string) => Promise<{ data: unknown[]; error: unknown }>;
    insert: (rows: unknown[]) => Promise<{ data: unknown; error: unknown }>;
    upsert: (rows: unknown[]) => Promise<{ data: unknown; error: unknown }>;
    delete: () => Promise<{ error: unknown }>;
    eq: (column: string, value: unknown) => {
      select: (columns?: string) => Promise<{ data: unknown[]; error: unknown }>;
      delete: () => Promise<{ error: unknown }>;
    };
  }>;
  storage: {
    from: (bucket: string) => {
      upload: (path: string, file: Blob) => Promise<{ data: { path: string }; error: unknown }>;
      download: (path: string) => Promise<{ data: Blob | null; error: unknown }>;
      remove: (paths: string[]) => Promise<{ error: unknown }>;
      getPublicUrl: (path: string) => { data: { publicUrl: string } };
    };
  };
  rpc: (function: string, params?: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
} | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (supabaseClient) {
    return supabaseClient as ReturnType<typeof getSupabaseClient>;
  }

  try {
    // Dynamic import for Supabase
    const { createClient } = await import('@supabase/supabase-js');
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseClient as ReturnType<typeof getSupabaseClient>;
  } catch (error) {
    console.error('[Supabase] Failed to initialize client:', error);
    return null;
  }
}

// Upload backup to Supabase
export async function uploadBackup(backup: BackupData): Promise<SyncResult> {
  const client = await getSupabaseClient();
  if (!client) {
    return { success: false, lastSync: null, error: 'Supabase not configured' };
  }

  try {
    const { error } = await client.from('backups').upsert({
      id: 'current',
      data: backup,
      created_at: new Date().toISOString(),
      version: backup.version,
    });

    if (error) {
      throw error;
    }

    return { success: true, lastSync: Date.now() };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Supabase] Upload failed:', message);
    return { success: false, lastSync: null, error: message };
  }
}

// Download backup from Supabase
export async function downloadBackup(): Promise<BackupData | null> {
  const client = await getSupabaseClient();
  if (!client) {
    return null;
  }

  try {
    const { data, error } = await client.from('backups').select('*').eq('id', 'current').single();

    if (error) {
      throw error;
    }

    return data as BackupData;
  } catch (error) {
    console.error('[Supabase] Download failed:', error);
    return null;
  }
}

// Get sync history
export async function getSyncHistory(limit: number = 10): Promise<BackupVersion[]> {
  const client = await getSupabaseClient();
  if (!client) {
    return [];
  }

  try {
    const { data, error } = await client
      .from('backups')
      .select('id, created_at, version')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data || []).map((item: { id: string; created_at: string; version: string }) => ({
      id: item.id,
      timestamp: new Date(item.created_at).getTime(),
      description: `Sync backup (${item.version})`,
      size: 0,
    }));
  } catch (error) {
    console.error('[Supabase] Get history failed:', error);
    return [];
  }
}

// Delete backup from Supabase
export async function deleteRemoteBackup(): Promise<SyncResult> {
  const client = await getSupabaseClient();
  if (!client) {
    return { success: false, lastSync: null, error: 'Supabase not configured' };
  }

  try {
    const { error } = await client.from('backups').delete().eq('id', 'current');

    if (error) {
      throw error;
    }

    return { success: true, lastSync: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Supabase] Delete failed:', message);
    return { success: false, lastSync: null, error: message };
  }
}

// Sync local backup to Supabase
export async function syncToSupabase(backup: BackupData): Promise<SyncResult> {
  return uploadBackup(backup);
}

// Sync from Supabase to local
export async function syncFromSupabase(): Promise<BackupData | null> {
  return downloadBackup();
}

// Check if Supabase storage is available
export async function isSupabaseAvailable(): Promise<boolean> {
  const client = await getSupabaseClient();
  if (!client) {
    return false;
  }

  try {
    const { error } = await client.from('backups').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
}
