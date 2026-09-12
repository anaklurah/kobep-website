import type { APIRoute } from 'astro';
import path from 'node:path';
import fs from 'node:fs';
import { extractThumbnailFrame, isFfmpegAvailable } from '../../../lib/videoProcessor';
import { verifySessionToken, COOKIE_NAME } from '../../../lib/auth';

export const prerender = false;

const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads', 'thumbs');
const DIST_UPLOADS_DIR = path.resolve(process.cwd(), 'dist', 'client', 'uploads', 'thumbs');

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
    const { videoUrl } = body as { videoUrl?: string };

    if (!videoUrl || typeof videoUrl !== 'string' || !videoUrl.trim()) {
      return new Response(JSON.stringify({ error: 'URL video wajib disertakan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const hasFfmpeg = await isFfmpegAvailable();
    if (!hasFfmpeg) {
      return new Response(JSON.stringify({ error: 'FFmpeg tidak terdeteksi pada server host.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const timestamp = Date.now();
    const fileName = `thumb-auto-${timestamp}.jpg`;
    const destPath = path.join(UPLOADS_DIR, fileName);

    // Resolve local path if URL points to /uploads/...
    let source = videoUrl.trim();
    if (source.startsWith('/uploads/')) {
      source = path.resolve(process.cwd(), 'public', source.slice(1));
    }

    const success = await extractThumbnailFrame(source, destPath, 3);
    if (!success || !fs.existsSync(destPath)) {
      return new Response(JSON.stringify({ error: 'Gagal mengekstrak cuplikan frame dari URL video.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Mirror to dist if dist exists
    if (fs.existsSync(path.dirname(DIST_UPLOADS_DIR))) {
      if (!fs.existsSync(DIST_UPLOADS_DIR)) fs.mkdirSync(DIST_UPLOADS_DIR, { recursive: true });
      fs.copyFileSync(destPath, path.join(DIST_UPLOADS_DIR, fileName));
    }

    const publicUrl = `/uploads/thumbs/${fileName}`;

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        filename: fileName
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err: any) {
    console.error('Error generating thumb from URL:', err);
    return new Response(JSON.stringify({ error: err.message || 'Gagal memproses thumbnail' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
