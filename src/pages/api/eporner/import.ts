import type { APIRoute } from 'astro';
import { getSqliteDb } from '../../../lib/db';
import { verifySessionToken, COOKIE_NAME } from '../../../lib/auth';
import type { EpornerVideo } from '../../../lib/eporner';

export const prerender = false;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const sessionCookie = cookies.get(COOKIE_NAME)?.value;
  if (!verifySessionToken(sessionCookie)) {
    return new Response(JSON.stringify({ error: 'Akses ditolak. Sesi tidak valid.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { videos, category } = body as { videos: EpornerVideo[]; category: string };

    if (!Array.isArray(videos) || videos.length === 0) {
      return new Response(JSON.stringify({ error: 'Tidak ada video yang dipilih untuk di-import.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const targetCategory = category || 'Indo Viral';
    const db = getSqliteDb();

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO videos (
        id, title, slug, description, videoUrl, thumbUrl, duration, category, views, likes, createdAt, isFeatured, tags
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    let importedCount = 0;
    const now = new Date().toISOString();

    const importTx = db.transaction(() => {
      for (const v of videos) {
        // Unique ID prefix
        const vidId = 'ep-' + v.id;
        let baseSlug = slugify(v.title);
        if (!baseSlug) baseSlug = 'video-' + v.id;
        const vidSlug = baseSlug + '-' + v.id.toLowerCase();

        const thumb = v.default_thumb?.src || (v.thumbs && v.thumbs[0]?.src) || '/uploads/default-thumb.jpg';
        const videoEmbedUrl = v.embed || v.url;
        const duration = v.length_min || '04:00';
        const views = Number(v.views) || 12500;
        const likes = Math.round(views * 0.05);

        // Tags parsing
        let tags: string[] = [];
        if (v.keywords) {
          tags = v.keywords
            .split(',')
            .map(t => t.trim().toLowerCase())
            .filter(t => t.length > 1 && t.length < 30 && !t.includes('http'))
            .slice(0, 10);
        }

        insertStmt.run(
          vidId,
          v.title,
          vidSlug,
          `Video ${v.title} kualitas HD. Durasi ${duration}.`,
          videoEmbedUrl,
          thumb,
          duration,
          targetCategory,
          views,
          likes,
          now,
          0,
          JSON.stringify(tags)
        );

        importedCount++;
      }
    });

    importTx();

    return new Response(
      JSON.stringify({
        success: true,
        message: `Berhasil mengimpor ${importedCount} video ke kategori ${targetCategory}.`,
        importedCount
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error importing videos:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Gagal mengimpor video ke database.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
