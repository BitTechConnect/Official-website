import React, { useState } from 'react';
import { Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { BRAND_ASSETS } from '../lib/assets';
import type { SectionId } from '../types/content';

export const NAV_ITEMS: { id: SectionId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About BIT' },
  { id: 'events', label: 'Events' },
  { id: 'hackathons', label: 'Hackathons' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'projects', label: 'Projects' },
  { id: 'resources', label: 'Resources' },
  { id: 'blogs', label: 'Blogs' },
  { id: 'community', label: 'Community' },
  { id: 'team', label: 'Team' },
  { id: 'contact', label: 'Contact' },
];

interface NavbarProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
  onOpenSearch: () => void;
}

export function Navbar({ activeSection, onNavigate, onOpenSearch }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (id: SectionId) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-cyan-500/25 dark:border-cyan-400/20 bg-gradient-to-r from-emerald-50/85 via-cyan-50/85 to-indigo-50/85 dark:from-[#030714]/88 dark:via-[#061428]/88 dark:to-[#0a0c26]/88 backdrop-blur-xl shadow-lg shadow-blue-950/5 dark:shadow-black/40">
      {/* Multi-Spectrum Top Laser Accent */}
      <div
        aria-hidden="true"
        className="h-[2.5px] w-full bg-gradient-to-r from-[#16A34A] via-[#06B6D4] via-[#2563EB] to-[#8B5CF6]"
      />
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand Lockup with authentic uploaded logo */}
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] rounded-lg py-1"
        >
          <img
            src={BRAND_ASSETS.logoEmblem}
            alt="CORESPACE emblem"
            className="h-9 w-auto object-contain rounded-md ring-1 ring-cyan-400/40"
          />
          <span className="font-display text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
            CORE<span className="cyber-spectrum-text">SPACE</span>
          </span>
        </button>

        {/* Desktop Single-Row Navigation (11 required sections) */}
        <nav
          aria-label="Primary Navigation"
          className="hidden xl:flex items-center gap-3.5"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`relative py-1.5 text-[13px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#16A34A] dark:text-[#22C55E]'
                    : 'text-slate-700 dark:text-slate-200 hover:text-[#2563EB] dark:hover:text-cyan-300'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-[#16A34A] via-[#06B6D4] to-[#2563EB]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Actions: Global Search + Colorful Theme Toggle + Mobile Drawer Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search platform"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-cyan-500/35 dark:border-cyan-400/30 bg-white/75 dark:bg-slate-900/75 px-3 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:border-[#2563EB] hover:text-[#2563EB] dark:hover:text-cyan-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Search className="h-4 w-4 text-[#06B6D4]" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden md:inline rounded border border-cyan-500/30 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:text-cyan-300">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to Aurora Light Mode' : 'Switch to Cyber Dark Mode'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/40 dark:border-blue-400/40 bg-gradient-to-br from-[#16A34A]/15 via-[#06B6D4]/15 to-[#2563EB]/20 text-slate-900 dark:text-white hover:brightness-110 transition-all cursor-pointer shadow-sm"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-300" />
            ) : (
              <Moon className="h-4 w-4 text-[#2563EB]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="xl:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/35 bg-white/75 dark:bg-slate-900/75 text-slate-800 dark:text-slate-100 cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Tablet / Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="xl:hidden border-t border-cyan-500/25 bg-gradient-to-b from-emerald-50/95 to-indigo-50/95 dark:from-[#040a1c]/95 dark:to-[#071624]/95 backdrop-blur-xl px-4 py-4"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`flex items-center justify-start rounded-lg px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#16A34A]/20 to-[#2563EB]/20 text-[#16A34A] dark:text-[#22C55E] border border-[#16A34A]/45'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/70'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
