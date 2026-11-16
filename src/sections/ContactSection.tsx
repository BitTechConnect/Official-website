import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Loader2, Mail, MapPin, Send } from 'lucide-react';
import { publicApi } from '../lib/api';
import { PageHeroBanner } from '../components/PageHeroBanner';
import type { SiteContentMap } from '../types/content';

function GitHubBrandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 0.297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function InstagramBrandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export function ContactSection({ siteContent }: { siteContent?: SiteContentMap }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [formLoadedAt, setFormLoadedAt] = useState(() => Date.now());

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const socials = siteContent?.social_links || {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await publicApi.submitContact({
        name,
        email,
        subject,
        message,
        honeypot,
        formLoadedAt,
      });
      setSuccess(res.message);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setFormLoadedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeroBanner
        kicker="Connect With Us"
        title="Contact CORESPACE"
        description="Questions about campus events, collaborations, opportunities, or community initiatives? Send a message directly to the CORESPACE team."
        backdrop="prismaticHorizon"
      />
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 cyber-frame space-y-6 p-6 sm:p-8">
          <div className="space-y-2">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Community Channels
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
              <MapPin className="h-4 w-4 text-[#16A34A] shrink-0 mt-1" />
              <span>Bearys Institute of Technology, Mangalore, Karnataka, India</span>
            </p>
            {socials.email && (
              <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#2563EB]" />
                <a href={`mailto:${socials.email}`} className="hover:underline">
                  {socials.email}
                </a>
              </p>
            )}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-3.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Follow &amp; Connect
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <a
                href="https://github.com/BitTechConnect"
                target="_blank"
                rel="noopener noreferrer"
                className="group cyber-btn-glow relative flex items-center justify-between gap-3 rounded-xl border border-[#2563EB]/35 bg-gradient-to-r from-[#2563EB]/10 via-white/80 to-[#16A34A]/10 dark:from-[#2563EB]/20 dark:via-[#07142a]/90 dark:to-[#16A34A]/15 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2563EB] hover:shadow-[0_0_24px_-4px_rgba(37,99,235,0.55)]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-md shadow-blue-600/35 transition-transform duration-300 group-hover:scale-110">
                    <GitHubBrandIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold text-slate-900 dark:text-white">
                      GitHub
                    </p>
                    <p className="truncate text-xs text-slate-600 dark:text-slate-300">
                      github.com/BitTechConnect
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-[#2563EB] dark:text-blue-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              <a
                href="https://www.instagram.com/bit.tech.connects/"
                target="_blank"
                rel="noopener noreferrer"
                className="group cyber-btn-glow relative flex items-center justify-between gap-3 rounded-xl border border-[#16A34A]/35 bg-gradient-to-r from-[#16A34A]/10 via-white/80 to-[#2563EB]/10 dark:from-[#16A34A]/20 dark:via-[#061822]/90 dark:to-[#2563EB]/15 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#16A34A] hover:shadow-[0_0_24px_-4px_rgba(22,163,74,0.55)]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#16A34A] text-white shadow-md shadow-emerald-600/35 transition-transform duration-300 group-hover:scale-110">
                    <InstagramBrandIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold text-slate-900 dark:text-white">
                      Instagram
                    </p>
                    <p className="truncate text-xs text-slate-600 dark:text-slate-300">
                      @bit.tech.connects
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-[#16A34A] dark:text-[#22C55E] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 cyber-frame space-y-4 p-6 sm:p-8"
        >
          {/* Honeypot */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="contact-website">Website</label>
            <input
              id="contact-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-[#16A34A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-[#16A34A] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject *
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={200}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Topic of your inquiry"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-[#16A34A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Message *
            </label>
            <textarea
              required
              minLength={10}
              maxLength={3000}
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:border-[#16A34A] focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          {success && (
            <div className="flex items-start gap-2 rounded-lg border border-[#16A34A]/30 bg-[#16A34A]/10 p-3 text-xs text-[#16A34A] dark:text-[#22C55E]">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="cyber-btn-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60 transition-all cursor-pointer"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span>{submitting ? 'Sending...' : 'Send Message'}</span>
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
