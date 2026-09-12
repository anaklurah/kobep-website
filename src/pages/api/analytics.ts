import type { APIRoute } from 'astro';
import { getDb, saveDb } from '../../lib/db';

export const prerender = false;

export const GET: APIRoute = async () => {
  const db = getDb();

  const totalVideos = db.videos.length;
  const totalViews = db.videos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalLikes = db.videos.reduce((acc, v) => acc + (v.likes || 0), 0);
  const totalComments = db.comments.length;

  // Top 10 performing videos by views
  const topVideos = [...db.videos]
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
    .map((v) => ({
      id: v.id,
      title: v.title,
      category: v.category,
      views: v.views,
      likes: v.likes,
      commentsCount: db.comments.filter((c) => c.videoId === v.id).length,
      duration: v.duration,
      slug: v.slug
    }));

  return new Response(
    JSON.stringify({
      totalVideos,
      totalViews,
      totalLikes,
      totalComments,
      topVideos,
      dailyViews: db.analytics.dailyViews || {}
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
    const { videoId, action } = body; // action: 'view' | 'like'

    if (!videoId) {
      return new Response(JSON.stringify({ error: 'Video ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb();
    const video = db.videos.find((v) => v.id === videoId || v.slug === videoId);

    if (!video) {
      return new Response(JSON.stringify({ error: 'Video not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'like') {
      video.likes = (video.likes || 0) + 1;
    } else {
      // Default is view
      video.views = (video.views || 0) + 1;
      db.analytics.totalViews = (db.analytics.totalViews || 0) + 1;

      const today = new Date().toISOString().slice(0, 10);
      if (!db.analytics.dailyViews) {
        db.analytics.dailyViews = {};
      }
      db.analytics.dailyViews[today] = (db.analytics.dailyViews[today] || 0) + 1;
    }

    saveDb(db);

    return new Response(
      JSON.stringify({
        success: true,
        views: video.views,
        likes: video.likes
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to record event' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
