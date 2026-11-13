/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Neon PostgreSQL client helper for frontend components

export interface NeonStatus {
  connected: boolean;
  provider: 'neon-postgresql' | 'in-memory-fallback';
  databaseUrlConfigured: boolean;
  pooled: boolean;
  database?: string;
  tablesCount?: number;
  tables?: Record<string, boolean>;
  message: string;
  latencyMs?: number;
}

export async function fetchNeonStatus(): Promise<NeonStatus> {
  try {
    const res = await fetch('/api/neon/status');
    if (!res.ok) {
      return {
        connected: false,
        provider: 'in-memory-fallback',
        databaseUrlConfigured: false,
        pooled: false,
        message: `HTTP ${res.status}: Failed to reach Neon API endpoint`,
      };
    }
    return await res.json();
  } catch (err: any) {
    return {
      connected: false,
      provider: 'in-memory-fallback',
      databaseUrlConfigured: false,
      pooled: false,
      message: `Network error connecting to Neon API: ${err.message}`,
    };
  }
}

export async function runNeonMigrations(token?: string, customUrl?: string): Promise<{ success: boolean; message: string }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('mela_admin_server_token') : null);
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    const res = await fetch('/api/neon/migrate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ customUrl }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: `Migration request failed: ${err.message}` };
  }
}

export async function testCustomNeonConnection(connectionString: string): Promise<NeonStatus> {
  try {
    const res = await fetch('/api/neon/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionString }),
    });
    return await res.json();
  } catch (err: any) {
    return {
      connected: false,
      provider: 'in-memory-fallback',
      databaseUrlConfigured: false,
      pooled: false,
      message: `Connection test error: ${err.message}`,
    };
  }
}
