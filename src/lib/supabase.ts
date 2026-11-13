/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { fetchNeonStatus, testCustomNeonConnection } from './neon';

// Compatibility layer bridging previous database interface to Neon PostgreSQL

export interface DatabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export const getSupabaseConfig = (): DatabaseConfig => {
  let storedUrl = '';
  let storedKey = '';

  if (typeof window !== 'undefined') {
    try {
      storedUrl = localStorage.getItem('mela_neon_url') || localStorage.getItem('mela_supabase_url') || '';
      storedKey = localStorage.getItem('mela_neon_key') || '';
    } catch {
      // ignore
    }
  }

  const isConfigured = Boolean(storedUrl.startsWith('postgres') || storedUrl.includes('neon.tech'));
  return {
    url: storedUrl,
    anonKey: storedKey,
    isConfigured,
  };
};

export const isSupabaseConfigured: boolean = false;
export const supabase: any = null;

export const updateSupabaseCredentials = (
  url: string,
  key: string
): { success: boolean; client: any; error?: string } => {
  try {
    const cleanUrl = url.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem('mela_neon_url', cleanUrl);
      localStorage.setItem('mela_neon_key', key.trim());
    }
    return { success: true, client: null };
  } catch (err: any) {
    return { success: false, client: null, error: err.message };
  }
};

export const testSupabaseConnection = async (): Promise<{
  connected: boolean;
  message: string;
  tables?: { profiles: boolean; products: boolean; orders: boolean; buckets: boolean };
}> => {
  const status = await fetchNeonStatus();
  return {
    connected: status.connected,
    message: status.message,
    tables: {
      profiles: Boolean(status.tables?.user_profiles || status.tables?.users),
      products: Boolean(status.tables?.products),
      orders: Boolean(status.tables?.orders),
      buckets: true,
    },
  };
};
