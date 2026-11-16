import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Search } from 'lucide-react';
import { publicApi } from '../lib/api';
import { BRAND_ASSETS } from '../lib/assets';
import { EmptyState } from '../components/EmptyState';
import { PageHeroBanner } from '../components/PageHeroBanner';
import { PerspectiveTiltCard } from '../components/PerspectiveTiltCard';
import type { BlogItem, SectionId } from '../types/content';

export function BlogsSection({ onNavigate }: { onNavigate: (s: SectionId) => void }) {
  const [items, setItems] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [readingBlog, setReadingBlog] = useState<BlogItem | null>(null);

  useEffect(() => {
    publicApi
      .getBlogs()
      .then((res) => setItems(res.items || []))
      .catch((err) => setError(err.message || 'Unable to load articles.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((b) => {
      if (b.category_name) set.add(b.category_name);
    });
    return ['all', ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((b) => {
      if (category !== 'all' && b.category_name !== category) return false;
      if (q) {
        const hay = `${b.title} ${b.excerpt} ${b.author_name} ${b.category_name}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, category, query]);

  if (readingBlog) {
    return (
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 space-y-8">
        <button
          type="button"
          onClick={() => setReadingBlog(null)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#2563EB] dark:text-blue-400 hover:underline cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Articles</span>
        </button>

        <header className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
            {readingBlog.category_name} · {readingBlog.reading_time_minutes} min read ·{' '}
            {new Date(readingBlog.published_at || readingBlog.created_at).toLocaleDateString()}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
            {readingBlog.title}
          </h1>
          <p className="text-sm font-medium text-[#16A34A] dark:text-[#22C55E]">
            Written by {readingBlog.author_name}
          </p>
        </header>

        <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900">
          <img
            src={readingBlog.cover_image_url || BRAND_ASSETS.botanicalMacro}
            alt={readingBlog.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-5 text-base leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line">
          {readingBlog.content}
        </div>
      </article>
    );
  }

  return (
    <div>
      <PageHeroBanner
        kicker="Technical Writing & Insights"
        title="Blogs"
        description="Technical articles, hackathon experiences, project development stories, and engineering tutorials."
        backdrop="botanicalMacro"
        action={
          <button
            type="button"
            onClick={() => onNavigate('community')}
            className="cyber-btn-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white cursor-pointer whitespace-nowrap shrink-0"
          >
            <BookOpen className="h-4 w-4" />
            <span>Contribute an Article</span>
          </button>
        }
      />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Filters */}
      <div className="cyber-frame flex flex-col sm:flex-row gap-3 justify-between p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                category === cat
                  ? 'bg-[#16A34A] text-white'
                  : 'bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Topics' : cat}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles or authors..."
            className="w-full sm:w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:border-[#2563EB] focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Blog Articles Published Yet"
          description="Students can pitch or submit technical articles, tutorials, and hackathon retrospectives via the Community hub."
          actionLabel="Contribute an Article"
          onAction={() => onNavigate('community')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((blog) => (
            <PerspectiveTiltCard key={blog.id}>
              <article
                onClick={() => setReadingBlog(blog)}
                className="cyber-frame h-full overflow-hidden flex flex-col justify-between cursor-pointer hover:border-[#2563EB]/60 transition-colors"
              >
                <div>
                  <div className="aspect-[16/9] w-full overflow-hidden bg-slate-900">
                    <img
                      src={blog.cover_image_url || BRAND_ASSETS.botanicalMacro}
                      alt={blog.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-5 space-y-2.5">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
                      {blog.category_name} · {blog.reading_time_minutes} min read
                    </p>
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      {blog.title}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                      {blog.excerpt}
                    </p>
                  </div>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 px-5 py-3 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{blog.author_name}</span>
                  <span className="font-semibold text-[#2563EB] dark:text-blue-400">Read Article</span>
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
