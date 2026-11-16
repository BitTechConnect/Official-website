import type { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { getEnvConfig } from '../config/env.ts';
import { getSupabaseAdmin } from '../config/supabase.ts';

export const ADMIN_COOKIE_NAME = 'btc_admin_token';

export const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again shortly.' },
});

export const formSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Submission rate limit reached. Please wait a few minutes before submitting again.' },
});

export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait 15 minutes and try again.' },
});

export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>?/gm, '').trim();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function checkSpamHeuristics(honeypot?: string, formLoadedAt?: number): string | null {
  if (honeypot && honeypot.trim().length > 0) {
    return 'Submission rejected by spam protection.';
  }
  if (typeof formLoadedAt === 'number' && Number.isFinite(formLoadedAt)) {
    const elapsedMs = Date.now() - formLoadedAt;
    if (elapsedMs < 1500) {
      return 'Submission sent too quickly. Please review your entry and try again.';
    }
  }
  return null;
}

export interface AuthenticatedAdminRequest extends Request {
  adminUser?: {
    id: string;
    email: string;
  };
}

export async function verifySingleAdminToken(token: string): Promise<{ id: string; email: string } | null> {
  const cfg = getEnvConfig();
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin || !cfg.adminEmail || !token) {
    return null;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user?.email) {
    return null;
  }

  const userEmail = data.user.email.toLowerCase();
  if (userEmail !== cfg.adminEmail) {
    return null;
  }

  // Also check admin_config table if present
  const { data: adminConfigRow, error: cfgErr } = await supabaseAdmin
    .from('admin_config')
    .select('admin_email')
    .eq('id', 1)
    .maybeSingle();

  if (!cfgErr && adminConfigRow?.admin_email) {
    if (String(adminConfigRow.admin_email).toLowerCase() !== userEmail) {
      return null;
    }
  }

  return { id: data.user.id, email: userEmail };
}

export async function requireSingleAdmin(
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const cfg = getEnvConfig();
    if (!cfg.supabaseUrl || !cfg.supabaseServiceRoleKey || !cfg.adminEmail) {
      res.status(503).json({
        error: 'Admin authentication is not configured. Please set SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, and ADMIN_EMAIL.',
      });
      return;
    }

    const cookieToken = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
    const token = cookieToken || bearerToken;

    if (!token) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const adminUser = await verifySingleAdminToken(token);
    if (!adminUser) {
      res.status(403).json({ error: 'Forbidden: Only the single authorized Admin account may access this endpoint.' });
      return;
    }

    req.adminUser = adminUser;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired admin session.' });
  }
}
