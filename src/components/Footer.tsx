import React from 'react';
import { ExternalLink } from 'lucide-react';
import { BRAND_ASSETS } from '../lib/assets';
import { NAV_ITEMS } from './Navbar';
import type { SectionId, SiteContentMap } from '../types/content';

interface FooterProps {
  onNavigate: (section: SectionId) => void;
  siteContent?: SiteContentMap;
}

export function Footer({ onNavigate, siteContent }: FooterProps) {
  const socials = siteContent?.social_links || {};
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 overflow-hidden border-t border-cyan-500/30 bg-[#030816] text-slate-200">
      {/* Multi-color prismatic top beam */}
      <div
        aria-hidden="true"
        className="h-1 w-full bg-gradient-to-r from-[#16A34A] via-[#06B6D4] via-[#2563EB] to-[#8B5CF6]"
      />
      {/* Vivid Prismatic Horizon Background Artwork */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <img
          src={BRAND_ASSETS.prismaticHorizon}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020614]/95 via-[#030c22]/84 to-[#030816]/88" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={BRAND_ASSETS.logoEmblem}
                alt="CORESPACE logo"
                className="h-12 w-auto object-contain rounded-lg ring-1 ring-cyan-400/40"
              />
              <div>
                <p className="font-display text-lg font-bold tracking-tight text-white">
                  CORE<span className="cyber-spectrum-text">SPACE</span>
                </p>
                <p className="text-xs font-semibold tracking-[0.24em] text-[#22C55E]">
                  ENTER THE FUTURE.
                </p>
              </div>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-300">
              Student technology community platform for Bearys Institute of Technology, Mangalore,
              Karnataka — connecting curious minds, real opportunities, and collaborative engineering.
            </p>
            <a
              href="https://www.bitmangalore.edu.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-white hover:underline"
            >
              <span>Bearys Institute of Technology Official Website</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="md:col-span-4">
            <h3 className="font-display text-sm font-semibold text-white mb-4">
              Explore Platform
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className="text-left text-sm text-slate-300 hover:text-[#22C55E] transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="font-display text-sm font-semibold text-white mb-4">
              Institution & Connect
            </h3>
            <p className="text-sm text-slate-300">
              Bearys Institute of Technology
              <br />
              Mangalore, Karnataka, India
            </p>
            <div className="flex flex-wrap gap-3 pt-1 text-xs font-medium">
              {socials.github && (
                <a
                  href={socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 hover:text-white"
                >
                  GitHub
                </a>
              )}
              {socials.linkedin && (
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-white"
                >
                  LinkedIn
                </a>
              )}
              {socials.instagram && (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-300 hover:text-white"
                >
                  Instagram
                </a>
              )}
              {socials.youtube && (
                <a
                  href={socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-300 hover:text-white"
                >
                  YouTube
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="cyber-btn-glow mt-2 inline-flex items-center rounded-xl bg-gradient-to-r from-[#16A34A] via-[#06B6D4] to-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer"
            >
              Get in Touch
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-cyan-500/20 pt-6 text-xs text-slate-400">
          <p>© {year} CORESPACE — Bearys Institute of Technology, Mangalore.</p>
          <p className="text-cyan-300/90">Nature × Technology × Futuristic Cyber World</p>
        </div>
      </div>
    </footer>
  );
}
