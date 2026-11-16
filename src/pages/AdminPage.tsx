import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogOut,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { adminApi } from '../lib/api';
import { BRAND_ASSETS } from '../lib/assets';
import {
  EVENT_CATEGORIES,
  OPPORTUNITY_CATEGORIES,
  RESOURCE_CATEGORIES,
  type CommunitySubmissionAdmin,
  type ContactMessageAdmin,
  type MediaAssetItem,
} from '../types/content';

type AdminTab =
  | 'overview'
  | 'announcements'
  | 'events'
  | 'hackathons'
  | 'opportunities'
  | 'projects'
  | 'resources'
  | 'blogs'
  | 'team'
  | 'submissions'
  | 'messages'
  | 'media'
  | 'site_content';

const TABS: { id: AdminTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'announcements', label: 'Announcements' },
  { id: 'events', label: 'Events' },
  { id: 'hackathons', label: 'Hackathons' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'projects', label: 'Projects' },
  { id: 'resources', label: 'Resources' },
  { id: 'blogs', label: 'Blogs' },
  { id: 'team', label: 'Team' },
  { id: 'submissions', label: 'Submissions' },
  { id: 'messages', label: 'Messages' },
  { id: 'media', label: 'Media' },
  { id: 'site_content', label: 'Site Content' },
];

export function AdminPage({ onExitToSite }: { onExitToSite: () => void }) {
  const [checking, setChecking] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [missingVars, setMissingVars] = useState<string[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  // Login form
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editor modal state
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [formState, setFormState] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  // Site Content state
  const [aboutIntro, setAboutIntro] = useState('');
  const [aboutWebsite, setAboutWebsite] = useState('https://www.bitmangalore.edu.in/');
  const [socialGithub, setSocialGithub] = useState('');
  const [socialLinkedin, setSocialLinkedin] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialYoutube, setSocialYoutube] = useState('');
  const [socialEmail, setSocialEmail] = useState('');

  // Media upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploading, setUploading] = useState(false);

  const checkSession = useCallback(async () => {
    setChecking(true);
    try {
      const res = await adminApi.getSession();
      setConfigured(res.configured);
      setMissingVars(res.missingVars || []);
      setAuthenticated(res.authenticated);
      setAdminEmail(res.admin?.email || '');
    } catch {
      setAuthenticated(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const loadTabData = useCallback(async (tab: AdminTab) => {
    if (!authenticated) return;
    setTabLoading(true);
    setErrorMsg('');
    try {
      if (tab === 'overview') {
        const res = await adminApi.getDashboard();
        setCounts(res.counts);
      } else if (tab === 'messages') {
        const res = await adminApi.list<ContactMessageAdmin>('contact-messages');
        setItems(res.items as unknown as Record<string, unknown>[]);
      } else if (tab === 'site_content') {
        const res = await adminApi.list<{ key: string; value: Record<string, string> }>('site-content');
        const about = res.items.find((i) => i.key === 'about_bit')?.value || {};
        const socials = res.items.find((i) => i.key === 'social_links')?.value || {};
        setAboutIntro(about.introduction || '');
        setAboutWebsite(about.official_website || 'https://www.bitmangalore.edu.in/');
        setSocialGithub(socials.github || '');
        setSocialLinkedin(socials.linkedin || '');
        setSocialInstagram(socials.instagram || '');
        setSocialYoutube(socials.youtube || '');
        setSocialEmail(socials.email || '');
      } else {
        const res = await adminApi.list<Record<string, unknown>>(tab);
        setItems(res.items);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to load admin data.');
    } finally {
      setTabLoading(false);
    }
  }, [authenticated]);

  useEffect(() => {
    if (authenticated) {
      loadTabData(activeTab);
    }
  }, [authenticated, activeTab, loadTabData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await adminApi.login(emailInput, passwordInput);
      setAuthenticated(res.authenticated);
      setAdminEmail(res.admin.email);
      setPasswordInput('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await adminApi.logout().catch(() => undefined);
    setAuthenticated(false);
    setAdminEmail('');
  };

  const openCreateModal = () => {
    const defaults: Record<string, Record<string, unknown>> = {
      announcements: { title: '', summary: '', body: '', link_url: '', link_label: '', priority: 'normal', is_published: true },
      events: { title: '', description: '', image_url: '', event_date: '', event_time: '', venue_or_mode: '', registration_link: '', organizer: 'CORESPACE', category: 'Technical Workshop', registration_deadline: '', status: 'upcoming', is_published: true },
      hackathons: { name: '', organizer: '', description: '', image_url: '', start_date: '', end_date: '', registration_deadline: '', eligibility: 'Engineering Students', team_size: '1 - 4 Members', prize_details: '', mode: 'online', scope: 'national', participation_type: 'team', official_registration_url: '', verification_status: 'verified', is_published: true },
      opportunities: { title: '', description: '', organization: '', eligibility: '', deadline: '', application_link: '', category: 'Internships', paid_status: 'stipend', verification_status: 'verified', official_source: '', is_published: true },
      projects: { title: '', description: '', image_url: '', tech_stack: '', category: 'Web Development', student_or_team_name: '', github_link: '', live_demo_link: '', project_status: 'completed', is_featured: false, is_published: true },
      resources: { title: '', description: '', category: 'Web Development', resource_type: 'Documentation', external_url: '', provider: '', difficulty: 'beginner', is_published: true },
      blogs: { title: '', cover_image_url: '', author_name: '', category_name: 'Engineering', reading_time_minutes: 5, excerpt: '', content: '', is_published: true },
      team: { name: '', role: '', group_type: 'core', bio: '', photo_url: '', github_url: '', linkedin_url: '', website_url: '', display_order: 0, is_published: true },
    };
    setEditingItem({});
    setFormState(defaults[activeTab] || {});
  };

  const openEditModal = (item: Record<string, unknown>) => {
    const normalized = { ...item };
    if (Array.isArray(normalized.tech_stack)) {
      normalized.tech_stack = (normalized.tech_stack as string[]).join(', ');
    }
    setEditingItem(item);
    setFormState(normalized);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setStatusMsg('');
    try {
      const payload = { ...formState };
      if (activeTab === 'projects' && typeof payload.tech_stack === 'string') {
        payload.tech_stack = payload.tech_stack
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (activeTab === 'blogs') {
        payload.reading_time_minutes = Number(payload.reading_time_minutes || 5);
      }
      if (activeTab === 'team') {
        payload.display_order = Number(payload.display_order || 0);
      }
      if (payload.registration_deadline === '') payload.registration_deadline = null;
      if (payload.deadline === '') payload.deadline = null;

      if (editingItem?.id) {
        await adminApi.update(activeTab, String(editingItem.id), payload);
        setStatusMsg('Updated successfully.');
      } else {
        await adminApi.create(activeTab, payload);
        setStatusMsg('Created successfully.');
      }
      setEditingItem(null);
      await loadTabData(activeTab);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      await adminApi.patchPublish(activeTab, id, !current);
      await loadTabData(activeTab);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to toggle publish status.');
    }
  };

  const handleDelete = async (id: string, resourceOverride?: string) => {
    try {
      await adminApi.remove(resourceOverride || activeTab, id);
      setStatusMsg('Deleted.');
      await loadTabData(activeTab);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  const handleReviewSubmission = async (id: string, status: 'approved' | 'rejected', is_published: boolean) => {
    try {
      await adminApi.reviewSubmission(id, { status, is_published, admin_notes: '' });
      setStatusMsg(`Submission marked as ${status}.`);
      await loadTabData('submissions');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Review update failed.');
    }
  };

  const handleMessageStatus = async (id: string, status: 'read' | 'archived') => {
    try {
      await adminApi.updateMessageStatus(id, status);
      await loadTabData('messages');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to update message.');
    }
  };

  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    setErrorMsg('');
    try {
      await adminApi.uploadMedia(uploadFile, uploadAlt);
      setUploadFile(null);
      setUploadAlt('');
      setStatusMsg('Image uploaded to Supabase Storage.');
      await loadTabData('media');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSiteContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      await Promise.all([
        adminApi.saveSiteContent('about_bit', {
          college_name: 'Bearys Institute of Technology',
          location: 'Mangalore, Karnataka',
          introduction: aboutIntro,
          official_website: aboutWebsite,
        }),
        adminApi.saveSiteContent('social_links', {
          github: socialGithub,
          linkedin: socialLinkedin,
          instagram: socialInstagram,
          youtube: socialYoutube,
          email: socialEmail,
        }),
      ]);
      setStatusMsg('Website content updated.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save site content.');
    } finally {
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#040814] text-white">
        <Loader2 className="h-6 w-6 animate-spin text-[#16A34A]" />
      </div>
    );
  }

  // Unconfigured Supabase / Single Admin Environment State
  if (!configured) {
    return (
      <div className="min-h-screen bg-[#040814] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-xl w-full rounded-2xl border border-amber-500/30 bg-[#071024] p-8 space-y-5">
          <div className="flex items-center gap-3 text-amber-400">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <h1 className="font-display text-xl font-bold text-white">
              Admin Backend Configuration Required
            </h1>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            CORESPACE enforces real server-side Supabase Auth for the single authorized Admin
            account. No simulated login bypass is permitted.
          </p>
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Missing Server Environment Variables
            </p>
            <ul className="space-y-1 text-xs font-mono text-amber-300">
              {missingVars.map((v) => (
                <li key={v}>• {v}</li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Run <code className="text-emerald-400">database/migrations/001_initial_schema.sql</code> in
            your Supabase SQL Editor, create one Admin user in Supabase Auth matching{' '}
            <code className="text-emerald-400">ADMIN_EMAIL</code>, and set the variables in your
            environment.
          </p>
          <button
            type="button"
            onClick={onExitToSite}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-[#16A34A] cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Public Website</span>
          </button>
        </div>
      </div>
    );
  }

  // Private Admin Login Screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#040814] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-[#071024] p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <img
              src={BRAND_ASSETS.logoEmblem}
              alt="CORESPACE"
              className="h-11 w-auto object-contain"
            />
            <div>
              <h1 className="font-display text-xl font-bold text-white">Admin Console</h1>
              <p className="text-xs text-slate-400">Single Authorized Administrator Only</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-[#16A34A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-[#16A34A] focus:outline-none"
              />
            </div>

            {loginError && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#2563EB] px-5 py-3 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60 cursor-pointer"
            >
              {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              <span>{loginLoading ? 'Verifying...' : 'Sign In to Admin'}</span>
            </button>
          </form>

          <button
            type="button"
            onClick={onExitToSite}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Public Site</span>
          </button>
        </div>
      </div>
    );
  }

  const canCreateCrud = [
    'announcements',
    'events',
    'hackathons',
    'opportunities',
    'projects',
    'resources',
    'blogs',
    'team',
  ].includes(activeTab);

  return (
    <div className="min-h-screen bg-[#040814] text-slate-100">
      <header className="border-b border-slate-800 bg-[#070E20] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={BRAND_ASSETS.logoEmblem}
            alt="CORESPACE"
            className="h-8 w-auto object-contain"
          />
          <div>
            <p className="font-display text-sm font-bold text-white">CORESPACE Admin</p>
            <p className="text-[11px] text-slate-400">{adminEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExitToSite}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
          >
            View Site
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/25 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Tabs */}
        <aside className="lg:col-span-2 flex lg:flex-col gap-1.5 overflow-x-auto pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setActiveTab(t.id);
                setStatusMsg('');
                setErrorMsg('');
              }}
              className={`rounded-lg px-3.5 py-2 text-left text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === t.id
                  ? 'bg-[#16A34A] text-white'
                  : 'text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </aside>

        {/* Main Workspace */}
        <main className="lg:col-span-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-display text-2xl font-bold text-white capitalize">
              {activeTab.replace('_', ' ')}
            </h1>
            {canCreateCrud && (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add New</span>
              </button>
            )}
          </div>

          {statusMsg && (
            <p className="rounded-lg border border-[#16A34A]/40 bg-[#16A34A]/15 px-4 py-2.5 text-xs text-[#22C55E]">
              {statusMsg}
            </p>
          )}
          {errorMsg && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-2.5 text-xs text-red-300">
              {errorMsg}
            </p>
          )}

          {tabLoading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#16A34A]" />
            </div>
          ) : activeTab === 'overview' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(counts).map(([key, val]) => (
                <div
                  key={key}
                  className="rounded-xl border border-slate-800 bg-[#071024] p-5 space-y-1"
                >
                  <p className="text-xs text-slate-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </p>
                  <p className="font-display text-2xl font-bold font-mono-tabular text-white">
                    {val}
                  </p>
                </div>
              ))}
            </div>
          ) : activeTab === 'submissions' ? (
            <div className="space-y-4">
              {items.length === 0 ? (
                <p className="text-sm text-slate-400">No student submissions in queue.</p>
              ) : (
                (items as unknown as CommunitySubmissionAdmin[]).map((sub) => (
                  <div
                    key={sub.id}
                    className="rounded-xl border border-slate-800 bg-[#071024] p-5 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                      <span>
                        {sub.submission_type} · {sub.submitter_name} ({sub.submitter_email})
                      </span>
                      <span className="font-semibold uppercase text-emerald-400">
                        {sub.status} {sub.is_published ? '· Published' : ''}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-white">{sub.title}</h3>
                    <p className="text-sm text-slate-300">{sub.description}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleReviewSubmission(sub.id, 'approved', true)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#16A34A] px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve & Publish</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReviewSubmission(sub.id, 'rejected', false)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 px-3 py-1.5 text-xs font-semibold text-amber-300 cursor-pointer"
                      >
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(sub.id, 'submissions')}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-300 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'messages' ? (
            <div className="space-y-4">
              {items.length === 0 ? (
                <p className="text-sm text-slate-400">No contact messages received yet.</p>
              ) : (
                (items as unknown as ContactMessageAdmin[]).map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-xl border border-slate-800 bg-[#071024] p-5 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                      <span>
                        {msg.name} ({msg.email}) · {new Date(msg.created_at).toLocaleString()}
                      </span>
                      <span className="uppercase font-semibold text-blue-400">{msg.status}</span>
                    </div>
                    <h3 className="font-display text-base font-semibold text-white">
                      {msg.subject}
                    </h3>
                    <p className="text-sm text-slate-300 whitespace-pre-line">{msg.message}</p>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => handleMessageStatus(msg.id, 'read')}
                        className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200 cursor-pointer"
                      >
                        Mark Read
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMessageStatus(msg.id, 'archived')}
                        className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200 cursor-pointer"
                      >
                        Archive
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(msg.id, 'contact-messages')}
                        className="rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-300 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'media' ? (
            <div className="space-y-6">
              <form
                onSubmit={handleUploadMedia}
                className="rounded-xl border border-slate-800 bg-[#071024] p-5 flex flex-col sm:flex-row gap-4 items-end"
              >
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Image File (JPEG, PNG, WebP, AVIF · max 5MB)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    required
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-300"
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Alt Text Description
                  </label>
                  <input
                    type="text"
                    value={uploadAlt}
                    onChange={(e) => setUploadAlt(e.target.value)}
                    placeholder="Descriptive alt text"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#16A34A] px-4 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(items as unknown as MediaAssetItem[]).map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border border-slate-800 bg-[#071024] overflow-hidden"
                  >
                    <img src={m.public_url} alt={m.alt_text || m.file_name} className="h-40 w-full object-cover" />
                    <div className="p-3 space-y-2">
                      <p className="text-xs font-medium text-white truncate">{m.file_name}</p>
                      <input
                        type="text"
                        readOnly
                        value={m.public_url}
                        onFocus={(e) => e.target.select()}
                        className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] font-mono text-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id, 'media')}
                        className="text-xs text-red-400 hover:underline cursor-pointer"
                      >
                        Delete Image
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'site_content' ? (
            <form
              onSubmit={handleSaveSiteContent}
              className="rounded-xl border border-slate-800 bg-[#071024] p-6 space-y-4 max-w-2xl"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  About BIT Introduction (2–3 lines)
                </label>
                <textarea
                  rows={3}
                  value={aboutIntro}
                  onChange={(e) => setAboutIntro(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official BIT Website URL
                </label>
                <input
                  type="url"
                  value={aboutWebsite}
                  onChange={(e) => setAboutWebsite(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="url" placeholder="GitHub URL" value={socialGithub} onChange={(e) => setSocialGithub(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white" />
                <input type="url" placeholder="LinkedIn URL" value={socialLinkedin} onChange={(e) => setSocialLinkedin(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white" />
                <input type="url" placeholder="Instagram URL" value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white" />
                <input type="url" placeholder="YouTube URL" value={socialYoutube} onChange={(e) => setSocialYoutube(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white" />
                <input type="email" placeholder="Public Contact Email" value={socialEmail} onChange={(e) => setSocialEmail(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white sm:col-span-2" />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#16A34A] px-5 py-2.5 text-xs font-semibold text-white cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Website Content'}
              </button>
            </form>
          ) : (
            /* Generic Content Table */
            <div className="space-y-3">
              {items.length === 0 ? (
                <p className="text-sm text-slate-400">No items created yet. Click “Add New” to create one.</p>
              ) : (
                items.map((row) => {
                  const id = String(row.id);
                  const title = String(row.title || row.name || id);
                  const isPub = Boolean(row.is_published);
                  return (
                    <div
                      key={id}
                      className="rounded-xl border border-slate-800 bg-[#071024] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-display text-base font-semibold text-white">{title}</p>
                        <p className="text-xs text-slate-400">
                          {isPub ? 'Published' : 'Draft (Hidden)'}
                          {row.category ? ` · ${String(row.category)}` : ''}
                          {row.category_name ? ` · ${String(row.category_name)}` : ''}
                          {row.role ? ` · ${String(row.role)}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(id, isPub)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:border-[#16A34A] cursor-pointer"
                        >
                          {isPub ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          <span>{isPub ? 'Unpublish' : 'Publish'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(row)}
                          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-blue-300 hover:border-[#2563EB] cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(id)}
                          className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </main>
      </div>

      {/* Create / Edit Modal */}
      {editingItem !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setEditingItem(null)}
        >
          <form
            onSubmit={handleSaveItem}
            onClick={(e) => e.stopPropagation()}
            className="max-w-xl w-full max-h-[88vh] overflow-y-auto rounded-2xl border border-slate-700 bg-[#071024] p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-white">
                {editingItem.id ? 'Edit Entry' : 'Create Entry'}
              </h2>
              <button type="button" onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {Object.keys(formState)
              .filter((k) => !['id', 'created_at', 'updated_at', 'slug', 'published_at', 'category_id'].includes(k))
              .map((key) => {
                const val = formState[key];
                if (typeof val === 'boolean') {
                  return (
                    <label key={key} className="flex items-center gap-2 text-xs text-slate-200">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={(e) => setFormState((s) => ({ ...s, [key]: e.target.checked }))}
                      />
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    </label>
                  );
                }

                // Specialized selects
                if (activeTab === 'events' && key === 'category') {
                  return renderSelect(key, String(val || ''), [...EVENT_CATEGORIES], (v) => setFormState((s) => ({ ...s, [key]: v })));
                }
                if (activeTab === 'opportunities' && key === 'category') {
                  return renderSelect(key, String(val || ''), [...OPPORTUNITY_CATEGORIES], (v) => setFormState((s) => ({ ...s, [key]: v })));
                }
                if (activeTab === 'resources' && key === 'category') {
                  return renderSelect(key, String(val || ''), [...RESOURCE_CATEGORIES], (v) => setFormState((s) => ({ ...s, [key]: v })));
                }
                if (key === 'verification_status') {
                  return renderSelect(key, String(val || 'unverified'), ['verified', 'unverified'], (v) => setFormState((s) => ({ ...s, [key]: v })));
                }
                if (key === 'mode') {
                  return renderSelect(key, String(val || 'online'), ['online', 'offline', 'hybrid'], (v) => setFormState((s) => ({ ...s, [key]: v })));
                }
                if (key === 'scope') {
                  return renderSelect(key, String(val || 'national'), ['national', 'international', 'regional'], (v) => setFormState((s) => ({ ...s, [key]: v })));
                }
                if (key === 'participation_type') {
                  return renderSelect(key, String(val || 'team'), ['team', 'individual', 'both'], (v) => setFormState((s) => ({ ...s, [key]: v })));
                }
                if (key === 'paid_status') {
                  return renderSelect(key, String(val || 'unknown'), ['paid', 'free', 'stipend', 'unpaid', 'unknown'], (v) => setFormState((s) => ({ ...s, [key]: v })));
                }
                if (key === 'group_type') {
                  return renderSelect(key, String(val || 'core'), ['core', 'volunteer', 'contributor'], (v) => setFormState((s) => ({ ...s, [key]: v })));
                }
                if (key === 'priority') {
                  return renderSelect(key, String(val || 'normal'), ['normal', 'high', 'urgent'], (v) => setFormState((s) => ({ ...s, [key]: v })));
                }

                const isTextArea = ['description', 'content', 'body', 'bio', 'excerpt', 'summary'].includes(key);
                const isDate = ['event_date', 'start_date', 'end_date', 'registration_deadline', 'deadline'].includes(key);

                return (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 capitalize">
                      {key.replace(/_/g, ' ')}
                    </label>
                    {isTextArea ? (
                      <textarea
                        rows={key === 'content' ? 6 : 3}
                        value={String(val ?? '')}
                        onChange={(e) => setFormState((s) => ({ ...s, [key]: e.target.value }))}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                      />
                    ) : (
                      <input
                        type={isDate ? 'date' : typeof val === 'number' ? 'number' : 'text'}
                        value={String(val ?? '')}
                        onChange={(e) => setFormState((s) => ({ ...s, [key]: e.target.value }))}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                      />
                    )}
                  </div>
                );
              })}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#16A34A] px-5 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function renderSelect(
  key: string,
  value: string,
  options: string[],
  onChange: (val: string) => void,
) {
  return (
    <div key={key}>
      <label className="block text-xs font-semibold text-slate-300 mb-1 capitalize">
        {key.replace(/_/g, ' ')}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
