import React, { useEffect, useState } from 'react';
import { ArrowRight, Loader2, Search, X } from 'lucide-react';
import { publicApi } from '../lib/api';
import type { SearchResponse, SectionId } from '../types/content';

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (section: SectionId) => void;
}

type SearchCategory = 'all' | 'events' | 'hackathons' | 'opportunities' | 'projects' | 'resources' | 'blogs';

export function GlobalSearchModal({ open, onClose, onNavigate }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse['results'] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      setError('');
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const res = await publicApi.search(trimmed);
        setResults(res.results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed.');
      } finally {
        setLoading(false);
      }
    }, 260);

    return () => window.clearTimeout(timer);
  }, [query, open]);

  if (!open) return null;

  const categories: { id: SearchCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'events', label: 'Events' },
    { id: 'hackathons', label: 'Hackathons' },
    { id: 'opportunities', label: 'Opportunities' },
    { id: 'projects', label: 'Projects' },
    { id: 'resources', label: 'Resources' },
    { id: 'blogs', label: 'Blogs' },
  ];

  const totalCount = results
    ? results.events.length +
      results.hackathons.length +
      results.opportunities.length +
      results.projects.length +
      results.resources.length +
      results.blogs.length
    : 0;

  const jumpTo = (section: SectionId) => {
    onNavigate(section);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Platform Search"
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/70 backdrop-blur-sm p-4 pt-16 sm:pt-24"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#070E20] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-4 py-3.5">
          <Search className="h-5 w-5 text-[#16A34A]" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, hackathons, opportunities, projects, resources, blogs..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 dark:border-slate-800 px-4 py-2.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                category === cat.id
                  ? 'bg-[#2563EB] text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {!query.trim() && (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Type a keyword to search across all published CORESPACE content.
            </p>
          )}

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {query.trim() && !loading && results && totalCount === 0 && (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No published items matched “{query.trim()}”.
            </p>
          )}

          {results && (
            <>
              {(category === 'all' || category === 'events') && results.events.length > 0 && (
                <ResultGroup
                  title="Events"
                  items={results.events.map((e) => ({
                    id: e.id,
                    title: e.title,
                    meta: `${e.category} · ${e.event_date}`,
                  }))}
                  onSelect={() => jumpTo('events')}
                />
              )}
              {(category === 'all' || category === 'hackathons') && results.hackathons.length > 0 && (
                <ResultGroup
                  title="Hackathons"
                  items={results.hackathons.map((h) => ({
                    id: h.id,
                    title: h.name,
                    meta: `${h.organizer} · ${h.mode}`,
                  }))}
                  onSelect={() => jumpTo('hackathons')}
                />
              )}
              {(category === 'all' || category === 'opportunities') && results.opportunities.length > 0 && (
                <ResultGroup
                  title="Opportunities"
                  items={results.opportunities.map((o) => ({
                    id: o.id,
                    title: o.title,
                    meta: `${o.organization} · ${o.category}`,
                  }))}
                  onSelect={() => jumpTo('opportunities')}
                />
              )}
              {(category === 'all' || category === 'projects') && results.projects.length > 0 && (
                <ResultGroup
                  title="Projects"
                  items={results.projects.map((p) => ({
                    id: p.id,
                    title: p.title,
                    meta: `${p.student_or_team_name} · ${p.category}`,
                  }))}
                  onSelect={() => jumpTo('projects')}
                />
              )}
              {(category === 'all' || category === 'resources') && results.resources.length > 0 && (
                <ResultGroup
                  title="Resources"
                  items={results.resources.map((r) => ({
                    id: r.id,
                    title: r.title,
                    meta: `${r.category} · ${r.resource_type}`,
                  }))}
                  onSelect={() => jumpTo('resources')}
                />
              )}
              {(category === 'all' || category === 'blogs') && results.blogs.length > 0 && (
                <ResultGroup
                  title="Blogs"
                  items={results.blogs.map((b) => ({
                    id: b.id,
                    title: b.title,
                    meta: `${b.author_name} · ${b.category_name}`,
                  }))}
                  onSelect={() => jumpTo('blogs')}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultGroup({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: { id: string; title: string; meta: string }[];
  onSelect: () => void;
}) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#16A34A]">
        {title}
      </h4>
      <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={onSelect}
            className="flex w-full items-center justify-between gap-4 px-3.5 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.meta}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
