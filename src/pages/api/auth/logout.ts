import type { APIRoute } from 'astro';
import { COOKIE_NAME } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  cookies.delete(COOKIE_NAME, { path: '/' });
  return new Response(
    JSON.stringify({ success: true, message: 'Berhasil keluar' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
