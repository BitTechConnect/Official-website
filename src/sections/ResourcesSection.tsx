import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, ExternalLink, Search } from 'lucide-react';
import { publicApi } from '../lib/api';
import { EmptyState } from '../components/EmptyState';
import { PageHeroBanner } from '../components/PageHeroBanner';
import { PerspectiveTiltCard } from '../components/PerspectiveTiltCard';
import { RESOURCE_CATEGORIES, type ResourceItem } from '../types/content';

const RESOURCE_TYPES = [
  'Learning Roadmap',
  'Free Resource',
  'Tutorial',
  'Documentation',
  'Study Material',
  'Video Resource',
  'Beginner Guide',
] as const;

export function ResourcesSection() {
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [resourceType, setResourceType] = useState<string>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    publicApi
      .getResources()
      .then((res) => setItems(res.items || []))
      .catch((err) => setError(err.message || 'Unable to load resources.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((r) => {
      if (category !== 'all' && r.category !== category) return false;
      if (resourceType !== 'all' && r.resource_type !== resourceType) return false;
      if (q) {
        const hay = `${r.title} ${r.description} ${r.category} ${r.provider || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, category, resourceType, query]);

  return (
    <div>
      <PageHeroBanner
        kicker="Curated Engineering Knowledge"
        title="Technical Resources"
        description="Learning roadmaps, official documentation, free tutorials, study materials, and beginner guides across 12 core computer science tracks."
        backdrop="digitalNatureHorizon"
      />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Category Grid */}
      <div className="cyber-frame p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              category === 'all'
                ? 'bg-[#16A34A] text-white'
                : 'bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            All Tracks
          </button>
          {RESOURCE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                category === cat
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search roadmaps, docs, tutorials..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
            aria-label="Filter by resource format"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Formats</option>
            {RESOURCE_TYPES.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Resources Coming Soon for This Selection"
          description="Verified study materials, official docs, and roadmaps published by the Admin will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((res) => (
            <PerspectiveTiltCard key={res.id}>
              <article className="cyber-frame h-full p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {res.category} · {res.resource_type} · <span className="capitalize">{res.difficulty}</span>
                  </p>
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-[#16A34A] shrink-0 mt-1" />
                    <span>{res.title}</span>
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {res.description}
                  </p>
                  {res.provider && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Source: {res.provider}
                    </p>
                  )}
                </div>

                <a
                  href={res.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] dark:text-blue-400 hover:underline"
                >
                  <span>Open Resource Link</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </article>
            </PerspectiveTiltCard>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
