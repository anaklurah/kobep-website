import type { APIRoute } from 'astro';
import { searchEporner } from '../../../lib/eporner';
import { getSqliteDb } from '../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const query = (url.searchParams.get('q') || 'indonesia').trim();
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const perPage = parseInt(url.searchParams.get('per_page') || '24', 10);
  const order = url.searchParams.get('order') || 'most-popular';

  try {
    const data = await searchEporner({ query, page, perPage, order });

    // Check existing videos in SQLite to mark which ones are already imported
    const db = getSqliteDb();
    const existingRows = db.prepare('SELECT videoUrl, slug FROM videos').all() as { videoUrl: string; slug: string }[];
    const existingUrls = new Set(existingRows.map(r => r.videoUrl));

    const enrichedVideos = (data.videos || []).map(v => ({
      ...v,
      isImported: existingUrls.has(v.embed) || existingUrls.has(v.url)
    }));

    return new Response(
      JSON.stringify({
        ...data,
        videos: enrichedVideos
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Error in Eporner search proxy:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Gagal mencari video dari Eporner' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
