import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseUrl;
if (rawSupabaseUrl) {
  try {
    supabaseUrl = new URL(rawSupabaseUrl).origin;
  } catch (e) {
    supabaseUrl = rawSupabaseUrl.replace(/\/+$/g, '');
  }
}

export const supabase = rawSupabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = Boolean(supabase);
