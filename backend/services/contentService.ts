import { getSupabaseAdmin } from '../config/supabase.ts';
import { getEnvConfig, getSupabaseSetupStatus } from '../config/env.ts';
import { insertLocalContactMessage, insertLocalSubmission } from '../config/localSqlite.ts';
import { slugify, stripHtmlTags } from '../middleware/security.ts';

export async function fetchPublishedList(
  table: string,
  orderBy: string,
  ascending = true,
  limit?: number,
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  let query = supabase
    .from(table)
    .select('*')
    .eq('is_published', true)
    .order(orderBy, { ascending });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error(`[Supabase] Error reading ${table}:`, error.message);
    return [];
  }
  return data || [];
}

export async function fetchPublishedCommunityItems() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  // Strict public projection — NEVER expose submitter_email or admin_notes
  const { data, error } = await supabase
    .from('student_submissions')
    .select(
      'id, submission_type, title, description, category, submitter_name, department_or_year, external_link, tech_stack, needed_roles, created_at',
    )
    .eq('status', 'approved')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Error reading community items:', error.message);
    return [];
  }
  return data || [];
}

export async function fetchSiteContentMap() {
  const defaults: Record<string, Record<string, unknown>> = {
    about_bit: {
      college_name: 'Bearys Institute of Technology',
      location: 'Mangalore, Karnataka',
      introduction:
        'Bearys Institute of Technology (BIT), Mangalore is an engineering institution situated amid lush green hills near the Netravati backwaters. CORESPACE serves as its student-led digital hub uniting engineering curiosity, sustainable thinking, and technical collaboration.',
      official_website: 'https://www.bitmangalore.edu.in/',
    },
    social_links: {
      github: '',
      linkedin: '',
      instagram: '',
      youtube: '',
      email: '',
    },
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) return defaults;

  const { data, error } = await supabase.from('site_content').select('key, value');
  if (error || !data) return defaults;

  const merged = { ...defaults };
  for (const row of data) {
    if (row.key && row.value && typeof row.value === 'object') {
      merged[row.key] = { ...(defaults[row.key] || {}), ...(row.value as Record<string, unknown>) };
    }
  }
  return merged;
}

export async function fetchGlobalSearch(q: string) {
  const supabase = getSupabaseAdmin();
  const cleanQ = q.trim();
  if (!supabase || !cleanQ) {
    return {
      events: [],
      hackathons: [],
      opportunities: [],
      projects: [],
      resources: [],
      blogs: [],
    };
  }

  const pattern = `%${cleanQ.replace(/[%_]/g, '')}%`;

  const [eventsRes, hackathonsRes, oppsRes, projectsRes, resourcesRes, blogsRes] = await Promise.all([
    supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .or(`title.ilike.${pattern},description.ilike.${pattern},category.ilike.${pattern}`)
      .limit(12),
    supabase
      .from('hackathons')
      .select('*')
      .eq('is_published', true)
      .or(`name.ilike.${pattern},description.ilike.${pattern},organizer.ilike.${pattern}`)
      .limit(12),
    supabase
      .from('opportunities')
      .select('*')
      .eq('is_published', true)
      .or(`title.ilike.${pattern},description.ilike.${pattern},organization.ilike.${pattern},category.ilike.${pattern}`)
      .limit(12),
    supabase
      .from('projects')
      .select('*')
      .eq('is_published', true)
      .or(`title.ilike.${pattern},description.ilike.${pattern},category.ilike.${pattern},student_or_team_name.ilike.${pattern}`)
      .limit(12),
    supabase
      .from('resources')
      .select('*')
      .eq('is_published', true)
      .or(`title.ilike.${pattern},description.ilike.${pattern},category.ilike.${pattern}`)
      .limit(12),
    supabase
      .from('blogs')
      .select('*')
      .eq('is_published', true)
      .or(`title.ilike.${pattern},excerpt.ilike.${pattern},category_name.ilike.${pattern},author_name.ilike.${pattern}`)
      .limit(12),
  ]);

  return {
    events: eventsRes.data || [],
    hackathons: hackathonsRes.data || [],
    opportunities: oppsRes.data || [],
    projects: projectsRes.data || [],
    resources: resourcesRes.data || [],
    blogs: blogsRes.data || [],
  };
}

export async function createStudentSubmission(input: {
  submission_type: string;
  title: string;
  description: string;
  category?: string;
  submitter_name: string;
  submitter_email: string;
  department_or_year?: string;
  external_link?: string;
  tech_stack?: string[];
  needed_roles?: string;
}) {
  const sanitized = {
    submission_type: input.submission_type,
    title: stripHtmlTags(input.title),
    description: stripHtmlTags(input.description),
    category: stripHtmlTags(input.category || ''),
    submitter_name: stripHtmlTags(input.submitter_name),
    submitter_email: input.submitter_email.trim().toLowerCase(),
    department_or_year: stripHtmlTags(input.department_or_year || ''),
    external_link: (input.external_link || '').trim(),
    tech_stack: (input.tech_stack || []).map(stripHtmlTags).filter(Boolean),
    needed_roles: stripHtmlTags(input.needed_roles || ''),
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const localResult = insertLocalSubmission(sanitized);
    return {
      storedIn: 'local_pending_queue',
      id: localResult.id,
      status: localResult.status,
      message:
        'Your submission has been recorded in pending review status. Configure Supabase environment variables to sync submissions with the cloud Admin queue.',
    };
  }

  const { data, error } = await supabase
    .from('student_submissions')
    .insert({
      ...sanitized,
      status: 'pending',
      is_published: false,
    })
    .select('id, status, created_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    storedIn: 'supabase',
    id: data.id,
    status: data.status,
    message: 'Submission received and placed in pending Admin review.',
  };
}

export async function createContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const sanitized = {
    name: stripHtmlTags(input.name),
    email: input.email.trim().toLowerCase(),
    subject: stripHtmlTags(input.subject),
    message: stripHtmlTags(input.message),
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const localResult = insertLocalContactMessage(sanitized);
    return {
      storedIn: 'local_inbox',
      id: localResult.id,
      message:
        'Your message has been saved securely. Configure Supabase credentials to view incoming messages in the Admin inbox.',
    };
  }

  const { data, error } = await supabase
    .from('contact_messages')
    .insert({
      ...sanitized,
      status: 'unread',
    })
    .select('id, created_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    storedIn: 'supabase',
    id: data.id,
    message: 'Thank you for reaching out. Your message has been sent to the CORESPACE team.',
  };
}

export function prepareSlug(title: string, providedSlug?: string): string {
  const base = slugify(providedSlug || title) || 'entry';
  const suffix = Math.random().toString(36).slice(2, 6);
  return providedSlug ? slugify(providedSlug) : `${base}-${suffix}`;
}

export function getPublicSystemMeta() {
  const status = getSupabaseSetupStatus();
  const cfg = getEnvConfig();
  return {
    databaseConfigured: status.databaseConnected,
    storageBucket: cfg.supabaseStorageBucket,
  };
}
