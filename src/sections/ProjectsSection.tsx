import React, { useEffect, useMemo, useState } from 'react';
import { Code2, ExternalLink, Github, Search, X } from 'lucide-react';
import { publicApi } from '../lib/api';
import { BRAND_ASSETS } from '../lib/assets';
import { EmptyState } from '../components/EmptyState';
import { PageHeroBanner } from '../components/PageHeroBanner';
import { PerspectiveTiltCard } from '../components/PerspectiveTiltCard';
import type { ProjectItem, SectionId } from '../types/content';

export function ProjectsSection({ onNavigate }: { onNavigate: (s: SectionId) => void }) {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState<ProjectItem | null>(null);

  useEffect(() => {
    publicApi
      .getProjects()
      .then((res) => setItems(res.items || []))
      .catch((err) => setError(err.message || 'Unable to load projects.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['all', ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (q) {
        const hay = `${p.title} ${p.description} ${p.student_or_team_name} ${(p.tech_stack || []).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, category, query]);

  return (
    <div>
      <PageHeroBanner
        kicker="Student Engineering Showcase"
        title="Projects"
        description="Software, hardware, AI, and open-source projects built by students at Bearys Institute of Technology."
        backdrop="auroraBotanical"
        action={
          <button
            type="button"
            onClick={() => onNavigate('community')}
            className="cyber-btn-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#2563EB] px-5 py-3 text-xs font-semibold text-white cursor-pointer whitespace-nowrap"
          >
            <Code2 className="h-4 w-4" />
            <span>Submit Your Project</span>
          </button>
        }
      />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Filters */}
      <div className="cyber-frame flex flex-col sm:flex-row gap-3 justify-between p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                category === cat
                  ? 'bg-[#16A34A] text-white'
                  : 'bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Projects' : cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects or stack..."
            className="w-full sm:w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#2563EB] focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Student Projects Published Yet"
          description="Submit your project without creating an account via the Community hub. Once reviewed and approved by Admin, it will be showcased here."
          actionLabel="Submit a Project"
          onAction={() => onNavigate('community')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((proj) => (
            <PerspectiveTiltCard key={proj.id}>
              <article
                onClick={() => setSelected(proj)}
                className="h-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-[#071024]/85 backdrop-blur-md flex flex-col justify-between cursor-pointer hover:border-[#2563EB]/60 transition-colors"
              >
                <div>
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-900">
                    <img
                      src={proj.image_url || BRAND_ASSETS.cyberForest}
                      alt={proj.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-5 space-y-2.5">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {proj.category} · {proj.project_status.replace('_', ' ')}
                    </p>
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      {proj.title}
                    </h2>
                    <p className="text-xs font-medium text-[#16A34A] dark:text-[#22C55E]">
                      By {proj.student_or_team_name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                      {proj.description}
                    </p>
                    {proj.tech_stack?.length > 0 && (
                      <p className="pt-1 text-xs font-mono text-[#2563EB] dark:text-blue-400">
                        {proj.tech_stack.join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 px-5 py-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Inspect Details</span>
                  <div className="flex items-center gap-3">
                    {proj.github_link && <Github className="h-4 w-4 text-slate-600 dark:text-slate-300" />}
                    {proj.live_demo_link && <ExternalLink className="h-4 w-4 text-[#2563EB]" />}
                  </div>
                </div>
              </article>
            </PerspectiveTiltCard>
          ))}
        </div>
      )}

      {/* Project Detail Modal */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-w-2xl w-full max-h-[88vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#070E20] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/9] w-full bg-slate-900">
              <img
                src={selected.image_url || BRAND_ASSETS.cyberForest}
                alt={selected.title}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close project details"
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900/80 text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 sm:p-8 space-y-5">
              <p className="text-xs font-medium text-[#16A34A] dark:text-[#22C55E]">
                {selected.category} · {selected.project_status.replace('_', ' ')}
              </p>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                {selected.title}
              </h2>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Built by {selected.student_or_team_name}
              </p>
              {selected.tech_stack?.length > 0 && (
                <p className="text-xs font-mono text-[#2563EB] dark:text-blue-400">
                  Stack: {selected.tech_stack.join(' · ')}
                </p>
              )}
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {selected.description}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                {selected.github_link && (
                  <a
                    href={selected.github_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-900 dark:text-white hover:border-[#16A34A]"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub Repository</span>
                  </a>
                )}
                {selected.live_demo_link && (
                  <a
                    href={selected.live_demo_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    <span>Live Demo</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
