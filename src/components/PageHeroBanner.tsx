import React from 'react';
import { BRAND_ASSETS } from '../lib/assets';

interface PageHeroBannerProps {
  kicker: string;
  title: string;
  description: string;
  backdrop?: keyof typeof BRAND_ASSETS;
  action?: React.ReactNode;
}

export function PageHeroBanner({
  kicker,
  title,
  description,
  backdrop = 'auroraBotanical',
  action,
}: PageHeroBannerProps) {
  return (
    <section className="relative overflow-hidden border-b border-cyan-500/30 bg-[#04091a]">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <img
          src={BRAND_ASSETS[backdrop]}
          alt=""
          className="h-full w-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020614]/90 via-[#04142d]/68 to-[#062824]/45" />
        <div className="cyber-grid-bg absolute inset-0 opacity-60" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-14 sm:py-20 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#22C55E]">
            {kicker}
          </p>
          <h1
            className="font-display font-bold tracking-tight text-white leading-tight drop-shadow-md"
            style={{ fontSize: 'clamp(2.1rem, 4.2vw, 3.25rem)' }}
          >
            {title}
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-slate-100/90">
            {description}
          </p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Bottom prismatic energy strip */}
      <div
        aria-hidden="true"
        className="relative z-10 h-[3px] w-full bg-gradient-to-r from-[#16A34A] via-[#06B6D4] via-[#2563EB] to-[#8B5CF6]"
      />
    </section>
  );
}
