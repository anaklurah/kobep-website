import type { APIRoute } from 'astro';
import { getDb } from '../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const db = getDb();
  const baseUrl = `${url.protocol}//${url.host}`;
  const now = new Date().toISOString().slice(0, 10);

  const staticUrls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily', lastmod: now },
    { loc: `${baseUrl}/trending`, priority: '0.9', changefreq: 'daily', lastmod: now }
  ];

  const categoryUrls = db.categories.map((c) => ({
    loc: `${baseUrl}/category/${c.slug}`,
    priority: '0.8',
    changefreq: 'daily',
    lastmod: now
  }));

  const videoUrls = db.videos.map((v) => {
    const lastmod = v.createdAt ? new Date(v.createdAt).toISOString().slice(0, 10) : now;
    return {
      loc: `${baseUrl}/view/${v.slug}`,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod
    };
  });

  const allUrls = [...staticUrls, ...categoryUrls, ...videoUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
