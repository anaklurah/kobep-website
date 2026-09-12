import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import { getDb } from '../../lib/db';
import { processVideo } from '../../lib/videoProcessor';

export const prerender = false;

const UPLOADS_DIR = path.resolve(process.cwd(), 'public', 'uploads');

function ensureUploadDirs() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  const subdirs = ['thumbs', 'videos', 'logos', 'intros', 'outros', 'watermarks'];
  subdirs.forEach((sub) => {
    const p = path.join(UPLOADS_DIR, sub);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  });
}

function resolveLocalPath(urlOrPath?: string): string | undefined {
  if (!urlOrPath || !urlOrPath.trim()) return undefined;
  const clean = urlOrPath.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    // If it's a full remote URL, return as is (FFmpeg supports HTTP/HTTPS inputs!)
    return clean;
  }
  // If local /uploads/...
  if (clean.startsWith('/uploads/')) {
    const rel = clean.replace(/^\/uploads\//, '');
    return path.join(UPLOADS_DIR, rel);
  }
  if (clean.startsWith('/')) {
    return path.resolve(process.cwd(), 'public', clean.slice(1));
  }
  return path.resolve(process.cwd(), clean);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    ensureUploadDirs();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'thumbs'; // 'thumbs' | 'videos' | 'logos' | 'intros' | 'outros' | 'watermarks'
    const applyBranding = formData.get('applyBranding') === 'true';

    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ error: 'Tidak ada file yang diunggah' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const originalName = file.name || 'upload';
    const ext = path.extname(originalName) || (type === 'videos' ? '.mp4' : '.webp');
    const safeBase = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();
    let fileName = `${type}-${safeBase}-${timestamp}${ext}`;

    const subDirMap: Record<string, string> = {
      videos: 'videos',
      logos: 'logos',
      thumbs: 'thumbs',
      intros: 'intros',
      outros: 'outros',
      watermarks: 'watermarks'
    };
    const subDir = subDirMap[type] || 'thumbs';
    const destPath = path.join(UPLOADS_DIR, subDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());

    // If uploading video and applyBranding is requested
    if (type === 'videos' && applyBranding) {
      const db = getDb();
      const vb = db.videoBranding;

      // Temporary raw file path
      const rawFileName = `raw-${safeBase}-${timestamp}${ext}`;
      const rawDestPath = path.join(UPLOADS_DIR, subDir, rawFileName);
      fs.writeFileSync(rawDestPath, buffer);

      const introPath = resolveLocalPath(vb?.introPath);
      const outroPath = resolveLocalPath(vb?.outroPath);
      const watermarkPath = resolveLocalPath(vb?.watermarkPath);

      const processResult = await processVideo(rawDestPath, destPath, {
        introPath,
        outroPath,
        watermarkPath,
        watermarkText: vb?.watermarkText || 'Nyalaporn.com',
        watermarkPosition: vb?.watermarkPosition || 'center',
        watermarkOpacity: vb?.watermarkOpacity ?? 0.35
      });

      // Clean up raw temp file if processed successfully
      if (processResult.success && fs.existsSync(destPath)) {
        try { fs.unlinkSync(rawDestPath); } catch {}
      } else {
        // Fallback: use raw video if processing failed
        try { fs.copyFileSync(rawDestPath, destPath); } catch {}
      }
    } else {
      // Standard direct write
      fs.writeFileSync(destPath, buffer);
    }

    // Mirror to dist/client/uploads for standalone server serving
    const distSubDir = path.resolve(process.cwd(), 'dist', 'client', 'uploads', subDir);
    if (!fs.existsSync(distSubDir)) {
      try { fs.mkdirSync(distSubDir, { recursive: true }); } catch (e) {}
    }
    try {
      if (fs.existsSync(destPath)) {
        fs.copyFileSync(destPath, path.join(distSubDir, fileName));
      }
    } catch (e) {}

    const publicUrl = `/uploads/${subDir}/${fileName}`;

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        filename: fileName,
        size: fs.existsSync(destPath) ? fs.statSync(destPath).size : buffer.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Upload Error:', error);
    return new Response(JSON.stringify({ error: 'Gagal mengunggah berkas: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
