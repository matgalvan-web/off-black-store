import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!rawSupabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

// Normalize to origin (protocol + host) to avoid accidental path parts in the
// environment variable (e.g. someone set the URL with "/auth/v1" appended).
let supabaseUrl;
try {
  supabaseUrl = new URL(rawSupabaseUrl).origin;
} catch (e) {
  supabaseUrl = rawSupabaseUrl.replace(/\/+$/g, '');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
