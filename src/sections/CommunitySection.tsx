import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ExternalLink, Loader2, Send, Users } from 'lucide-react';
import { publicApi } from '../lib/api';
import { EmptyState } from '../components/EmptyState';
import { PageHeroBanner } from '../components/PageHeroBanner';
import type { CommunitySubmissionPublic } from '../types/content';

type SubmissionType =
  | 'project'
  | 'collaboration'
  | 'event_suggestion'
  | 'blog_contribution'
  | 'community_idea';

const SUBMISSION_TYPES: { id: SubmissionType; label: string; hint: string }[] = [
  { id: 'collaboration', label: 'Find Teammates / Collaborate', hint: 'Recruit project partners or hackathon teammates.' },
  { id: 'project', label: 'Submit a Project', hint: 'Share your completed or active student project.' },
  { id: 'event_suggestion', label: 'Suggest an Event', hint: 'Propose a workshop, seminar, or coding session.' },
  { id: 'blog_contribution', label: 'Contribute a Blog', hint: 'Submit a technical article or hackathon write-up.' },
  { id: 'community_idea', label: 'Share Community Idea', hint: 'Propose peer learning circles or tech initiatives.' },
];

export function CommunitySection() {
  const [items, setItems] = useState<CommunitySubmissionPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  // Form state (no account required)
  const [submissionType, setSubmissionType] = useState<SubmissionType>('collaboration');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [departmentOrYear, setDepartmentOrYear] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [techStackRaw, setTechStackRaw] = useState('');
  const [neededRoles, setNeededRoles] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [formLoadedAt, setFormLoadedAt] = useState(() => Date.now());

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    publicApi
      .getCommunity()
      .then((res) => setItems(res.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filterType === 'all') return items;
    return items.filter((item) => item.submission_type === filterType);
  }, [items, filterType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const tech_stack = techStackRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await publicApi.submitCommunity({
        submission_type: submissionType,
        title,
        description,
        category,
        submitter_name: submitterName,
        submitter_email: submitterEmail,
        department_or_year: departmentOrYear,
        external_link: externalLink,
        tech_stack,
        needed_roles: neededRoles,
        honeypot,
        formLoadedAt,
      });

      setSubmitSuccess(res.message);
      setTitle('');
      setDescription('');
      setCategory('');
      setSubmitterName('');
      setSubmitterEmail('');
      setDepartmentOrYear('');
      setExternalLink('');
      setTechStackRaw('');
      setNeededRoles('');
      setFormLoadedAt(Date.now());
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeroBanner
        kicker="Open Student Collaboration Hub"
        title="Community"
        description="Find project teammates, share engineering ideas, suggest campus events, or submit projects — no student account required. Every submission goes through Admin moderation before publishing."
        backdrop="auroraBotanical"
      />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 space-y-12">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Approved Community Board */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-[#2563EB]" />
              <span>Approved Collaboration Board</span>
            </h2>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filter community posts"
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Community Posts</option>
              {SUBMISSION_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No Approved Community Posts Yet"
              description="Submit a collaboration request, teammate call, or idea using the form. Approved entries will appear here without exposing private contact info."
            />
          ) : (
            <div className="space-y-4">
              {filtered.map((item) => (
                <article
                  key={item.id}
                  className="cyber-frame p-6 space-y-3"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-[#16A34A] dark:text-[#22C55E] capitalize">
                      {item.submission_type.replace('_', ' ')}
                    </span>{' '}
                    · {item.submitter_name}
                    {item.department_or_year ? ` (${item.department_or_year})` : ''} ·{' '}
                    <span className="font-mono-tabular">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </p>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                  {item.needed_roles && (
                    <p className="text-xs font-medium text-[#2563EB] dark:text-blue-400">
                      Looking for: {item.needed_roles}
                    </p>
                  )}
                  {item.tech_stack?.length > 0 && (
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      Stack: {item.tech_stack.join(' · ')}
                    </p>
                  )}
                  {item.external_link && (
                    <a
                      href={item.external_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] dark:text-blue-400 hover:underline"
                    >
                      <span>View Reference Link</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Right: No-Account Submission Form */}
        <div className="lg:col-span-5 cyber-frame p-6 sm:p-7 space-y-5">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Submit Without an Account
            </h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              All entries enter pending review. Your email is kept private for Admin verification only.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot anti-spam field */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="community-company">Website</label>
              <input
                id="community-company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Submission Type
              </label>
              <select
                value={submissionType}
                onChange={(e) => setSubmissionType(e.target.value as SubmissionType)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-white"
              >
                {SUBMISSION_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                {SUBMISSION_TYPES.find((t) => t.id === submissionType)?.hint}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                minLength={4}
                maxLength={180}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Concise title for your idea, project, or request"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-[#16A34A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description *
              </label>
              <textarea
                required
                minLength={15}
                maxLength={4000}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain your goal, technical details, or what kind of collaborators you are looking for..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-[#16A34A] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email (kept private) *
                </label>
                <input
                  type="email"
                  required
                  value={submitterEmail}
                  onChange={(e) => setSubmitterEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Year / Branch (optional)
                </label>
                <input
                  type="text"
                  value={departmentOrYear}
                  onChange={(e) => setDepartmentOrYear(e.target.value)}
                  placeholder="e.g., 3rd Year CSE"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category (optional)
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., AI, Web, Hardware"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tech Stack (comma separated, optional)
              </label>
              <input
                type="text"
                value={techStackRaw}
                onChange={(e) => setTechStackRaw(e.target.value)}
                placeholder="React, Python, TensorFlow"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
              />
            </div>

            {submissionType === 'collaboration' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Needed Teammate Roles
                </label>
                <input
                  type="text"
                  value={neededRoles}
                  onChange={(e) => setNeededRoles(e.target.value)}
                  placeholder="e.g., UI Designer, Backend Developer"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                GitHub / Reference URL (optional)
              </label>
              <input
                type="url"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
              />
            </div>

            {submitError && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                {submitError}
              </p>
            )}
            {submitSuccess && (
              <div className="flex items-start gap-2 rounded-lg border border-[#16A34A]/30 bg-[#16A34A]/10 p-3 text-xs text-[#16A34A] dark:text-[#22C55E]">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="cyber-btn-glow w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#2563EB] px-5 py-3 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60 transition-all cursor-pointer"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>{submitting ? 'Submitting...' : 'Submit for Admin Review'}</span>
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}
