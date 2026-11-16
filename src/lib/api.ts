
import type {
  AnnouncementItem,
  BlogItem,
  CommunitySubmissionPublic,
  EventItem,
  HackathonItem,
  OpportunityItem,
  OverviewResponse,
  ProjectItem,
  ResourceItem,
  SearchResponse,
  SiteContentMap,
  TeamMemberItem,
} from '../types/content';

// Render Backend URL
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ''
).replace(/\/$/, '');

async function requestJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error ||
        `Request failed (${res.status})`
    );
  }

  return data as T;
}

export const publicApi = {
  getOverview: () =>
    requestJson<OverviewResponse>('/api/public/overview'),

  getAnnouncements: () =>
    requestJson<{ items: AnnouncementItem[] }>(
      '/api/public/announcements'
    ),

  getEvents: () =>
    requestJson<{ items: EventItem[] }>('/api/public/events'),

  getHackathons: () =>
    requestJson<{ items: HackathonItem[] }>(
      '/api/public/hackathons'
    ),

  getOpportunities: () =>
    requestJson<{ items: OpportunityItem[] }>(
      '/api/public/opportunities'
    ),

  getProjects: () =>
    requestJson<{ items: ProjectItem[] }>(
      '/api/public/projects'
    ),

  getResources: () =>
    requestJson<{ items: ResourceItem[] }>(
      '/api/public/resources'
    ),

  getBlogs: () =>
    requestJson<{ items: BlogItem[] }>('/api/public/blogs'),

  getTeam: () =>
    requestJson<{ items: TeamMemberItem[] }>('/api/public/team'),

  getCommunity: () =>
    requestJson<{ items: CommunitySubmissionPublic[] }>(
      '/api/public/community'
    ),

  getSiteContent: () =>
    requestJson<{ siteContent: SiteContentMap }>(
      '/api/public/site-content'
    ),

  search: (q: string) =>
    requestJson<SearchResponse>(
      `/api/public/search?q=${encodeURIComponent(q)}`
    ),

  submitCommunity: (payload: Record<string, unknown>) =>
    requestJson<{
      id: string;
      status: string;
      message: string;
    }>('/api/public/submissions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  submitContact: (payload: Record<string, unknown>) =>
    requestJson<{ id: string; message: string }>(
      '/api/public/contact',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),
};

export const adminApi = {
  getSession: () =>
    requestJson<{
      authenticated: boolean;
      configured: boolean;
      missingVars?: string[];
      admin?: { email: string };
    }>('/api/admin/session'),

  login: (email: string, password: string) =>
    requestJson<{
      authenticated: boolean;
      admin: { email: string };
    }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    requestJson<{ authenticated: boolean }>(
      '/api/admin/logout',
      { method: 'POST' }
    ),

  getDashboard: () =>
    requestJson<{ counts: Record<string, number> }>(
      '/api/admin/dashboard'
    ),

  list: <T>(resource: string) =>
    requestJson<{ items: T[] }>(`/api/admin/${resource}`),

  create: <T>(resource: string, payload: unknown) =>
    requestJson<{ item: T }>(`/api/admin/${resource}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: <T>(
    resource: string,
    id: string,
    payload: unknown
  ) =>
    requestJson<{ item: T }>(
      `/api/admin/${resource}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    ),

  patchPublish: <T>(
    resource: string,
    id: string,
    is_published: boolean
  ) =>
    requestJson<{ item: T }>(
      `/api/admin/${resource}/${id}/publish`,
      {
        method: 'PATCH',
        body: JSON.stringify({ is_published }),
      }
    ),

  remove: (resource: string, id: string) =>
    requestJson<{ deleted: boolean }>(
      `/api/admin/${resource}/${id}`,
      { method: 'DELETE' }
    ),

  reviewSubmission: (
    id: string,
    payload: {
      status: string;
      is_published: boolean;
      admin_notes: string;
    }
  ) =>
    requestJson<{ item: unknown }>(
      `/api/admin/submissions/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    ),

  updateMessageStatus: (
    id: string,
    status: 'unread' | 'read' | 'archived'
  ) =>
    requestJson<{ item: unknown }>(
      `/api/admin/contact-messages/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    ),

  saveSiteContent: (
    key: string,
    value: Record<string, unknown>
  ) =>
    requestJson<{ item: unknown }>(
      '/api/admin/site-content',
      {
        method: 'PUT',
        body: JSON.stringify({ key, value }),
      }
    ),

  uploadMedia: async (file: File, altText: string) => {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('alt_text', altText);

    const res = await fetch(
      `${API_BASE_URL}/api/admin/media`,
      {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        (data as { error?: string }).error ||
          'Upload failed.'
      );
    }

    return data as {
      item: {
        public_url: string;
        file_name: string;
        id: string;
      };
    };
  },
};
