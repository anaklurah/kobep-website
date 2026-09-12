import type { APIRoute } from 'astro';
import { getDb, saveDb, type AdBanner } from '../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const db = getDb();
  const position = url.searchParams.get('position');

  if (position) {
    const ads = db.ads.filter((a) => a.position === position && a.isActive);
    return new Response(JSON.stringify(ads), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify(db.ads), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, position, type, imageUrl, targetUrl, scriptCode, isActive } = body;

    if (!name || !position) {
      return new Response(JSON.stringify({ error: 'Nama dan Posisi iklan wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb();
    const newAd: AdBanner = {
      id: 'ad-' + Date.now(),
      name,
      position,
      type: type || 'image',
      imageUrl: imageUrl || '',
      targetUrl: targetUrl || '#',
      scriptCode: scriptCode || '',
      isActive: isActive !== undefined ? Boolean(isActive) : true
    };

    db.ads.push(newAd);
    saveDb(db);

    return new Response(JSON.stringify({ success: true, ad: newAd }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to create ad' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, name, position, type, imageUrl, targetUrl, scriptCode, isActive } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Ad ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb();
    const index = db.ads.findIndex((a) => a.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Ad not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    db.ads[index] = {
      ...db.ads[index],
      name: name ?? db.ads[index].name,
      position: position ?? db.ads[index].position,
      type: type ?? db.ads[index].type,
      imageUrl: imageUrl ?? db.ads[index].imageUrl,
      targetUrl: targetUrl ?? db.ads[index].targetUrl,
      scriptCode: scriptCode ?? db.ads[index].scriptCode,
      isActive: isActive !== undefined ? Boolean(isActive) : db.ads[index].isActive
    };

    saveDb(db);

    return new Response(JSON.stringify({ success: true, ad: db.ads[index] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to update ad' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Ad ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb();
    db.ads = db.ads.filter((a) => a.id !== id);
    saveDb(db);

    return new Response(JSON.stringify({ success: true, message: 'Ad deleted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to delete ad' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
