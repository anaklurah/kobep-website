import type { APIRoute } from 'astro';
import { getDb, saveDb, type Video } from '../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const db = getDb();
  const category = url.searchParams.get('category');
  const query = url.searchParams.get('q')?.toLowerCase();
  const slug = url.searchParams.get('slug');

  if (slug) {
    const video = db.videos.find((v) => v.slug === slug || v.id === slug);
    if (!video) {
      return new Response(JSON.stringify({ error: 'Video not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify(video), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let results = [...db.videos];

  if (category) {
    results = results.filter((v) => v.category.toLowerCase() === category.toLowerCase());
  }

  if (query) {
    results = results.filter(
      (v) =>
        v.title.toLowerCase().includes(query) ||
        v.description.toLowerCase().includes(query) ||
        (v.tags && v.tags.some((t) => t.toLowerCase().includes(query)))
    );
  }

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { title, description, category, videoUrl, thumbUrl, duration, tags } = body;

    if (!title || !videoUrl) {
      return new Response(JSON.stringify({ error: 'Judul dan URL video wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb();
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now().toString().slice(-4);

    const newVideo: Video = {
      id: 'vid-' + Date.now(),
      title,
      slug,
      description: description || '',
      category: category || 'General',
      videoUrl,
      thumbUrl: thumbUrl || 'https://cdn.kingbokep.video/thumbs/kolpri-kak-anjani-pemain-basket.webp',
      duration: duration || '03:00',
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : []
    };

    db.videos.unshift(newVideo);
    saveDb(db);

    return new Response(JSON.stringify({ success: true, video: newVideo }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, title, description, category, videoUrl, thumbUrl, duration, tags } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Video ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb();
    const index = db.videos.findIndex((v) => v.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Video not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    db.videos[index] = {
      ...db.videos[index],
      title: title ?? db.videos[index].title,
      description: description ?? db.videos[index].description,
      category: category ?? db.videos[index].category,
      videoUrl: videoUrl ?? db.videos[index].videoUrl,
      thumbUrl: thumbUrl ?? db.videos[index].thumbUrl,
      duration: duration ?? db.videos[index].duration,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : db.videos[index].tags
    };

    saveDb(db);

    return new Response(JSON.stringify({ success: true, video: db.videos[index] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to update video' }), {
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
      return new Response(JSON.stringify({ error: 'Video ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb();
    db.videos = db.videos.filter((v) => v.id !== id);
    // Also remove comments for this video
    db.comments = db.comments.filter((c) => c.videoId !== id);
    saveDb(db);

    return new Response(JSON.stringify({ success: true, message: 'Video deleted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to delete' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
