import { Router } from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import { getEnvConfig, getSupabaseSetupStatus } from '../config/env.ts';
import { getSupabaseAdmin, getSupabaseAnon } from '../config/supabase.ts';
import {
  ADMIN_COOKIE_NAME,
  adminLoginLimiter,
  requireSingleAdmin,
  stripHtmlTags,
  verifySingleAdminToken,
  type AuthenticatedAdminRequest,
} from '../middleware/security.ts';
import {
  adminLoginSchema,
  announcementSchema,
  blogSchema,
  eventSchema,
  hackathonSchema,
  opportunitySchema,
  projectSchema,
  resourceSchema,
  siteContentSchema,
  submissionReviewSchema,
  teamMemberSchema,
} from '../validators/schemas.ts';
import { prepareSlug } from '../services/contentService.ts';

export const adminRouter = Router();

const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
      cb(new Error('Only JPEG, PNG, WebP, and AVIF images up to 5MB are allowed.'));
      return;
    }
    cb(null, true);
  },
});

adminRouter.get('/status', (_req, res) => {
  const status = getSupabaseSetupStatus();
  res.json(status);
});

adminRouter.get('/session', async (req, res) => {
  const status = getSupabaseSetupStatus();
  if (!status.authConfigured) {
    res.json({ authenticated: false, configured: false, missingVars: status.missingVars });
    return;
  }

  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  if (!token) {
    res.json({ authenticated: false, configured: true });
    return;
  }

  const adminUser = await verifySingleAdminToken(token);
  if (!adminUser) {
    res.clearCookie(ADMIN_COOKIE_NAME, { path: '/' });
    res.json({ authenticated: false, configured: true });
    return;
  }

  res.json({
    authenticated: true,
    configured: true,
    admin: { email: adminUser.email },
  });
});

adminRouter.post('/login', adminLoginLimiter, async (req, res) => {
  try {
    const status = getSupabaseSetupStatus();
    if (!status.authConfigured) {
      res.status(503).json({
        error: 'Supabase Auth and ADMIN_EMAIL are not configured on the server.',
        missingVars: status.missingVars,
      });
      return;
    }

    const parsed = adminLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Valid admin email and password are required.' });
      return;
    }

    const cfg = getEnvConfig();
    const submittedEmail = parsed.data.email.trim().toLowerCase();
    if (submittedEmail !== cfg.adminEmail) {
      res.status(403).json({ error: 'Access denied. Unauthorized account.' });
      return;
    }

    const supabaseAnon = getSupabaseAnon();
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAnon || !supabaseAdmin) {
      res.status(503).json({ error: 'Supabase client could not be initialized.' });
      return;
    }

    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email: submittedEmail,
      password: parsed.data.password,
    });

    console.log('[ADMIN DEBUG]', {
    errorMessage: error?.message,
    errorStatus: error?.status,
    hasSession: !!data.session,
    hasUser: !!data.user,
    });

    if (error || !data.session?.access_token || !data.user?.email) {
      res.status(401).json({ error: 'Invalid admin credentials.' });
      return;
    }

    // Ensure admin_config single row stays synced
    await supabaseAdmin
      .from('admin_config')
      .upsert({ id: 1, admin_email: cfg.adminEmail, display_name: 'CORESPACE Admin' });

    res.cookie(ADMIN_COOKIE_NAME, data.session.access_token, {
      httpOnly: true,
      secure: cfg.isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000 * 12,
      path: '/',
    });

    res.json({
      authenticated: true,
      admin: { email: data.user.email.toLowerCase() },
    });
  } catch (err) {
    console.error('[Admin Login] error:', err);
    res.status(500).json({ error: 'Authentication error.' });
  }
});

adminRouter.post('/logout', (_req, res) => {
  res.clearCookie(ADMIN_COOKIE_NAME, { path: '/' });
  res.json({ authenticated: false });
});

// All routes below require strict Single Admin authorization
adminRouter.use(requireSingleAdmin);

adminRouter.get('/dashboard', async (_req: AuthenticatedAdminRequest, res) => {
  const supabase = getSupabaseAdmin()!;
  const [
    events,
    hackathons,
    opportunities,
    projects,
    resources,
    blogs,
    team,
    announcements,
    pendingSubmissions,
    unreadMessages,
  ] = await Promise.all([
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase.from('hackathons').select('id', { count: 'exact', head: true }),
    supabase.from('opportunities').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('resources').select('id', { count: 'exact', head: true }),
    supabase.from('blogs').select('id', { count: 'exact', head: true }),
    supabase.from('team_members').select('id', { count: 'exact', head: true }),
    supabase.from('announcements').select('id', { count: 'exact', head: true }),
    supabase.from('student_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'unread'),
  ]);

  res.json({
    counts: {
      events: events.count ?? 0,
      hackathons: hackathons.count ?? 0,
      opportunities: opportunities.count ?? 0,
      projects: projects.count ?? 0,
      resources: resources.count ?? 0,
      blogs: blogs.count ?? 0,
      team: team.count ?? 0,
      announcements: announcements.count ?? 0,
      pendingSubmissions: pendingSubmissions.count ?? 0,
      unreadMessages: unreadMessages.count ?? 0,
    },
  });
});

// Generic CRUD factory for standard content tables
function registerCrudRoutes(
  pathName: string,
  table: string,
  schema: { safeParse: (v: unknown) => { success: boolean; data?: Record<string, unknown>; error?: { issues: { message: string }[] } } },
  orderBy: string,
  ascending = false,
  transformInsert?: (data: Record<string, unknown>) => Record<string, unknown>,
) {
  adminRouter.get(`/${pathName}`, async (_req, res) => {
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending });
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ items: data || [] });
  });

  adminRouter.post(`/${pathName}`, async (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success || !parsed.data) {
      res.status(400).json({ error: parsed.error?.issues[0]?.message || 'Invalid input.' });
      return;
    }
    const payload = transformInsert ? transformInsert(parsed.data) : parsed.data;
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase.from(table).insert(payload).select('*').single();
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(201).json({ item: data });
  });

  adminRouter.put(`/${pathName}/:id`, async (req, res) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success || !parsed.data) {
      res.status(400).json({ error: parsed.error?.issues[0]?.message || 'Invalid input.' });
      return;
    }
    const payload = transformInsert ? transformInsert(parsed.data) : parsed.data;
    const supabase = getSupabaseAdmin()!;
    const { data, error } = await supabase
      .from(table)
      .update(payload)
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.json({ item: data });
  });

  adminRouter.patch(`/${pathName}/:id/publish`, async (req, res) => {
    const is_published = Boolean(req.body?.is_published);
    const supabase = getSupabaseAdmin()!;
    const updateData: Record<string, unknown> = { is_published };
    if (table === 'announcements' || table === 'blogs') {
      updateData.published_at = is_published ? new Date().toISOString() : null;
    }
    const { data, error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', req.params.id)
      .select('*')
      .single();
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.json({ item: data });
  });

  adminRouter.delete(`/${pathName}/:id`, async (req, res) => {
    const supabase = getSupabaseAdmin()!;
    const { error } = await supabase.from(table).delete().eq('id', req.params.id);
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.json({ deleted: true });
  });
}

registerCrudRoutes('announcements', 'announcements', announcementSchema as never, 'created_at', false, (d) => ({
  ...d,
  published_at: d.is_published ? new Date().toISOString() : null,
}));

registerCrudRoutes('events', 'events', eventSchema as never, 'event_date', true, (d) => ({
  ...d,
  slug: prepareSlug(String(d.title), d.slug ? String(d.slug) : undefined),
}));

registerCrudRoutes('hackathons', 'hackathons', hackathonSchema as never, 'start_date', true);
registerCrudRoutes('opportunities', 'opportunities', opportunitySchema as never, 'created_at', false);
registerCrudRoutes('projects', 'projects', projectSchema as never, 'created_at', false);
registerCrudRoutes('resources', 'resources', resourceSchema as never, 'created_at', false);

registerCrudRoutes('blogs', 'blogs', blogSchema as never, 'created_at', false, (d) => ({
  ...d,
  slug: prepareSlug(String(d.title), d.slug ? String(d.slug) : undefined),
  published_at: d.is_published ? (d.published_at || new Date().toISOString()) : null,
}));

registerCrudRoutes('team', 'team_members', teamMemberSchema as never, 'display_order', true);

// Student submissions review queue
adminRouter.get('/submissions', async (_req, res) => {
  const supabase = getSupabaseAdmin()!;
  const { data, error } = await supabase
    .from('student_submissions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ items: data || [] });
});

adminRouter.patch('/submissions/:id', async (req, res) => {
  const parsed = submissionReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid review input.' });
    return;
  }
  const supabase = getSupabaseAdmin()!;
  const { data, error } = await supabase
    .from('student_submissions')
    .update({
      status: parsed.data.status,
      is_published: parsed.data.status === 'approved' ? parsed.data.is_published : false,
      admin_notes: stripHtmlTags(parsed.data.admin_notes || ''),
    })
    .eq('id', req.params.id)
    .select('*')
    .single();
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json({ item: data });
});

adminRouter.delete('/submissions/:id', async (req, res) => {
  const supabase = getSupabaseAdmin()!;
  const { error } = await supabase.from('student_submissions').delete().eq('id', req.params.id);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json({ deleted: true });
});

// Contact messages inbox
adminRouter.get('/contact-messages', async (_req, res) => {
  const supabase = getSupabaseAdmin()!;
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ items: data || [] });
});

adminRouter.patch('/contact-messages/:id', async (req, res) => {
  const nextStatus = req.body?.status;
  if (!['unread', 'read', 'archived'].includes(nextStatus)) {
    res.status(400).json({ error: 'Invalid status.' });
    return;
  }
  const supabase = getSupabaseAdmin()!;
  const { data, error } = await supabase
    .from('contact_messages')
    .update({ status: nextStatus })
    .eq('id', req.params.id)
    .select('*')
    .single();
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json({ item: data });
});

adminRouter.delete('/contact-messages/:id', async (req, res) => {
  const supabase = getSupabaseAdmin()!;
  const { error } = await supabase.from('contact_messages').delete().eq('id', req.params.id);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json({ deleted: true });
});

// Site content settings
adminRouter.get('/site-content', async (_req, res) => {
  const supabase = getSupabaseAdmin()!;
  const { data, error } = await supabase.from('site_content').select('*');
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ items: data || [] });
});

adminRouter.put('/site-content', async (req, res) => {
  const parsed = siteContentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid site content payload.' });
    return;
  }
  const supabase = getSupabaseAdmin()!;
  const { data, error } = await supabase
    .from('site_content')
    .upsert({ key: parsed.data.key, value: parsed.data.value })
    .select('*')
    .single();
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json({ item: data });
});

// Media upload & management via Supabase Storage
adminRouter.get('/media', async (_req, res) => {
  const supabase = getSupabaseAdmin()!;
  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ items: data || [] });
});

adminRouter.post('/media', upload.single('file'), async (req: AuthenticatedAdminRequest, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Please select a valid image file to upload.' });
      return;
    }

    const cfg = getEnvConfig();
    const supabase = getSupabaseAdmin()!;
    const ext = req.file.originalname.split('.').pop()?.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'png';
    const safeName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const storagePath = `uploads/${safeName}`;

    // Ensure bucket exists if possible
    const { data: buckets } = await supabase.storage.listBuckets();
    if (buckets && !buckets.some((b) => b.name === cfg.supabaseStorageBucket)) {
      await supabase.storage.createBucket(cfg.supabaseStorageBucket, { public: true });
    }

    const { error: uploadErr } = await supabase.storage
      .from(cfg.supabaseStorageBucket)
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadErr) {
      res.status(500).json({ error: `Storage upload failed: ${uploadErr.message}` });
      return;
    }

    const { data: pubData } = supabase.storage
      .from(cfg.supabaseStorageBucket)
      .getPublicUrl(storagePath);

    const altText = stripHtmlTags(String(req.body?.alt_text || req.file.originalname));
    const { data: meta, error: metaErr } = await supabase
      .from('media_assets')
      .insert({
        file_name: stripHtmlTags(req.file.originalname),
        storage_path: storagePath,
        public_url: pubData.publicUrl,
        mime_type: req.file.mimetype,
        file_size: req.file.size,
        alt_text: altText,
        uploaded_by: req.adminUser?.email || cfg.adminEmail,
      })
      .select('*')
      .single();

    if (metaErr) {
      res.status(500).json({ error: metaErr.message });
      return;
    }

    res.status(201).json({ item: meta });
  } catch (err) {
    console.error('[Media Upload] error:', err);
    res.status(500).json({ error: 'Failed to process image upload.' });
  }
});

adminRouter.delete('/media/:id', async (req, res) => {
  const cfg = getEnvConfig();
  const supabase = getSupabaseAdmin()!;
  const { data: existing } = await supabase
    .from('media_assets')
    .select('storage_path')
    .eq('id', req.params.id)
    .maybeSingle();

  if (existing?.storage_path) {
    await supabase.storage.from(cfg.supabaseStorageBucket).remove([existing.storage_path]);
  }
  const { error } = await supabase.from('media_assets').delete().eq('id', req.params.id);
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json({ deleted: true });
});
