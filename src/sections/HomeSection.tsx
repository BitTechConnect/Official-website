import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Code2,
  Compass,
  Eye,
  EyeOff,
  ExternalLink,
  Megaphone,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { BRAND_ASSETS } from '../lib/assets';
import { EmptyState } from '../components/EmptyState';
import { PerspectiveTiltCard } from '../components/PerspectiveTiltCard';
import {
  OPPORTUNITY_CATEGORIES,
  RESOURCE_CATEGORIES,
  type OverviewResponse,
  type SectionId,
} from '../types/content';

gsap.registerPlugin(ScrollTrigger);

interface HomeSectionProps {
  overview: OverviewResponse | null;
  loading: boolean;
  onNavigate: (section: SectionId) => void;
  zen3D: boolean;
  onToggleZen3D: () => void;
}

const TRACK_PALETTES = [
  {
    border: 'border-emerald-500/40 hover:border-emerald-400',
    glow: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    bar: 'from-[#16A34A] to-[#22C55E]',
    text: 'text-[#16A34A] dark:text-[#4ADE80]',
  },
  {
    border: 'border-cyan-500/40 hover:border-cyan-400',
    glow: 'from-cyan-500/20 via-sky-500/10 to-transparent',
    bar: 'from-[#06B6D4] to-[#38BDF8]',
    text: 'text-[#0891B2] dark:text-cyan-300',
  },
  {
    border: 'border-blue-500/40 hover:border-blue-400',
    glow: 'from-blue-500/20 via-indigo-500/10 to-transparent',
    bar: 'from-[#2563EB] to-[#60A5FA]',
    text: 'text-[#2563EB] dark:text-blue-400',
  },
  {
    border: 'border-violet-500/40 hover:border-violet-400',
    glow: 'from-violet-500/20 via-purple-500/10 to-transparent',
    bar: 'from-[#7C3AED] to-[#C084FC]',
    text: 'text-[#7C3AED] dark:text-violet-300',
  },
  {
    border: 'border-teal-500/40 hover:border-teal-400',
    glow: 'from-teal-500/20 via-emerald-500/10 to-transparent',
    bar: 'from-[#14B8A6] to-[#2DD4BF]',
    text: 'text-[#0F766E] dark:text-teal-300',
  },
  {
    border: 'border-amber-500/40 hover:border-amber-400',
    glow: 'from-amber-500/18 via-orange-500/10 to-transparent',
    bar: 'from-[#F59E0B] to-[#FBBF24]',
    text: 'text-[#D97706] dark:text-amber-300',
  },
];

export function HomeSection({
  overview,
  loading,
  onNavigate,
  zen3D,
  onToggleZen3D,
}: HomeSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from('.hero-stagger', {
        y: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.09,
        ease: 'power3.out',
      });

      gsap.utils.toArray<HTMLElement>('.reveal-band').forEach((band) => {
        gsap.from(band, {
          y: 34,
          opacity: 0,
          duration: 0.72,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: band,
            start: 'top 87%',
            once: true,
          },
        });
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const announcements = overview?.announcements || [];
  const events = overview?.events || [];
  const hackathons = overview?.hackathons || [];
  const opportunities = overview?.opportunities || [];
  const projects = overview?.projects || [];
  const resources = overview?.resources || [];
  const blogs = overview?.blogs || [];
  const community = overview?.community || [];

  return (
    <div ref={containerRef} className="relative">
      {/* 1. TRANSPARENT 3D HERO OVER LIVE WEBGL CYBER-NATURE WORLD */}
      <section className="relative flex min-h-[95vh] items-center overflow-hidden bg-transparent">
        {/* Floating Pure 3D View Toggle */}
        <button
          type="button"
          onClick={onToggleZen3D}
          className="cyber-btn-glow fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-xl border border-cyan-400/55 bg-gradient-to-r from-[#051a2e]/92 via-[#072924]/92 to-[#141038]/92 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-white shadow-xl hover:brightness-125 transition-all cursor-pointer"
        >
          {zen3D ? (
            <Eye className="h-4 w-4 text-[#22C55E]" />
          ) : (
            <EyeOff className="h-4 w-4 text-cyan-300" />
          )}
          <span>{zen3D ? 'Show Hero UI' : 'Pure 3D View'}</span>
        </button>

        {/* Subtle interactive prompt when Pure 3D View is active */}
        {zen3D && (
          <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-20 rounded-xl border border-cyan-400/40 bg-[#030b1d]/80 backdrop-blur-md px-4 py-2 text-xs font-medium text-cyan-200 shadow-lg hidden sm:block">
            Interactive 3D Cyber-Nature Mode · Move cursor to steer particles &amp; holographic core
          </div>
        )}

        <div
          className={`relative z-10 mx-auto max-w-[1320px] w-full px-4 sm:px-6 lg:px-8 py-14 lg:py-20 transition-all duration-500 ${
            zen3D ? 'opacity-0 pointer-events-none scale-[0.98]' : 'opacity-100'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Boxless Open Hero Typography directly over Live 3D Background */}
            <div className="lg:col-span-7 space-y-6">
              <p className="hero-stagger text-xs sm:text-sm font-bold uppercase tracking-[0.28em] text-[#4ADE80] [text-shadow:0_2px_12px_rgba(2,6,23,0.98),0_0_16px_rgba(74,222,128,0.65)]">
                Bearys Institute of Technology · Mangalore, Karnataka
              </p>

              <h1
                className="hero-stagger cyber-glitch-text font-display font-bold tracking-tight text-white leading-[1.02] [text-shadow:0_3px_16px_rgba(0,0,0,0.98),0_6px_34px_rgba(2,6,23,0.95),0_0_26px_rgba(56,189,248,0.45)]"
                style={{ fontSize: 'clamp(2.8rem, 6.2vw, 4.9rem)', textWrap: 'balance' }}
              >
                CORE<span className="cyber-hero-spectrum">SPACE</span>
              </h1>

              <div className="hero-stagger flex items-center gap-3">
                <span className="h-[2.5px] w-14 bg-gradient-to-r from-[#4ADE80] via-[#22D3EE] to-[#A855F7] shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                <p className="font-display text-base sm:text-xl font-bold tracking-[0.28em] text-[#67E8F9] [text-shadow:0_2px_12px_rgba(0,0,0,0.98),0_0_18px_rgba(34,211,238,0.65)]">
                  ENTER THE FUTURE.
                </p>
              </div>

              <p className="hero-stagger max-w-2xl text-base sm:text-lg font-semibold leading-relaxed text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.98),0_4px_24px_rgba(2,6,23,0.92)]">
                Connecting curious minds, building innovative ideas, discovering opportunities and
                growing a stronger technology community.
              </p>

              <div className="hero-stagger flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('community')}
                  className="cyber-btn-glow inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] via-[#06B6D4] to-[#2563EB] px-6 py-3.5 text-sm font-bold text-white hover:brightness-110 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>Explore Community</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('opportunities')}
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/60 bg-[#041126]/85 backdrop-blur-md px-6 py-3.5 text-sm font-bold text-white hover:border-[#4ADE80] hover:bg-[#081d3d]/95 transition-all cursor-pointer whitespace-nowrap shadow-lg shadow-blue-950/50"
                >
                  <span>Discover Opportunities</span>
                </button>
              </div>

              {/* Colorful Multi-Spectrum Quick Ecosystem Cards */}
              <div className="hero-stagger grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                {(
                  [
                    {
                      id: 'events',
                      label: 'Events',
                      icon: Calendar,
                      style: 'border-emerald-400/55 from-emerald-500/25 to-[#041222]/90 text-[#4ADE80]',
                    },
                    {
                      id: 'hackathons',
                      label: 'Hackathons',
                      icon: Trophy,
                      style: 'border-blue-400/55 from-blue-600/25 to-[#041222]/90 text-[#60A5FA]',
                    },
                    {
                      id: 'projects',
                      label: 'Projects',
                      icon: Code2,
                      style: 'border-cyan-400/55 from-cyan-500/25 to-[#041222]/90 text-[#22D3EE]',
                    },
                    {
                      id: 'resources',
                      label: 'Resources',
                      icon: BookOpen,
                      style: 'border-violet-400/55 from-violet-600/25 to-[#041222]/90 text-[#C084FC]',
                    },
                  ] as const
                ).map((quick) => {
                  const Icon = quick.icon;
                  return (
                    <button
                      key={quick.id}
                      type="button"
                      onClick={() => onNavigate(quick.id)}
                      className={`rounded-xl border bg-gradient-to-br backdrop-blur-md px-3.5 py-3 text-left transition-all hover:-translate-y-0.5 hover:brightness-125 cursor-pointer flex items-center gap-2.5 ${quick.style}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="font-display text-xs font-bold text-white whitespace-nowrap">
                        {quick.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Holographic Triple-Orbit Emblem Stage */}
            <div className="lg:col-span-5 flex justify-center">
              <PerspectiveTiltCard className="w-full max-w-[450px]">
                <div className="relative flex items-center justify-center p-7 sm:p-9">
                  <div
                    aria-hidden="true"
                    className="orbit-spin-slow absolute inset-1 rounded-full border border-dashed border-[#22C55E]/60"
                  />
                  <div
                    aria-hidden="true"
                    className="orbit-spin-reverse absolute inset-5 rounded-full border border-cyan-400/55"
                  />
                  <div
                    aria-hidden="true"
                    className="orbit-spin-slow absolute inset-9 rounded-full border border-dotted border-violet-400/50"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-8 rounded-full bg-gradient-to-tr from-[#16A34A]/35 via-[#06B6D4]/25 to-[#8B5CF6]/35 blur-2xl"
                  />

                  <div className="cyber-frame-prism relative z-10 w-full p-5 sm:p-6">
                    <img
                      src={BRAND_ASSETS.logoEmblem}
                      alt="CORESPACE Emblem — Nature × Technology"
                      className="w-full h-auto rounded-xl object-contain"
                    />
                    <div className="mt-4 flex items-center justify-between border-t border-cyan-400/25 pt-3 text-[11px] font-semibold text-slate-200">
                      <span className="text-cyan-300">Nature × Technology</span>
                      <span aria-hidden="true" className="text-slate-400">·</span>
                      <span className="text-[#4ADE80]">BIT Mangalore</span>
                    </div>
                  </div>
                </div>
              </PerspectiveTiltCard>
            </div>
          </div>
        </div>

        {/* Bottom Rainbow Cyber Laser Strip */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-[#16A34A] via-[#06B6D4] via-[#2563EB] to-[#8B5CF6]"
        />
      </section>

      {/* LONG MULTI-BAND COLORFUL SCROLLING ARCHITECTURE */}
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 py-14 space-y-20">
        {/* 2. LATEST ANNOUNCEMENTS (Vibrant Prism Ribbon) */}
        <section className="reveal-band">
          {loading ? (
            <div className="h-24 rounded-2xl border border-cyan-500/30 bg-cyan-950/30 animate-pulse" />
          ) : announcements.length === 0 ? (
            <div className="cyber-frame overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5">
              <div
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#16A34A] via-[#06B6D4] to-[#2563EB]"
              />
              <div className="flex items-center gap-4 pl-2">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#16A34A] to-[#06B6D4] text-white shadow-lg shadow-emerald-500/30">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    Official Announcements & Campus Pulse
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-200">
                    Verified campus notices, workshop alerts, and schedules published by the Admin appear live here.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('events')}
                className="cyber-btn-glow inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#06B6D4] px-4 py-2 text-xs font-semibold text-white whitespace-nowrap cursor-pointer"
              >
                <span>View Events Calendar</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <SectionHeader
                index="01"
                title="Latest Announcements"
                subtitle="Verified campus tech bulletins and updates."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {announcements.map((item) => (
                  <div key={item.id} className="cyber-frame p-6 space-y-2 overflow-hidden">
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#16A34A] via-[#06B6D4] to-[#2563EB]"
                    />
                    <p className="text-xs font-mono-tabular font-semibold text-[#16A34A] dark:text-[#4ADE80] capitalize">
                      {item.priority} priority ·{' '}
                      {new Date(item.published_at || item.created_at).toLocaleDateString()}
                    </p>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{item.summary}</p>
                    {item.link_url && (
                      <a
                        href={item.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 pt-1 text-xs font-semibold text-[#2563EB] dark:text-cyan-300 hover:underline"
                      >
                        <span>{item.link_label || 'Open announcement'}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 3 & 4. EVENTS + HACKATHONS (2-Column Colorful Visual Photography Panels) */}
        <section className="reveal-band grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Upcoming Events */}
          <div className="lg:col-span-6 cyber-frame overflow-hidden flex flex-col justify-between">
            <div className="relative h-44 overflow-hidden border-b border-emerald-400/30 bg-[#031214]">
              <img
                src={BRAND_ASSETS.botanicalMacro}
                alt="Botanical circuit macro texture"
                loading="lazy"
                className="h-full w-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020814]/90 via-[#04241e]/45 to-emerald-600/20" />
              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <p className="text-xs font-mono font-semibold text-[#4ADE80]">02. Campus Calendar</p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">Upcoming Events</h2>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('events')}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#16A34A]/85 px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#16A34A] cursor-pointer"
                >
                  <span>All Events</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              {loading ? (
                <div className="h-28 rounded-xl bg-emerald-500/10 animate-pulse" />
              ) : events.length === 0 ? (
                <EmptyState
                  compact
                  title="Upcoming Events Coming Soon"
                  description="Workshops, seminars, webinars, and technical fests published by Admin appear here."
                  actionLabel="Suggest an Event"
                  onAction={() => onNavigate('community')}
                />
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 3).map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => onNavigate('events')}
                      className="w-full rounded-xl border border-emerald-500/30 bg-white/60 dark:bg-[#061822]/75 p-4 text-left hover:border-emerald-400 transition-colors cursor-pointer"
                    >
                      <p className="text-xs font-mono-tabular font-semibold text-[#16A34A] dark:text-[#4ADE80]">
                        {ev.category} · {ev.event_date}
                      </p>
                      <h3 className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                        {ev.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 line-clamp-1">
                        {ev.venue_or_mode}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Featured Hackathons */}
          <div className="lg:col-span-6 cyber-frame overflow-hidden flex flex-col justify-between">
            <div className="relative h-44 overflow-hidden border-b border-violet-400/30 bg-[#09061f]">
              <img
                src={BRAND_ASSETS.prismaticHorizon}
                alt="Prismatic aurora horizon with luminous crystal stream"
                loading="lazy"
                className="h-full w-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030716]/90 via-[#150d3a]/45 to-violet-600/20" />
              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <p className="text-xs font-mono font-semibold text-cyan-300">03. Competitive Innovation</p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">Featured Hackathons</h2>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('hackathons')}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#2563EB]/85 px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2563EB] cursor-pointer"
                >
                  <span>Explore All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              {loading ? (
                <div className="h-28 rounded-xl bg-blue-500/10 animate-pulse" />
              ) : hackathons.length === 0 ? (
                <EmptyState
                  compact
                  title="Verified Hackathons Updating"
                  description="Only real hackathons with verified official registration URLs are listed."
                  actionLabel="Open Directory"
                  onAction={() => onNavigate('hackathons')}
                />
              ) : (
                <div className="space-y-3">
                  {hackathons.slice(0, 3).map((hack) => (
                    <a
                      key={hack.id}
                      href={hack.official_registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl border border-blue-500/30 bg-white/60 dark:bg-[#09132e]/75 p-4 hover:border-cyan-400 transition-colors"
                    >
                      <p className="text-xs font-mono-tabular font-semibold text-[#2563EB] dark:text-cyan-300">
                        {hack.organizer} · {hack.scope} · {hack.mode}
                      </p>
                      <h3 className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                        {hack.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                        {hack.start_date} – {hack.end_date} · {hack.team_size}
                      </p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 5 & 6. FULL-BLEED CYBER-FOREST BACKDROP BAND: OPPORTUNITIES + STUDENT PROJECTS */}
        <section className="reveal-band relative overflow-hidden rounded-3xl border border-cyan-500/35 bg-[#030b1a] p-6 sm:p-10 shadow-2xl">
          <img
            src={BRAND_ASSETS.cyberForest}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-[#020817]/88 via-[#041d24]/72 to-[#0e1036]/82"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Opportunities Interactive Directory */}
            <div className="lg:col-span-5 cyber-frame-prism p-6 sm:p-7 flex flex-col justify-between space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[#4ADE80]">
                    04. Career & Growth
                  </span>
                  <Compass className="h-5 w-5 text-cyan-300" />
                </div>
                <h2 className="font-display text-2xl font-bold text-white">
                  Latest Opportunities
                </h2>
                <p className="text-sm text-slate-200/90">
                  Verified internships, scholarships, open-source programs, and conferences.
                </p>
              </div>

              {opportunities.length > 0 ? (
                <div className="space-y-3">
                  {opportunities.slice(0, 3).map((opp) => (
                    <a
                      key={opp.id}
                      href={opp.application_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl border border-cyan-400/30 bg-[#051226]/75 p-3.5 hover:border-[#22C55E] transition-colors"
                    >
                      <p className="text-xs font-semibold text-cyan-300">
                        {opp.category} · {opp.organization}
                      </p>
                      <p className="font-display text-sm font-bold text-white mt-0.5">
                        {opp.title}
                      </p>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {OPPORTUNITY_CATEGORIES.slice(0, 6).map((cat, idx) => {
                    const pal = TRACK_PALETTES[idx % TRACK_PALETTES.length];
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => onNavigate('opportunities')}
                        className={`rounded-xl border bg-gradient-to-br bg-[#061327]/75 px-3 py-2.5 text-left text-xs font-semibold text-white transition-all hover:-translate-y-0.5 cursor-pointer truncate ${pal.border} ${pal.glow}`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={() => onNavigate('opportunities')}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#4ADE80] hover:text-cyan-300 cursor-pointer"
              >
                <span>Browse All 9 Opportunity Tracks</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Student Projects Showcase */}
            <div className="lg:col-span-7 cyber-frame-prism p-6 sm:p-7 flex flex-col justify-between space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-mono font-semibold text-cyan-300">
                    05. Student Engineering
                  </p>
                  <h2 className="font-display text-2xl font-bold text-white">
                    Featured Student Projects
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('projects')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4ADE80] hover:text-cyan-300 cursor-pointer"
                >
                  <span>Open Showcase</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {loading ? (
                <div className="h-44 rounded-xl bg-cyan-950/40 animate-pulse" />
              ) : projects.length === 0 ? (
                <div className="relative overflow-hidden rounded-2xl border border-cyan-400/35 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <img
                    src={BRAND_ASSETS.digitalNatureHorizon}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover opacity-55"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#020818]/90 via-[#051a2e]/75 to-[#0b2320]/65" />
                  <div className="relative z-10 space-y-2 max-w-md">
                    <p className="font-display text-lg font-bold text-white">
                      Share Your Engineering Build With BIT
                    </p>
                    <p className="text-sm text-slate-200">
                      Submit your software, AI, robotics, or open-source project without creating an
                      account. Approved builds appear in the 3D showcase.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('community')}
                    className="relative z-10 cyber-btn-glow shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#16A34A] via-[#06B6D4] to-[#2563EB] px-5 py-3 text-xs font-semibold text-white cursor-pointer"
                  >
                    <Code2 className="h-4 w-4" />
                    <span>Submit Project</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.slice(0, 2).map((proj) => (
                    <PerspectiveTiltCard key={proj.id}>
                      <article
                        onClick={() => onNavigate('projects')}
                        className="h-full rounded-xl border border-cyan-400/35 bg-[#061529]/80 p-5 space-y-2 cursor-pointer hover:border-[#22C55E] transition-colors"
                      >
                        <p className="text-xs font-semibold text-[#4ADE80]">
                          {proj.category} · {proj.student_or_team_name}
                        </p>
                        <h3 className="font-display text-base font-bold text-white">
                          {proj.title}
                        </h3>
                        <p className="text-xs text-slate-200 line-clamp-2">
                          {proj.description}
                        </p>
                        {proj.tech_stack?.length > 0 && (
                          <p className="text-[11px] font-mono text-cyan-300">
                            {proj.tech_stack.slice(0, 4).join(' · ')}
                          </p>
                        )}
                      </article>
                    </PerspectiveTiltCard>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 7. TECHNICAL RESOURCES (12-Track Multi-Color Spectrum Cyber Matrix) */}
        <section className="reveal-band space-y-6">
          <SectionHeader
            index="06"
            title="Technical Resources Matrix"
            subtitle="Roadmaps, official documentation, and study tracks across 12 core engineering domains."
            icon={<Sparkles className="h-5 w-5 text-cyan-400" />}
            actionLabel="Open Resources Hub"
            onAction={() => onNavigate('resources')}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {RESOURCE_CATEGORIES.map((cat, idx) => {
              const count = resources.filter((r) => r.category === cat).length;
              const pal = TRACK_PALETTES[idx % TRACK_PALETTES.length];
              return (
                <PerspectiveTiltCard key={cat}>
                  <button
                    type="button"
                    onClick={() => onNavigate('resources')}
                    className={`cyber-frame w-full overflow-hidden p-4 text-left transition-all hover:-translate-y-0.5 cursor-pointer group ${pal.border}`}
                  >
                    <div
                      aria-hidden="true"
                      className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${pal.bar}`}
                    />
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${pal.glow}`}
                    />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                        <span>{String(idx + 1).padStart(2, '0')}</span>
                        <ArrowRight className={`h-3.5 w-3.5 ${pal.text} opacity-70 group-hover:opacity-100 transition-opacity`} />
                      </div>
                      <p className="mt-2 font-display text-sm font-bold text-slate-900 dark:text-white">
                        {cat}
                      </p>
                      <p className={`mt-1 text-xs font-mono-tabular font-semibold ${pal.text}`}>
                        {count > 0 ? `${count} verified links` : 'Explore track'}
                      </p>
                    </div>
                  </button>
                </PerspectiveTiltCard>
              );
            })}
          </div>
        </section>

        {/* 8 & 9. BLOGS & COMMUNITY COLLABORATION SPLIT */}
        <section className="reveal-band grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-6 cyber-frame overflow-hidden flex flex-col justify-between">
            <div className="relative h-32 overflow-hidden border-b border-cyan-400/25 bg-[#041421]">
              <img
                src={BRAND_ASSETS.digitalNatureHorizon}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#020817]/90 via-[#041b26]/70 to-transparent" />
              <div className="relative z-10 h-full px-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono font-semibold text-[#4ADE80]">
                    07. Knowledge Exchange
                  </p>
                  <h2 className="font-display text-2xl font-bold text-white">
                    Latest Technology Blogs
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('blogs')}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#2563EB]/85 px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2563EB] cursor-pointer"
                >
                  <span>All Articles</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              {blogs.length === 0 ? (
                <EmptyState
                  compact
                  title="Technical Articles Coming Soon"
                  description="Share hackathon retrospectives, tutorials, and project deep-dives with BIT peers."
                  actionLabel="Pitch an Article"
                  onAction={() => onNavigate('community')}
                />
              ) : (
                <div className="space-y-3">
                  {blogs.slice(0, 3).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => onNavigate('blogs')}
                      className="w-full rounded-xl border border-cyan-500/30 bg-white/60 dark:bg-[#061829]/70 p-4 text-left hover:border-[#2563EB] cursor-pointer"
                    >
                      <p className="text-xs text-slate-600 dark:text-cyan-300">
                        {b.category_name} · {b.reading_time_minutes} min read
                      </p>
                      <h3 className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                        {b.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                        By {b.author_name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 cyber-frame overflow-hidden flex flex-col justify-between">
            <div className="relative h-32 overflow-hidden border-b border-emerald-400/25 bg-[#041812]">
              <img
                src={BRAND_ASSETS.auroraBotanical}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#020817]/90 via-[#04241b]/70 to-transparent" />
              <div className="relative z-10 h-full px-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono font-semibold text-cyan-300">
                    08. Peer Collaboration
                  </p>
                  <h2 className="font-display text-2xl font-bold text-white">
                    Community Highlights
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('community')}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#16A34A]/85 px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#16A34A] cursor-pointer"
                >
                  <span>Open Hub</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              {community.length > 0 ? (
                <div className="space-y-3">
                  {community.slice(0, 3).map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-emerald-500/30 bg-white/60 dark:bg-[#061822]/70 p-4"
                    >
                      <p className="text-xs font-semibold text-[#16A34A] dark:text-[#4ADE80] capitalize">
                        {c.submission_type.replace('_', ' ')} · {c.submitter_name}
                      </p>
                      <h3 className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                        {c.title}
                      </h3>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      label: 'Find Teammates',
                      desc: 'Recruit partners for hackathons & builds.',
                      accent: 'border-emerald-500/40 from-emerald-500/15 to-transparent text-[#16A34A] dark:text-[#4ADE80]',
                    },
                    {
                      label: 'Submit a Project',
                      desc: 'Get your work reviewed for the showcase.',
                      accent: 'border-cyan-500/40 from-cyan-500/15 to-transparent text-[#0891B2] dark:text-cyan-300',
                    },
                    {
                      label: 'Suggest an Event',
                      desc: 'Propose campus workshops & talks.',
                      accent: 'border-blue-500/40 from-blue-500/15 to-transparent text-[#2563EB] dark:text-blue-400',
                    },
                    {
                      label: 'Share an Idea',
                      desc: 'Spark peer learning circles at BIT.',
                      accent: 'border-violet-500/40 from-violet-500/15 to-transparent text-[#7C3AED] dark:text-violet-300',
                    },
                  ].map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => onNavigate('community')}
                      className={`rounded-xl border bg-gradient-to-br bg-white/65 dark:bg-[#071426]/80 p-4 text-left transition-all hover:-translate-y-0.5 cursor-pointer ${action.accent}`}
                    >
                      <p className="font-display text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{action.label}</span>
                        <Users className="h-4 w-4" />
                      </p>
                      <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">{action.desc}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 10. AUTHENTIC BIT CAMPUS NATURE × TECHNOLOGY SHOWCASE */}
        <section className="reveal-band cyber-frame overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-center space-y-5 relative">
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#16A34A] via-[#06B6D4] to-[#2563EB]"
            />
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#16A34A] dark:text-[#4ADE80]">
              Bearys Institute of Technology · Mangalore
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white leading-tight">
              Rooted in Coastal Greenery. Built for Future Engineering.
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-200">
              Nestled among lush hills overlooking the Netravati river valley, BIT combines natural
              tranquility with hands-on technical curiosity.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('about')}
                className="cyber-btn-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#2563EB] px-5 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer"
              >
                <span>Explore About BIT</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <a
                href="https://www.bitmangalore.edu.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-white/70 dark:bg-slate-900/70 px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white hover:border-[#16A34A]"
              >
                <span>Official Website</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gradient-to-br from-emerald-500/15 via-cyan-500/15 to-blue-600/20">
            <div className="overflow-hidden rounded-xl ring-1 ring-emerald-400/35">
              <img
                src={BRAND_ASSETS.campusAerial}
                alt="Aerial panorama of Bearys Institute of Technology campus in Mangalore surrounded by green hills"
                loading="lazy"
                className="h-full min-h-[240px] w-full object-cover hover:scale-[1.03] transition-transform duration-500"
              />
            </div>
            <div className="overflow-hidden rounded-xl ring-1 ring-cyan-400/35">
              <img
                src={BRAND_ASSETS.campusBuilding}
                alt="Bearys Institute of Technology architectural campus building framed by lush trees"
                loading="lazy"
                className="h-full min-h-[240px] w-full object-cover hover:scale-[1.03] transition-transform duration-500"
              />
            </div>
          </div>
        </section>

        {/* 11. FINAL CALL TO ACTION (Full Vivid Prismatic Horizon) */}
        <section className="reveal-band relative overflow-hidden rounded-3xl border border-cyan-400/45 bg-[#030714] shadow-2xl">
          <img
            src={BRAND_ASSETS.prismaticHorizon}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <div className="relative z-10 bg-gradient-to-r from-[#020818]/85 via-[#071734]/68 to-[#190a36]/75 px-6 py-16 sm:px-12 sm:py-20 text-center space-y-5">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#4ADE80]">
              CORESPACE · ENTER THE FUTURE.
            </p>
            <h2 className="mx-auto max-w-2xl font-display text-2xl sm:text-4xl font-bold text-white drop-shadow-md">
              Collaborate, Build, and Grow the BIT Tech Ecosystem
            </h2>
            <p className="mx-auto max-w-xl text-sm sm:text-base text-slate-100/90">
              Submit a project, find teammates without creating an account, or message the team.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('community')}
                className="cyber-btn-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#16A34A] via-[#06B6D4] to-[#2563EB] px-6 py-3.5 text-sm font-semibold text-white cursor-pointer"
              >
                <span>Submit an Idea</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="rounded-xl border border-cyan-300/50 bg-[#05152e]/75 backdrop-blur-md px-6 py-3.5 text-sm font-semibold text-white hover:border-[#22C55E] transition-colors cursor-pointer"
              >
                Contact Team
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeader({
  index,
  title,
  subtitle,
  icon,
  actionLabel,
  onAction,
}: {
  index: string;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-cyan-500/35 pb-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#15803D] dark:text-[#4ADE80]">
          <span>{index}.</span>
          {icon}
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white tracking-tight dark:[text-shadow:0_2px_14px_rgba(0,0,0,0.9)]">
          {title}
        </h2>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 dark:[text-shadow:0_1px_10px_rgba(0,0,0,0.85)]">
          {subtitle}
        </p>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="cyber-btn-glow inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#06B6D4] px-4 py-2.5 text-xs font-bold text-white whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
