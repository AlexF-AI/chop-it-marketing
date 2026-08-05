// Static-route sitemap: the handful of routes that don't depend on
// recipes_published. Kept separate from /sitemap-recipes.xml so we can
// (re)submit either side independently in Search Console.

import { getAllPostsMeta } from '../lib/blog';
import { getResources, type ResourceSection } from '../lib/resources';
import { SITE_ORIGIN } from '../lib/recipeSchema';

export const revalidate = 3600;

type StaticRoute = {
  path: string;
  changefreq: 'weekly' | 'monthly';
  priority: string;
  // Real last-content-change date (YYYY-MM-DD). Bump a route ONLY when that
  // page actually changes — never stamp "now" on every regeneration, or
  // Google learns our <lastmod> is noise and stops trusting it for crawl
  // scheduling. Blog URLs derive their lastmod from the post registry below.
  lastmod: string;
};

// Priorities preserved from the previous monolithic sitemap.ts so we don't
// inadvertently re-rank pages with Google.
const ROUTES: StaticRoute[] = [
  { path: '/', changefreq: 'weekly', priority: '1.0', lastmod: '2026-08-03' },
  { path: '/recipes', changefreq: 'weekly', priority: '0.8', lastmod: '2026-08-03' },
  { path: '/method', changefreq: 'monthly', priority: '0.6', lastmod: '2026-07-31' },
  { path: '/privacy', changefreq: 'monthly', priority: '0.3', lastmod: '2026-05-29' },
  { path: '/terms', changefreq: 'monthly', priority: '0.3', lastmod: '2026-05-29' },
  { path: '/data-deletion', changefreq: 'monthly', priority: '0.3', lastmod: '2026-05-29' },
  { path: '/support', changefreq: 'monthly', priority: '0.3', lastmod: '2026-07-21' },
  {
    path: '/author/alex-fahey',
    changefreq: 'monthly',
    priority: '0.5',
    lastmod: '2026-08-03',
  },
];

// YYYY-MM-DD → W3C datetime (UTC midnight), a valid <lastmod> value.
function toIso(date: string): string {
  return new Date(`${date}T00:00:00Z`).toISOString();
}

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return (
    `  <url>\n` +
    `    <loc>${loc}</loc>\n` +
    `    <lastmod>${lastmod}</lastmod>\n` +
    `    <changefreq>${changefreq}</changefreq>\n` +
    `    <priority>${priority}</priority>\n` +
    `  </url>`
  );
}

export async function GET() {
  const staticEntries = ROUTES.map((r) =>
    urlEntry(`${SITE_ORIGIN}${r.path}`, toIso(r.lastmod), r.changefreq, r.priority),
  );

  // Blog: metadata-only registry (no fs), safe here. The /blog index tracks
  // the freshest article; each article uses its own dateModified. All stable
  // across regenerations — they only move when a post's date moves.
  const posts = getAllPostsMeta();
  const blogIndexLastmod = posts.reduce(
    (max, p) => (p.dateModified > max ? p.dateModified : max),
    '2026-05-29',
  );
  const blogEntries = [
    urlEntry(`${SITE_ORIGIN}/blog`, toIso(blogIndexLastmod), 'weekly', '0.7'),
    ...posts.map((p) =>
      urlEntry(`${SITE_ORIGIN}/blog/${p.slug}`, toIso(p.dateModified), 'monthly', '0.6'),
    ),
  ];

  // Learn + Research: same registry-derived pattern as the blog. Hub lastmod
  // follows the freshest entry in its section.
  const resourceEntries = (['learn', 'research', 'features'] as ResourceSection[]).flatMap((section) => {
    const items = getResources(section);
    const hubLastmod = items.reduce(
      (max, r) => (r.dateModified > max ? r.dateModified : max),
      '2026-08-05',
    );
    return [
      urlEntry(`${SITE_ORIGIN}/${section}`, toIso(hubLastmod), 'weekly', '0.7'),
      ...items.map((r) =>
        urlEntry(`${SITE_ORIGIN}/${section}/${r.slug}`, toIso(r.dateModified), 'monthly', '0.6'),
      ),
    ];
  });

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    [...staticEntries, ...blogEntries, ...resourceEntries].join('\n') +
    '\n</urlset>\n';

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
