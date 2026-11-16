import { Router } from 'express';
import { getEnvConfig } from '../config/env.ts';

export const seoRouter = Router();

const PUBLIC_PATHS = [
  '/',
  '/about',
  '/events',
  '/hackathons',
  '/opportunities',
  '/projects',
  '/resources',
  '/blogs',
  '/community',
  '/team',
  '/contact',
];

seoRouter.get('/robots.txt', (_req, res) => {
  const cfg = getEnvConfig();
  res.type('text/plain').send(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /api/admin',
      `Sitemap: ${cfg.appUrl.replace(/\/$/, '')}/sitemap.xml`,
    ].join('\n'),
  );
});

seoRouter.get('/sitemap.xml', (_req, res) => {
  const cfg = getEnvConfig();
  const baseUrl = cfg.appUrl.replace(/\/$/, '');
  const now = new Date().toISOString().split('T')[0];

  const urls = PUBLIC_PATHS.map(
    (p) => `  <url>
    <loc>${baseUrl}${p}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${p === '/' ? '1.0' : '0.8'}</priority>
  </url>`,
  ).join('\n');

  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`,
  );
});
