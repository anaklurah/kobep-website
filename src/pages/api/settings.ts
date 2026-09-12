import type { APIRoute } from 'astro';
import { getDb, saveDb } from '../../lib/db';

export const prerender = false;

export const GET: APIRoute = async () => {
  const db = getDb();
  return new Response(JSON.stringify(db.settings), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const db = getDb();

    db.settings = {
      ...db.settings,
      siteName: body.siteName ?? db.settings.siteName,
      tagline: body.tagline ?? db.settings.tagline,
      logoUrl: body.logoUrl ?? db.settings.logoUrl,
      logoText: body.logoText ?? db.settings.logoText,
      faviconUrl: body.faviconUrl ?? db.settings.faviconUrl,
      primaryColor: body.primaryColor ?? db.settings.primaryColor,
      metaTitle: body.metaTitle ?? db.settings.metaTitle,
      metaDescription: body.metaDescription ?? db.settings.metaDescription,
      metaKeywords: body.metaKeywords ?? db.settings.metaKeywords,
      author: body.author ?? db.settings.author,
      headScripts: body.headScripts ?? db.settings.headScripts,
      telegramLink: body.telegramLink ?? db.settings.telegramLink,
      adminPin: body.adminPin ?? db.settings.adminPin,
      popunderUrl: body.popunderUrl ?? db.settings.popunderUrl,
      popunderEnabled: body.popunderEnabled !== undefined ? Boolean(body.popunderEnabled) : db.settings.popunderEnabled,
      popunderFrequencyHours: body.popunderFrequencyHours !== undefined ? Number(body.popunderFrequencyHours) : db.settings.popunderFrequencyHours
    };

    saveDb(db);

    return new Response(JSON.stringify({ success: true, settings: db.settings }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to save settings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
