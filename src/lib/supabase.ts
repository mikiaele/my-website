import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get configuration from env or local persistence
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('mela_supabase_url') || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('mela_supabase_anon_key') || '' : '';

  const url = localUrl || envUrl;
  const anonKey = localKey || envKey;

  const isConfigured = Boolean(url && anonKey && url.startsWith('http') && anonKey.length > 10);

  return {
    url,
    anonKey,
    isConfigured,
  };
};

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export const getSupabase = (): SupabaseClient | null => {
  const { url, anonKey, isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return null;
  }

  if (cachedClient && lastUsedUrl === url && lastUsedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastUsedUrl = url;
    lastUsedKey = anonKey;
    return cachedClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
};

export const saveSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mela_supabase_url', url.trim());
    localStorage.setItem('mela_supabase_anon_key', key.trim());
    cachedClient = null; // force re-creation
  }
};

export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      message: 'Supabase URL or Anon Key is missing. Please provide valid credentials.',
    };
  }

  try {
    // Attempt a lightweight check on public.categories or public.products
    const { error } = await client.from('categories').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return {
        success: false,
        message: `Connection error: ${error.message}`,
      };
    }
    return {
      success: true,
      message: 'Connected successfully to your Supabase PostgreSQL database!',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Failed to connect: ${errorMsg}`,
    };
  }
};
