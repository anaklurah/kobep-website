import type { APIRoute } from 'astro';
import { getDb, saveDb, type Category } from '../../lib/db';

export const prerender = false;

export const GET: APIRoute = async () => {
  const db = getDb();
  // Count videos per category
  const counts: Record<string, number> = {};
  db.videos.forEach((v) => {
    counts[v.category] = (counts[v.category] || 0) + 1;
  });

  const categoriesWithCount = db.categories.map((c) => ({
    ...c,
    videoCount: counts[c.name] || 0
  }));

  return new Response(JSON.stringify(categoriesWithCount), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return new Response(JSON.stringify({ error: 'Nama kategori wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb();
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newCategory: Category = {
      id: 'cat-' + Date.now(),
      name,
      slug,
      description: description || ''
    };

    db.categories.push(newCategory);
    saveDb(db);

    return new Response(JSON.stringify({ success: true, category: newCategory }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to create category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, name, description } = body;

    if (!id || !name) {
      return new Response(JSON.stringify({ error: 'ID dan Nama kategori wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb();
    const index = db.categories.findIndex((c) => c.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: 'Category not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const oldName = db.categories[index].name;
    db.categories[index].name = name;
    db.categories[index].description = description || '';

    // Update existing videos with new category name if renamed
    if (oldName !== name) {
      db.videos.forEach((v) => {
        if (v.category === oldName) {
          v.category = name;
        }
      });
    }

    saveDb(db);

    return new Response(JSON.stringify({ success: true, category: db.categories[index] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to update category' }), {
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
      return new Response(JSON.stringify({ error: 'Category ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = getDb();
    db.categories = db.categories.filter((c) => c.id !== id);
    saveDb(db);

    return new Response(JSON.stringify({ success: true, message: 'Category deleted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to delete category' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
