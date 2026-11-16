import React from 'react';
import { ArrowRight, Sprout } from 'lucide-react';
import { BRAND_ASSETS } from '../lib/assets';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`cyber-frame overflow-hidden ${
        compact ? 'p-6 sm:p-7' : 'p-8 md:p-10 text-center'
      }`}
    >
      <img
        src={BRAND_ASSETS.auroraBotanical}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-22 dark:opacity-35"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/12 via-cyan-500/10 to-violet-500/15 dark:from-[#041418]/75 dark:via-[#061129]/70 dark:to-[#130b2e]/75"
      />
      <div className={`relative z-10 ${compact ? 'flex flex-col sm:flex-row sm:items-center justify-between gap-5' : ''}`}>
        <div className={compact ? 'flex items-start gap-4' : ''}>
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#06B6D4]/45 bg-gradient-to-br from-[#16A34A]/25 to-[#2563EB]/25 text-[#16A34A] dark:text-[#22C55E] shadow-lg shadow-emerald-500/15 ${
              compact ? '' : 'mx-auto mb-4'
            }`}
          >
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p
              className={`mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200 ${
                compact ? 'max-w-xl' : 'mx-auto max-w-lg'
              }`}
            >
              {description}
            </p>
          </div>
        </div>

        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className={`${
              compact ? 'shrink-0 self-start sm:self-center' : 'mt-5'
            } cyber-btn-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#16A34A] via-[#06B6D4] to-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer whitespace-nowrap`}
          >
            <span>{actionLabel}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
