import type { APIRoute } from 'astro';
import { getDb, saveDb, type Comment } from '../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const db = getDb();
  const videoId = url.searchParams.get('videoId');

  if (videoId) {
    const comments = db.comments.filter((c) => c.videoId === videoId);
    return new Response(JSON.stringify(comments), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // If no videoId, return all comments (for admin moderation) with video title info
  const commentsWithVideo = db.comments.map((c) => {
    const video = db.videos.find((v) => v.id === c.videoId);
    return {
      ...c,
      videoTitle: video ? video.title : 'Video dihapus'
    };
  });

  return new Response(JSON.stringify(commentsWithVideo), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { videoId, authorName, content } = body;

    if (!videoId || !content) {
      return new Response(JSON.stringify({ error: 'Video ID dan Komentar wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb();
    const cleanName = (authorName && authorName.trim()) || 'Pengunjung Anonim';

    const newComment: Comment = {
      id: 'comm-' + Date.now(),
      videoId,
      authorName: cleanName,
      authorAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0
    };

    db.comments.unshift(newComment);
    saveDb(db);

    return new Response(JSON.stringify({ success: true, comment: newComment }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to post comment' }), {
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
      return new Response(JSON.stringify({ error: 'Comment ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb();
    db.comments = db.comments.filter((c) => c.id !== id);
    saveDb(db);

    return new Response(JSON.stringify({ success: true, message: 'Comment deleted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to delete comment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
