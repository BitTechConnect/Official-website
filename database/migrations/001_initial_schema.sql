-- ============================================================================
-- BIT TECH CONNECT — PostgreSQL / Supabase Initial Schema & RLS Policies
-- Bearys Institute of Technology, Mangalore, Karnataka, India
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Single Authorized Admin Configuration
CREATE TABLE IF NOT EXISTS public.admin_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  admin_email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT 'BIT Tech Connect Admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helper function to check if the current JWT belongs to the single Admin
CREATE OR REPLACE FUNCTION public.is_single_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_config
    WHERE id = 1
      AND LOWER(admin_email) = LOWER(COALESCE(auth.jwt() ->> 'email', ''))
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT DEFAULT '',
  link_url TEXT DEFAULT '',
  link_label TEXT DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  event_date DATE NOT NULL,
  event_time TEXT DEFAULT '',
  venue_or_mode TEXT NOT NULL,
  registration_link TEXT DEFAULT '',
  organizer TEXT NOT NULL DEFAULT 'BIT Tech Connect',
  category TEXT NOT NULL CHECK (category IN (
    'Technical Workshop', 'Seminar', 'Webinar',
    'Coding Competition', 'Technical Fest', 'Community Activity'
  )),
  registration_deadline DATE,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Hackathons
CREATE TABLE IF NOT EXISTS public.hackathons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organizer TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  registration_deadline DATE,
  eligibility TEXT NOT NULL DEFAULT 'Engineering Students',
  team_size TEXT NOT NULL DEFAULT '1 - 4 Members',
  prize_details TEXT DEFAULT '',
  mode TEXT NOT NULL DEFAULT 'online' CHECK (mode IN ('online', 'offline', 'hybrid')),
  scope TEXT NOT NULL DEFAULT 'national' CHECK (scope IN ('national', 'international', 'regional')),
  participation_type TEXT NOT NULL DEFAULT 'team' CHECK (participation_type IN ('team', 'individual', 'both')),
  official_registration_url TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'unverified')),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Opportunities
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  organization TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  deadline DATE,
  application_link TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'Internships', 'Technical Competitions', 'Workshops', 'Scholarships',
    'Research Opportunities', 'Open-Source Programs', 'Student Programs',
    'Conferences', 'Career Opportunities'
  )),
  paid_status TEXT NOT NULL DEFAULT 'unknown' CHECK (paid_status IN ('paid', 'free', 'stipend', 'unpaid', 'unknown')),
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'unverified')),
  official_source TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Student Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  category TEXT NOT NULL,
  student_or_team_name TEXT NOT NULL,
  github_link TEXT DEFAULT '',
  live_demo_link TEXT DEFAULT '',
  project_status TEXT NOT NULL DEFAULT 'completed' CHECK (project_status IN ('prototype', 'in_progress', 'completed', 'open_source')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Technical Resources
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'C Programming', 'C++', 'Java', 'Python', 'Web Development',
    'Artificial Intelligence', 'Machine Learning', 'Cybersecurity',
    'Cloud Computing', 'Git and GitHub',
    'Data Structures and Algorithms', 'Interview Preparation'
  )),
  resource_type TEXT NOT NULL CHECK (resource_type IN (
    'Learning Roadmap', 'Free Resource', 'Tutorial', 'Documentation',
    'Study Material', 'Video Resource', 'Beginner Guide'
  )),
  external_url TEXT NOT NULL,
  provider TEXT DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'all')),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Blog Categories & Blogs
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  cover_image_url TEXT DEFAULT '',
  author_name TEXT NOT NULL,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  reading_time_minutes INTEGER NOT NULL DEFAULT 5 CHECK (reading_time_minutes > 0),
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Team Members
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  group_type TEXT NOT NULL DEFAULT 'core' CHECK (group_type IN ('core', 'volunteer', 'contributor')),
  bio TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  website_url TEXT DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Student Submissions (No account required; pending Admin review)
CREATE TABLE IF NOT EXISTS public.student_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_type TEXT NOT NULL CHECK (submission_type IN (
    'project', 'collaboration', 'event_suggestion', 'blog_contribution', 'community_idea'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT '',
  submitter_name TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  department_or_year TEXT DEFAULT '',
  external_link TEXT DEFAULT '',
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  needed_roles TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Contact Messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Media Metadata
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  alt_text TEXT DEFAULT '',
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Editable Website Content
CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_events_published_date ON public.events (is_published, event_date);
CREATE INDEX IF NOT EXISTS idx_hackathons_published_deadline ON public.hackathons (is_published, registration_deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_published_cat ON public.opportunities (is_published, category);
CREATE INDEX IF NOT EXISTS idx_projects_published_featured ON public.projects (is_published, is_featured);
CREATE INDEX IF NOT EXISTS idx_resources_published_cat ON public.resources (is_published, category);
CREATE INDEX IF NOT EXISTS idx_blogs_published_date ON public.blogs (is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.student_submissions (status, is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_status ON public.contact_messages (status, created_at DESC);

-- ============================================================================
-- Updated-at Triggers
-- ============================================================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'admin_config', 'announcements', 'events', 'hackathons', 'opportunities',
    'projects', 'resources', 'blogs', 'team_members', 'student_submissions', 'site_content'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I;', tbl, tbl);
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', tbl, tbl);
  END LOOP;
END $$;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Public read policies (strictly published items only)
CREATE POLICY "Public read published announcements" ON public.announcements FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public read published events" ON public.events FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public read published hackathons" ON public.hackathons FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public read published opportunities" ON public.opportunities FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public read published projects" ON public.projects FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public read published resources" ON public.resources FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public read blog categories" ON public.blog_categories FOR SELECT USING (TRUE);
CREATE POLICY "Public read published blogs" ON public.blogs FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public read published team" ON public.team_members FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public read site content" ON public.site_content FOR SELECT USING (TRUE);
CREATE POLICY "Public read media metadata" ON public.media_assets FOR SELECT USING (TRUE);

-- Admin full access policies (restricted strictly to the single admin in admin_config)
CREATE POLICY "Admin read admin_config" ON public.admin_config FOR ALL USING (public.is_single_admin()) WITH CHECK (public.is_single_admin());
CREATE POLICY "Admin manage announcements" ON public.announcements FOR ALL USING (public.is_single_admin()) WITH CHECK (public.is_single_admin());
CREATE POLICY "Admin manage events" ON public.events FOR ALL USING (public.is_single_admin()) WITH CHECK (public.is_single_admin());
CREATE POLICY "Admin manage hackathons" ON public.hackathons FOR ALL USING (public.is_single_admin()) WITH CHECK (public.is_single_admin());
CREATE POLICY "Admin manage opportunities" ON public.opportunities FOR ALL USING (public.is_single_admin()) WITH CHECK (public.is_single_admin());
CREATE POLICY "Admin manage projects" ON public.projects FOR ALL USING (public.is_single_admin()) WITH CHECK (public.is_single_admin());
CREATE POLICY "Admin manage resources" ON public.resources FOR ALL USING (public.is_single_admin()) WITH CHECK (public.is_single_admin());
CREATE POLICY "Admin manage blog_categories" ON public.blog_categories FOR ALL USING (public.is_single_admin()) WITH CHECK (public.is_single_admin());
CREATE POLICY "Admin manage blogs" ON public.blogs FOR ALL USING (public.is_single_admin()) WITH CHECK (public.is_single_admin());
CREATE POLICY "Admin manage team_members" ON public.team_members FOR ALL USING (public.is_single_admin()) WITH CHECK (public.is_single_admin());
CREATE POLICY "Admin manage submissions" ON public.student_submissions FOR ALL USING (public.is_single_admin()) WITH CHECK (public.is_single_admin());
CREATE POLICY "Admin manage contact_messages" ON public.contact_messages FOR ALL USING (public.is_single_admin()) WITH CHECK (public.is_single_admin());
CREATE POLICY "Admin manage media_assets" ON public.media_assets FOR ALL USING (public.is_single_admin()) WITH CHECK (public.is_single_admin());
CREATE POLICY "Admin manage site_content" ON public.site_content FOR ALL USING (public.is_single_admin()) WITH CHECK (public.is_single_admin());

-- Note: student_submissions and contact_messages are NEVER readable directly via anon key;
-- Inserts go through the validated Express API with rate limiting and spam protection,
-- and public community items are served via server projection omitting submitter_email.
