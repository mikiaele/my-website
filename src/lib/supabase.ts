import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// The designated administrator email specified in requirements
export const DESIGNATED_ADMIN_EMAIL = 'mikiaelebrhane@gmail.com';

// Check if valid Supabase credentials have been configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('...')
);

// Create the Supabase client
// Note: We provide a safe dummy fallback if not yet set so the app does not throw unhandled init errors
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

/**
 * Helper to determine if an email belongs to the primary administrator
 */
export function isDesignatedAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === DESIGNATED_ADMIN_EMAIL.toLowerCase();
}
