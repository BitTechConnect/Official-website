import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { publicApi } from '../lib/api';
import { EmptyState } from '../components/EmptyState';
import { PageHeroBanner } from '../components/PageHeroBanner';
import { OPPORTUNITY_CATEGORIES, type OpportunityItem } from '../types/content';

export function OpportunitiesSection() {
  const [items, setItems] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [paidFilter, setPaidFilter] = useState<string>('all');

  useEffect(() => {
    publicApi
      .getOpportunities()
      .then((res) => setItems(res.items || []))
      .catch((err) => setError(err.message || 'Unable to load opportunities.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((o) => {
      if (category !== 'all' && o.category !== category) return false;
      if (paidFilter !== 'all' && o.paid_status !== paidFilter) return false;
      if (q) {
        const hay = `${o.title} ${o.organization} ${o.description} ${o.eligibility}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, category, paidFilter, query]);

  return (
    <div>
      <PageHeroBanner
        kicker="Verified Student Pathways"
        title="Opportunities"
        description="Internships, scholarships, open-source programs, research calls, and conferences with transparent official sources and verification status."
        backdrop="cyberForest"
      />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Category Filter Strip */}
      <div className="cyber-frame space-y-3 p-4">
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
            All Categories
          </button>
          {OPPORTUNITY_CATEGORIES.map((cat) => (
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
              placeholder="Search internships, scholarships, organizations..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <select
            value={paidFilter}
            onChange={(e) => setPaidFilter(e.target.value)}
            aria-label="Filter by compensation or fee status"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Compensation / Fee Status</option>
            <option value="paid">Paid</option>
            <option value="stipend">Stipend</option>
            <option value="free">Free</option>
            <option value="unpaid">Unpaid</option>
          </select>
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
            <div key={i} className="h-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Opportunities Coming Soon"
          description="Only genuine, source-attributed opportunities reviewed by the Admin are published here. Unverified links are never marked as verified."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((opp) => (
            <article
              key={opp.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-[#071024]/85 backdrop-blur-md p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {opp.category} · <span className="capitalize">{opp.paid_status}</span>
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      opp.verification_status === 'verified'
                        ? 'text-[#16A34A] dark:text-[#22C55E]'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {opp.verification_status === 'verified' ? (
                      <ShieldCheck className="h-3.5 w-3.5" />
                    ) : (
                      <ShieldAlert className="h-3.5 w-3.5" />
                    )}
                    <span>{opp.verification_status === 'verified' ? 'Verified' : 'Unverified'}</span>
                  </span>
                </div>

                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  {opp.title}
                </h2>
                <p className="text-xs font-semibold text-[#2563EB] dark:text-blue-400">
                  {opp.organization}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {opp.description}
                </p>
                <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <p>Eligibility: {opp.eligibility}</p>
                  <p className="font-mono-tabular">
                    Deadline: {opp.deadline || 'Rolling / See official source'}
                  </p>
                  <p>Official Source: {opp.official_source}</p>
                </div>
              </div>

              <a
                href={opp.application_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
              >
                <span>Apply at Official Source</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </article>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
