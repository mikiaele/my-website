import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Keys stored in localStorage or env vars
const STORAGE_KEY_URL = 'mela_supabase_url';
const STORAGE_KEY_ANON = 'mela_supabase_anon_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  isCustomConfigured: boolean;
  lastCheckedAt?: string;
  error?: string | null;
}

// Retrieve initial credentials from environment or localStorage
export function getSavedSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) || '' : '';

  return {
    url: localUrl || envUrl,
    anonKey: localKey || envKey,
  };
}

let activeSupabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (activeSupabaseClient) {
    return activeSupabaseClient;
  }

  const { url, anonKey } = getSavedSupabaseConfig();

  if (url && anonKey && url.startsWith('http')) {
    try {
      activeSupabaseClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return activeSupabaseClient;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return null;
}

export async function saveSupabaseConfig(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  if (!cleanUrl || !cleanKey) {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
    activeSupabaseClient = null;
    return { success: true, message: 'Supabase credentials cleared. Using local persistent storage.' };
  }

  try {
    const testClient = createClient(cleanUrl, cleanKey);
    // Lightweight probe: ping the categories table
    const { error } = await testClient.from('categories').select('id').limit(1);

    if (error && error.code !== 'PGRST116' && !error.message.includes('relation') && !error.message.includes('permission')) {
      // If network failure or invalid API key
      if (error.message.includes('Failed to fetch') || error.message.includes('Invalid API key')) {
        return { success: false, message: `Connection failed: ${error.message}` };
      }
    }

    localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
    localStorage.setItem(STORAGE_KEY_ANON, cleanKey);
    activeSupabaseClient = testClient;

    return {
      success: true,
      message: 'Successfully connected to your Supabase project! Live sync is now active.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Unable to connect to Supabase endpoint',
    };
  }
}

export async function testConnection(): Promise<{ ok: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      ok: false,
      message: 'No active Supabase credentials configured. Running in high-performance local persistent engine.',
    };
  }

  try {
    const { data, error } = await client.from('categories').select('count').limit(1);
    if (error) {
      // If table doesn't exist yet, user just needs to run the SQL migration
      if (error.message.includes('relation "public.categories" does not exist') || error.code === '42P01') {
        return {
          ok: true,
          message: 'Connected to Supabase! Tables have not been created yet. Please run the SQL schema in your Supabase SQL Editor.',
        };
      }
      return { ok: false, message: error.message };
    }
    return { ok: true, message: 'Connected to Supabase database successfully!' };
  } catch (err: any) {
    return { ok: false, message: err.message || 'Connection test failed' };
  }
}

/**
 * Uploads a binary image file to Supabase Storage.
 * Falls back to high-fidelity Data URL if Supabase bucket isn't configured or permissions are pending.
 */
export async function uploadImageToSupabaseStorage(
  file: File,
  bucket = 'products'
): Promise<{ url: string | null; error: string | null }> {
  const client = getSupabaseClient();

  // If Supabase is connected, attempt direct bucket upload
  if (client) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `uploads/${cleanFileName}`;

      const { data, error } = await client.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (!error && data) {
        const { data: publicUrlData } = client.storage.from(bucket).getPublicUrl(filePath);
        if (publicUrlData?.publicUrl) {
          return { url: publicUrlData.publicUrl, error: null };
        }
      } else if (error) {
        console.warn(`Supabase Storage upload warning (${error.message}). Falling back to local data URL.`, error);
      }
    } catch (storageErr: any) {
      console.warn('Supabase storage exception, using fallback:', storageErr);
    }
  }

  // Graceful high-fidelity local conversion for immediate viewing and local persistence
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({ url: reader.result as string, error: null });
    };
    reader.onerror = () => {
      resolve({ url: null, error: 'Failed to read image file' });
    };
    reader.readAsDataURL(file);
  });
}

