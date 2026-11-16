import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getEnvConfig } from './env.ts';

let cachedAdminClient: SupabaseClient | null = null;
let cachedAnonClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const cfg = getEnvConfig();
  if (!cfg.supabaseUrl || !cfg.supabaseServiceRoleKey) {
    return null;
  }
  if (!cachedAdminClient) {
    cachedAdminClient = createClient(cfg.supabaseUrl, cfg.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return cachedAdminClient;
}

export function getSupabaseAnon(): SupabaseClient | null {
  const cfg = getEnvConfig();
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
    return null;
  }
  if (!cachedAnonClient) {
    cachedAnonClient = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return cachedAnonClient;
}
