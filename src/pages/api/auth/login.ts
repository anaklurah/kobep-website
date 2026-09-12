import type { APIRoute } from 'astro';
import { getAdminCredentials, verifyPassword, createSessionToken, COOKIE_NAME } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const username = (body.username || '').trim();
    const password = body.password || '';

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Nama pengguna dan kata sandi wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const creds = getAdminCredentials();

    if (username !== creds.username) {
      return new Response(
        JSON.stringify({ error: 'Nama pengguna atau kata sandi tidak valid' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isMatch = verifyPassword(password, creds.passwordHash);
    if (!isMatch) {
      return new Response(
        JSON.stringify({ error: 'Nama pengguna atau kata sandi tidak valid' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Authentication success: create signed token
    const token = createSessionToken(username);

    // Set secure HTTP-only cookie
    cookies.set(COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Autentikasi berhasil' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Terjadi kesalahan sistem: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
