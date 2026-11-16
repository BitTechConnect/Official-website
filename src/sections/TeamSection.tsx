import React, { useEffect, useState } from 'react';
import { Github, Globe, Linkedin, User } from 'lucide-react';
import { publicApi } from '../lib/api';
import { EmptyState } from '../components/EmptyState';
import { PageHeroBanner } from '../components/PageHeroBanner';
import { PerspectiveTiltCard } from '../components/PerspectiveTiltCard';
import type { TeamMemberItem } from '../types/content';

export function TeamSection() {
  const [items, setItems] = useState<TeamMemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groupFilter, setGroupFilter] = useState<'all' | 'core' | 'volunteer' | 'contributor'>('all');

  useEffect(() => {
    publicApi
      .getTeam()
      .then((res) => setItems(res.items || []))
      .catch((err) => setError(err.message || 'Unable to load team members.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = groupFilter === 'all' ? items : items.filter((m) => m.group_type === groupFilter);

  return (
    <div>
      <PageHeroBanner
        kicker="People Behind CORESPACE"
        title="Team & Contributors"
        description="Core organizers, volunteers, and student contributors maintaining CORESPACE."
        backdrop="botanicalMacro"
      />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: 'all', label: 'All Members' },
            { id: 'core', label: 'Core Team' },
            { id: 'volunteer', label: 'Volunteers' },
            { id: 'contributor', label: 'Contributors' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setGroupFilter(tab.id)}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              groupFilter === tab.id
                ? 'bg-[#16A34A] text-white'
                : 'bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Team Directory Coming Soon"
          description="Core team members, volunteers, and contributors published by the Admin will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((member) => (
            <PerspectiveTiltCard key={member.id}>
              <article className="cyber-frame h-full p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-[#16A34A] dark:text-[#22C55E] capitalize">
                    {member.group_type} · {member.role}
                  </p>
                  <h2 className="mt-1 font-display text-lg font-bold text-slate-900 dark:text-white">
                    {member.name}
                  </h2>
                </div>
                {member.bio && (
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {member.bio}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                {member.github_url && (
                  <a
                    href={member.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} GitHub`}
                    className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                )}
                {member.linkedin_url && (
                  <a
                    href={member.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} LinkedIn`}
                    className="text-slate-500 hover:text-[#2563EB]"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {member.website_url && (
                  <a
                    href={member.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} Website`}
                    className="text-slate-500 hover:text-[#16A34A]"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
              </div>
            </article>
            </PerspectiveTiltCard>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
