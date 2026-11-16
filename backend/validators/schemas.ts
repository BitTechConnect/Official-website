import { z } from 'zod';

const safeUrlOptional = z
  .string()
  .trim()
  .max(500)
  .refine(
    (val) => !val || /^https?:\/\/.+/i.test(val) || val.startsWith('/'),
    'URL must start with http://, https://, or /',
  )
  .optional()
  .default('');

const safeUrlRequired = z
  .string()
  .trim()
  .min(8, 'Valid URL is required')
  .max(500)
  .refine((val) => /^https?:\/\/.+/i.test(val), 'URL must start with http:// or https://');

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().trim().email('Please provide a valid email address').max(180),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(3000),
  honeypot: z.string().max(0, 'Spam detected').optional().default(''),
  formLoadedAt: z.number().optional(),
});

export const studentSubmissionSchema = z.object({
  submission_type: z.enum([
    'project',
    'collaboration',
    'event_suggestion',
    'blog_contribution',
    'community_idea',
  ]),
  title: z.string().trim().min(4, 'Title must be at least 4 characters').max(180),
  description: z.string().trim().min(15, 'Description must be at least 15 characters').max(4000),
  category: z.string().trim().max(100).optional().default(''),
  submitter_name: z.string().trim().min(2, 'Your name is required').max(120),
  submitter_email: z.string().trim().email('Valid email is required').max(180),
  department_or_year: z.string().trim().max(120).optional().default(''),
  external_link: safeUrlOptional,
  tech_stack: z.array(z.string().trim().max(50)).max(15).optional().default([]),
  needed_roles: z.string().trim().max(300).optional().default(''),
  honeypot: z.string().max(0, 'Spam detected').optional().default(''),
  formLoadedAt: z.number().optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(200),
});

export const announcementSchema = z.object({
  title: z.string().trim().min(3).max(200),
  summary: z.string().trim().min(5).max(500),
  body: z.string().trim().max(5000).optional().default(''),
  link_url: safeUrlOptional,
  link_label: z.string().trim().max(80).optional().default(''),
  priority: z.enum(['normal', 'high', 'urgent']).default('normal'),
  is_published: z.boolean().default(false),
});

export const eventSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().min(10).max(8000),
  image_url: safeUrlOptional,
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  event_time: z.string().trim().max(80).optional().default(''),
  venue_or_mode: z.string().trim().min(2).max(240),
  registration_link: safeUrlOptional,
  organizer: z.string().trim().min(2).max(160),
  category: z.enum([
    'Technical Workshop',
    'Seminar',
    'Webinar',
    'Coding Competition',
    'Technical Fest',
    'Community Activity',
  ]),
  registration_deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming'),
  is_published: z.boolean().default(false),
});

export const hackathonSchema = z.object({
  name: z.string().trim().min(3).max(200),
  organizer: z.string().trim().min(2).max(180),
  description: z.string().trim().min(10).max(8000),
  image_url: safeUrlOptional,
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  registration_deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  eligibility: z.string().trim().min(2).max(240),
  team_size: z.string().trim().min(1).max(100),
  prize_details: z.string().trim().max(500).optional().default(''),
  mode: z.enum(['online', 'offline', 'hybrid']),
  scope: z.enum(['national', 'international', 'regional']),
  participation_type: z.enum(['team', 'individual', 'both']),
  official_registration_url: safeUrlRequired,
  verification_status: z.enum(['verified', 'unverified']).default('unverified'),
  is_published: z.boolean().default(false),
});

export const opportunitySchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(6000),
  organization: z.string().trim().min(2).max(180),
  eligibility: z.string().trim().min(2).max(240),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  application_link: safeUrlRequired,
  category: z.enum([
    'Internships',
    'Technical Competitions',
    'Workshops',
    'Scholarships',
    'Research Opportunities',
    'Open-Source Programs',
    'Student Programs',
    'Conferences',
    'Career Opportunities',
  ]),
  paid_status: z.enum(['paid', 'free', 'stipend', 'unpaid', 'unknown']).default('unknown'),
  verification_status: z.enum(['verified', 'unverified']).default('unverified'),
  official_source: z.string().trim().min(2).max(200),
  is_published: z.boolean().default(false),
});

export const projectSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(6000),
  image_url: safeUrlOptional,
  tech_stack: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  category: z.string().trim().min(2).max(100),
  student_or_team_name: z.string().trim().min(2).max(160),
  github_link: safeUrlOptional,
  live_demo_link: safeUrlOptional,
  project_status: z.enum(['prototype', 'in_progress', 'completed', 'open_source']).default('completed'),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
});

export const resourceSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(8).max(2000),
  category: z.enum([
    'C Programming',
    'C++',
    'Java',
    'Python',
    'Web Development',
    'Artificial Intelligence',
    'Machine Learning',
    'Cybersecurity',
    'Cloud Computing',
    'Git and GitHub',
    'Data Structures and Algorithms',
    'Interview Preparation',
  ]),
  resource_type: z.enum([
    'Learning Roadmap',
    'Free Resource',
    'Tutorial',
    'Documentation',
    'Study Material',
    'Video Resource',
    'Beginner Guide',
  ]),
  external_url: safeUrlRequired,
  provider: z.string().trim().max(120).optional().default(''),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'all']).default('beginner'),
  is_published: z.boolean().default(false),
});

export const blogSchema = z.object({
  title: z.string().trim().min(4).max(220),
  slug: z.string().trim().min(2).max(220).optional(),
  cover_image_url: safeUrlOptional,
  author_name: z.string().trim().min(2).max(120),
  category_name: z.string().trim().min(2).max(100),
  published_at: z.string().nullable().optional(),
  reading_time_minutes: z.number().int().min(1).max(120).default(5),
  excerpt: z.string().trim().min(10).max(500),
  content: z.string().trim().min(30).max(50000),
  is_published: z.boolean().default(false),
});

export const teamMemberSchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(140),
  group_type: z.enum(['core', 'volunteer', 'contributor']).default('core'),
  bio: z.string().trim().max(600).optional().default(''),
  photo_url: safeUrlOptional,
  github_url: safeUrlOptional,
  linkedin_url: safeUrlOptional,
  website_url: safeUrlOptional,
  display_order: z.number().int().min(0).max(999).default(0),
  is_published: z.boolean().default(false),
});

export const submissionReviewSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  is_published: z.boolean(),
  admin_notes: z.string().trim().max(1000).optional().default(''),
});

export const siteContentSchema = z.object({
  key: z.string().trim().min(2).max(80),
  value: z.record(z.string(), z.unknown()),
});
