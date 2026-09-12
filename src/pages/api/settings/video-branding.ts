import type { APIRoute } from 'astro';
import { getDb, saveDb, type VideoBrandingSettings } from '../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async () => {
  const db = getDb();
  return new Response(
    JSON.stringify({
      success: true,
      data: db.videoBranding || {
        enabled: false,
        introPath: '',
        outroPath: '',
        watermarkPath: '',
        watermarkText: 'Nyalaporn.com',
        watermarkPosition: 'center',
        watermarkOpacity: 0.35
      }
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const db = getDb();

    const current: VideoBrandingSettings = db.videoBranding || {
      enabled: false,
      introPath: '',
      outroPath: '',
      watermarkPath: '',
      watermarkText: 'Nyalaporn.com',
      watermarkPosition: 'center',
      watermarkOpacity: 0.35
    };

    const updated: VideoBrandingSettings = {
      enabled: typeof body.enabled === 'boolean' ? body.enabled : current.enabled,
      introPath: typeof body.introPath === 'string' ? body.introPath.trim() : current.introPath,
      outroPath: typeof body.outroPath === 'string' ? body.outroPath.trim() : current.outroPath,
      watermarkPath: typeof body.watermarkPath === 'string' ? body.watermarkPath.trim() : current.watermarkPath,
      watermarkText: typeof body.watermarkText === 'string' ? body.watermarkText.trim() : current.watermarkText,
      watermarkPosition: body.watermarkPosition || current.watermarkPosition || 'center',
      watermarkOpacity: typeof body.watermarkOpacity === 'number' ? Math.max(0.05, Math.min(1.0, body.watermarkOpacity)) : current.watermarkOpacity
    };

    db.videoBranding = updated;
    saveDb(db);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Pengaturan branding video berhasil disimpan',
        data: updated
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Gagal memperbarui pengaturan: ' + error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
