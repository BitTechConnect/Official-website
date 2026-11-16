export type SectionId =
  | 'home'
  | 'about'
  | 'events'
  | 'hackathons'
  | 'opportunities'
  | 'projects'
  | 'resources'
  | 'blogs'
  | 'community'
  | 'team'
  | 'contact';

export interface AnnouncementItem {
  id: string;
  title: string;
  summary: string;
  body?: string;
  link_url?: string;
  link_label?: string;
  priority: 'normal' | 'high' | 'urgent';
  is_published: boolean;
  published_at?: string | null;
  created_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url?: string;
  event_date: string;
  event_time?: string;
  venue_or_mode: string;
  registration_link?: string;
  organizer: string;
  category:
    | 'Technical Workshop'
    | 'Seminar'
    | 'Webinar'
    | 'Coding Competition'
    | 'Technical Fest'
    | 'Community Activity';
  registration_deadline?: string | null;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  is_published: boolean;
  created_at: string;
}

export interface HackathonItem {
  id: string;
  name: string;
  organizer: string;
  description: string;
  image_url?: string;
  start_date: string;
  end_date: string;
  registration_deadline?: string | null;
  eligibility: string;
  team_size: string;
  prize_details?: string;
  mode: 'online' | 'offline' | 'hybrid';
  scope: 'national' | 'international' | 'regional';
  participation_type: 'team' | 'individual' | 'both';
  official_registration_url: string;
  verification_status: 'verified' | 'unverified';
  is_published: boolean;
  created_at: string;
}

export interface OpportunityItem {
  id: string;
  title: string;
  description: string;
  organization: string;
  eligibility: string;
  deadline?: string | null;
  application_link: string;
  category:
    | 'Internships'
    | 'Technical Competitions'
    | 'Workshops'
    | 'Scholarships'
    | 'Research Opportunities'
    | 'Open-Source Programs'
    | 'Student Programs'
    | 'Conferences'
    | 'Career Opportunities';
  paid_status: 'paid' | 'free' | 'stipend' | 'unpaid' | 'unknown';
  verification_status: 'verified' | 'unverified';
  official_source: string;
  is_published: boolean;
  created_at: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  tech_stack: string[];
  category: string;
  student_or_team_name: string;
  github_link?: string;
  live_demo_link?: string;
  project_status: 'prototype' | 'in_progress' | 'completed' | 'open_source';
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  category:
    | 'C Programming'
    | 'C++'
    | 'Java'
    | 'Python'
    | 'Web Development'
    | 'Artificial Intelligence'
    | 'Machine Learning'
    | 'Cybersecurity'
    | 'Cloud Computing'
    | 'Git and GitHub'
    | 'Data Structures and Algorithms'
    | 'Interview Preparation';
  resource_type:
    | 'Learning Roadmap'
    | 'Free Resource'
    | 'Tutorial'
    | 'Documentation'
    | 'Study Material'
    | 'Video Resource'
    | 'Beginner Guide';
  external_url: string;
  provider?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all';
  is_published: boolean;
  created_at: string;
}

export interface BlogItem {
  id: string;
  title: string;
  slug: string;
  cover_image_url?: string;
  author_name: string;
  category_name: string;
  published_at?: string | null;
  reading_time_minutes: number;
  excerpt: string;
  content: string;
  is_published: boolean;
  created_at: string;
}

export interface TeamMemberItem {
  id: string;
  name: string;
  role: string;
  group_type: 'core' | 'volunteer' | 'contributor';
  bio?: string;
  photo_url?: string;
  github_url?: string;
  linkedin_url?: string;
  website_url?: string;
  display_order: number;
  is_published: boolean;
}

export interface CommunitySubmissionPublic {
  id: string;
  submission_type:
    | 'project'
    | 'collaboration'
    | 'event_suggestion'
    | 'blog_contribution'
    | 'community_idea';
  title: string;
  description: string;
  category?: string;
  submitter_name: string;
  department_or_year?: string;
  external_link?: string;
  tech_stack: string[];
  needed_roles?: string;
  created_at: string;
}

export interface CommunitySubmissionAdmin extends CommunitySubmissionPublic {
  submitter_email: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  is_published: boolean;
}

export interface ContactMessageAdmin {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  created_at: string;
}

export interface MediaAssetItem {
  id: string;
  file_name: string;
  storage_path: string;
  public_url: string;
  mime_type: string;
  file_size: number;
  alt_text?: string;
  uploaded_by: string;
  created_at: string;
}

export interface SiteContentMap {
  about_bit?: {
    college_name?: string;
    location?: string;
    introduction?: string;
    official_website?: string;
  };
  social_links?: {
    github?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    email?: string;
  };
}

export interface OverviewResponse {
  announcements: AnnouncementItem[];
  events: EventItem[];
  hackathons: HackathonItem[];
  opportunities: OpportunityItem[];
  projects: ProjectItem[];
  resources: ResourceItem[];
  blogs: BlogItem[];
  community: CommunitySubmissionPublic[];
  siteContent: SiteContentMap;
}

export interface SearchResponse {
  query: string;
  results: {
    events: EventItem[];
    hackathons: HackathonItem[];
    opportunities: OpportunityItem[];
    projects: ProjectItem[];
    resources: ResourceItem[];
    blogs: BlogItem[];
  };
}

export const RESOURCE_CATEGORIES = [
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
] as const;

export const OPPORTUNITY_CATEGORIES = [
  'Internships',
  'Technical Competitions',
  'Workshops',
  'Scholarships',
  'Research Opportunities',
  'Open-Source Programs',
  'Student Programs',
  'Conferences',
  'Career Opportunities',
] as const;

export const EVENT_CATEGORIES = [
  'Technical Workshop',
  'Seminar',
  'Webinar',
  'Coding Competition',
  'Technical Fest',
  'Community Activity',
] as const;
