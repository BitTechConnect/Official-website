import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { publicApi } from '../lib/api';
import { EmptyState } from '../components/EmptyState';
import { PageHeroBanner } from '../components/PageHeroBanner';
import type { HackathonItem } from '../types/content';

export function HackathonsSection() {
  const [items, setItems] = useState<HackathonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('all');
  const [scope, setScope] = useState('all');
  const [participation, setParticipation] = useState('all');
  const [timeframe, setTimeframe] = useState<'upcoming' | 'past' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'start'>('deadline');

  useEffect(() => {
    publicApi
      .getHackathons()
      .then((res) => setItems(res.items || []))
      .catch((err) => setError(err.message || 'Unable to load hackathons.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const today = new Date().toISOString().split('T')[0];

    const list = items.filter((h) => {
      if (timeframe === 'upcoming' && h.end_date < today) return false;
      if (timeframe === 'past' && h.end_date >= today) return false;
      if (mode !== 'all' && h.mode !== mode) return false;
      if (scope !== 'all' && h.scope !== scope) return false;
      if (participation !== 'all' && h.participation_type !== participation) return false;
      if (q) {
        const hay = `${h.name} ${h.organizer} ${h.description} ${h.eligibility}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      const valA = sortBy === 'deadline' ? a.registration_deadline || a.start_date : a.start_date;
      const valB = sortBy === 'deadline' ? b.registration_deadline || b.start_date : b.start_date;
      return valA.localeCompare(valB);
    });
  }, [items, timeframe, mode, scope, participation, query, sortBy]);

  return (
    <div>
      <PageHeroBanner
        kicker="Verified Hackathon Discovery"
        title="Hackathons"
        description="Discover national, international, online, and offline hackathons with verified official registration URLs. No synthetic listings are ever generated."
        backdrop="prismaticHorizon"
      />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Filters */}
      <div className="cyber-frame grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 p-4">
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hackathons or organizers..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#2563EB] focus:outline-none"
          />
        </div>

        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as 'upcoming' | 'past' | 'all')}
          aria-label="Filter by timeframe"
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
        >
          <option value="all">All Timeframes</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>

        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          aria-label="Filter by scope"
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
        >
          <option value="all">All Scopes</option>
          <option value="national">National</option>
          <option value="international">International</option>
          <option value="regional">Regional</option>
        </select>

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          aria-label="Filter by mode"
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
        >
          <option value="all">All Modes</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="hybrid">Hybrid</option>
        </select>

        <select
          value={`${participation}:${sortBy}`}
          onChange={(e) => {
            const [p, s] = e.target.value.split(':');
            setParticipation(p);
            setSortBy(s as 'deadline' | 'start');
          }}
          aria-label="Participation and sorting"
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
        >
          <option value="all:deadline">Sort: Deadline (All)</option>
          <option value="all:start">Sort: Start Date (All)</option>
          <option value="team:deadline">Team Only · Deadline</option>
          <option value="individual:deadline">Individual Only · Deadline</option>
        </select>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Published Hackathons Match Your Filters"
          description="Genuine hackathons are added and verified manually by the Admin before appearing here. Check back soon for verified national and international competitions."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((hack) => (
            <article
              key={hack.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-[#071024]/85 backdrop-blur-md p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 capitalize">
                    {hack.organizer} · {hack.scope} · {hack.mode} · {hack.participation_type}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      hack.verification_status === 'verified'
                        ? 'text-[#16A34A] dark:text-[#22C55E]'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {hack.verification_status === 'verified' ? (
                      <ShieldCheck className="h-3.5 w-3.5" />
                    ) : (
                      <ShieldAlert className="h-3.5 w-3.5" />
                    )}
                    <span>{hack.verification_status === 'verified' ? 'Verified' : 'Unverified'}</span>
                  </span>
                </div>

                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  {hack.name}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {hack.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800">
                  <p className="font-mono-tabular">
                    Dates: {hack.start_date} – {hack.end_date}
                  </p>
                  <p className="font-mono-tabular">
                    Deadline: {hack.registration_deadline || 'See official site'}
                  </p>
                  <p>Team Size: {hack.team_size}</p>
                  <p>Eligibility: {hack.eligibility}</p>
                  {hack.prize_details && (
                    <p className="col-span-2 text-[#16A34A] dark:text-[#22C55E] font-medium">
                      Prizes: {hack.prize_details}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <a
                  href={hack.official_registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  <span>Official Registration</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
