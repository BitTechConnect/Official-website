import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, ExternalLink, MapPin, Search, X } from 'lucide-react';
import { publicApi } from '../lib/api';
import { BRAND_ASSETS } from '../lib/assets';
import { EmptyState } from '../components/EmptyState';
import { PageHeroBanner } from '../components/PageHeroBanner';
import { PerspectiveTiltCard } from '../components/PerspectiveTiltCard';
import { EVENT_CATEGORIES, type EventItem, type SectionId } from '../types/content';

export function EventsSection({ onNavigate }: { onNavigate: (s: SectionId) => void }) {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [tab, setTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [selected, setSelected] = useState<EventItem | null>(null);

  useEffect(() => {
    publicApi
      .getEvents()
      .then((res) => setItems(res.items || []))
      .catch((err) => setError(err.message || 'Unable to load events.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((ev) => {
      if (tab === 'upcoming' && (ev.status === 'completed' || ev.status === 'cancelled')) return false;
      if (tab === 'past' && ev.status !== 'completed') return false;
      if (category !== 'all' && ev.category !== category) return false;
      if (q) {
        const hay = `${ev.title} ${ev.description} ${ev.organizer} ${ev.venue_or_mode}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, tab, category, query]);

  return (
    <div>
      <PageHeroBanner
        kicker="Campus & Technical Calendar"
        title="Events & Workshops"
        description="Workshops, seminars, webinars, coding competitions, technical fests, and community sessions."
        backdrop="botanicalMacro"
      />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Filters & Search */}
      <div className="cyber-frame flex flex-col lg:flex-row gap-4 lg:items-center justify-between p-4">
        <div className="flex flex-wrap items-center gap-2">
          {(['upcoming', 'past', 'all'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                tab === t
                  ? 'bg-[#16A34A] text-white'
                  : 'bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {t === 'all' ? 'All Events' : `${t} Events`}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter events by category"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Categories</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full sm:w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#2563EB] focus:outline-none"
            />
          </div>
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
          title="No Matching Events Published Yet"
          description="Only verified, Admin-published events appear here. Have an idea for a seminar or workshop? Propose it in the Community section."
          actionLabel="Suggest an Event"
          onAction={() => onNavigate('community')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ev) => (
            <PerspectiveTiltCard key={ev.id}>
              <article
                onClick={() => setSelected(ev)}
                className="h-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-[#071024]/85 backdrop-blur-md flex flex-col justify-between cursor-pointer hover:border-[#16A34A]/60 transition-colors"
              >
                <div>
                  <div className="aspect-[16/9] w-full overflow-hidden bg-slate-900">
                    <img
                      src={ev.image_url || BRAND_ASSETS.botanicalMacro}
                      alt={ev.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-5 space-y-2.5">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
                      {ev.category} · {ev.event_date}
                    </p>
                    <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                      {ev.title}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                      {ev.description}
                    </p>
                  </div>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 px-5 py-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="truncate max-w-[65%]">{ev.venue_or_mode}</span>
                  <span className="font-semibold text-[#2563EB] dark:text-blue-400">Details</span>
                </div>
              </article>
            </PerspectiveTiltCard>
          ))}
        </div>
      )}

      {/* Event Detail Modal */}
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
                src={selected.image_url || BRAND_ASSETS.botanicalMacro}
                alt={selected.title}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close event details"
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900/80 text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 sm:p-8 space-y-5">
              <p className="text-xs font-medium text-[#16A34A] dark:text-[#22C55E]">
                {selected.category} · Status: {selected.status}
              </p>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                {selected.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300 border-y border-slate-200 dark:border-slate-800 py-4">
                <p className="flex items-center gap-2 font-mono-tabular">
                  <Calendar className="h-4 w-4 text-[#2563EB]" />
                  <span>Date: {selected.event_date}</span>
                </p>
                {selected.event_time && (
                  <p className="flex items-center gap-2 font-mono-tabular">
                    <Clock className="h-4 w-4 text-[#16A34A]" />
                    <span>Time: {selected.event_time}</span>
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#16A34A]" />
                  <span>{selected.venue_or_mode}</span>
                </p>
                <p>Organizer: {selected.organizer}</p>
                {selected.registration_deadline && (
                  <p className="font-mono-tabular">
                    Registration Deadline: {selected.registration_deadline}
                  </p>
                )}
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {selected.description}
              </p>
              {selected.registration_link && (
                <a
                  href={selected.registration_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                >
                  <span>Open Official Registration</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
