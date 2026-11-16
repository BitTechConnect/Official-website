import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  port: number;
  appUrl: string;
  allowedOrigins: string[];
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  supabaseStorageBucket: string;
  adminEmail: string;
  sessionSecret: string;
  isProduction: boolean;
}

export function getEnvConfig(): AppConfig {
  const port = Number(process.env.PORT || 3000);
  const appUrl = (process.env.APP_URL || `http://localhost:${port}`).trim();
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || appUrl)
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return {
    port,
    appUrl,
    allowedOrigins,
    supabaseUrl: (process.env.SUPABASE_URL || '').trim(),
    supabaseAnonKey: (process.env.SUPABASE_ANON_KEY || '').trim(),
    supabaseServiceRoleKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
    supabaseStorageBucket: (process.env.SUPABASE_STORAGE_BUCKET || 'bit-tech-media').trim(),
    adminEmail: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
    sessionSecret: (process.env.SESSION_SECRET || '').trim(),
    isProduction: process.env.NODE_ENV === 'production',
  };
}

export function getSupabaseSetupStatus() {
  const cfg = getEnvConfig();
  const missingVars: string[] = [];
  if (!cfg.supabaseUrl) missingVars.push('SUPABASE_URL');
  if (!cfg.supabaseAnonKey) missingVars.push('SUPABASE_ANON_KEY');
  if (!cfg.supabaseServiceRoleKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!cfg.adminEmail) missingVars.push('ADMIN_EMAIL');

  return {
    supabaseConfigured: missingVars.length === 0,
    databaseConnected: Boolean(cfg.supabaseUrl && cfg.supabaseServiceRoleKey),
    authConfigured: missingVars.length === 0,
    storageConfigured: Boolean(cfg.supabaseUrl && cfg.supabaseServiceRoleKey && cfg.supabaseStorageBucket),
    missingVars,
  };
}
