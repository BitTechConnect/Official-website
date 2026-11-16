import { Router } from 'express';
import {
  createContactMessage,
  createStudentSubmission,
  fetchGlobalSearch,
  fetchPublishedCommunityItems,
  fetchPublishedList,
  fetchSiteContentMap,
} from '../services/contentService.ts';
import { getSupabaseAdmin } from '../config/supabase.ts';
import { contactMessageSchema, studentSubmissionSchema } from '../validators/schemas.ts';
import { checkSpamHeuristics, formSubmissionLimiter } from '../middleware/security.ts';

export const publicRouter = Router();

publicRouter.get('/overview', async (_req, res) => {
  try {
    const [
      announcements,
      events,
      hackathons,
      opportunities,
      projects,
      resources,
      blogs,
      community,
      siteContent,
    ] = await Promise.all([
      fetchPublishedList('announcements', 'created_at', false, 5),
      fetchPublishedList('events', 'event_date', true, 4),
      fetchPublishedList('hackathons', 'start_date', true, 4),
      fetchPublishedList('opportunities', 'created_at', false, 4),
      fetchPublishedList('projects', 'created_at', false, 4),
      fetchPublishedList('resources', 'created_at', false, 6),
      fetchPublishedList('blogs', 'published_at', false, 3),
      fetchPublishedCommunityItems(),
      fetchSiteContentMap(),
    ]);

    res.json({
      announcements,
      events,
      hackathons,
      opportunities,
      projects,
      resources,
      blogs,
      community: community.slice(0, 4),
      siteContent,
    });
  } catch (err) {
    console.error('[Overview] error:', err);
    res.status(500).json({ error: 'Unable to load community overview.' });
  }
});

publicRouter.get('/announcements', async (_req, res) => {
  const data = await fetchPublishedList('announcements', 'created_at', false);
  res.json({ items: data });
});

publicRouter.get('/events', async (_req, res) => {
  const data = await fetchPublishedList('events', 'event_date', true);
  res.json({ items: data });
});

publicRouter.get('/events/:slug', async (req, res) => {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    res.status(404).json({ error: 'Event not found.' });
    return;
  }
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', req.params.slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !data) {
    res.status(404).json({ error: 'Event not found.' });
    return;
  }
  res.json({ item: data });
});

publicRouter.get('/hackathons', async (_req, res) => {
  const data = await fetchPublishedList('hackathons', 'registration_deadline', true);
  res.json({ items: data });
});

publicRouter.get('/opportunities', async (_req, res) => {
  const data = await fetchPublishedList('opportunities', 'created_at', false);
  res.json({ items: data });
});

publicRouter.get('/projects', async (_req, res) => {
  const data = await fetchPublishedList('projects', 'created_at', false);
  res.json({ items: data });
});

publicRouter.get('/resources', async (_req, res) => {
  const data = await fetchPublishedList('resources', 'category', true);
  res.json({ items: data });
});

publicRouter.get('/blogs', async (_req, res) => {
  const data = await fetchPublishedList('blogs', 'published_at', false);
  res.json({ items: data });
});

publicRouter.get('/blogs/:slug', async (req, res) => {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    res.status(404).json({ error: 'Article not found.' });
    return;
  }
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', req.params.slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !data) {
    res.status(404).json({ error: 'Article not found.' });
    return;
  }
  res.json({ item: data });
});

publicRouter.get('/team', async (_req, res) => {
  const data = await fetchPublishedList('team_members', 'display_order', true);
  res.json({ items: data });
});

publicRouter.get('/community', async (_req, res) => {
  const data = await fetchPublishedCommunityItems();
  res.json({ items: data });
});

publicRouter.get('/site-content', async (_req, res) => {
  const siteContent = await fetchSiteContentMap();
  res.json({ siteContent });
});

publicRouter.get('/search', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  if (!q.trim()) {
    res.json({
      query: '',
      results: {
        events: [],
        hackathons: [],
        opportunities: [],
        projects: [],
        resources: [],
        blogs: [],
      },
    });
    return;
  }
  const results = await fetchGlobalSearch(q);
  res.json({ query: q.trim(), results });
});

publicRouter.post('/submissions', formSubmissionLimiter, async (req, res) => {
  try {
    const parsed = studentSubmissionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid submission fields.',
        issues: parsed.error.issues,
      });
      return;
    }

    const spamReason = checkSpamHeuristics(parsed.data.honeypot, parsed.data.formLoadedAt);
    if (spamReason) {
      res.status(400).json({ error: spamReason });
      return;
    }

    const result = await createStudentSubmission(parsed.data);
    res.status(201).json(result);
  } catch (err) {
    console.error('[Submission] error:', err);
    res.status(500).json({ error: 'Failed to submit entry. Please try again later.' });
  }
});

publicRouter.post('/contact', formSubmissionLimiter, async (req, res) => {
  try {
    const parsed = contactMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Please complete all required fields.',
        issues: parsed.error.issues,
      });
      return;
    }

    const spamReason = checkSpamHeuristics(parsed.data.honeypot, parsed.data.formLoadedAt);
    if (spamReason) {
      res.status(400).json({ error: spamReason });
      return;
    }

    const result = await createContactMessage(parsed.data);
    res.status(201).json(result);
  } catch (err) {
    console.error('[Contact] error:', err);
    res.status(500).json({ error: 'Unable to deliver your message right now.' });
  }
});
