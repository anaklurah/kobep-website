import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getDb } from './db';

const SECRET_KEY = process.env.ADMIN_SESSION_SECRET || 'antigravity-video-platform-admin-secret-key-9921';
const COOKIE_NAME = 'admin_session';

export interface AdminAuth {
  username: string;
  passwordHash: string;
}

export function getAdminCredentials(): AdminAuth {
  const db = getDb();
  return (
    db.adminAuth || {
      username: 'adminkd',
      passwordHash: '$2a$10$QPiPr/PXmq6YZBGgiT2vWOmCufqECXhQw3/WTC2rhZXBP.iUDkwgS'
    }
  );
}

export function verifyPassword(plainPassword: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(plainPassword, hash);
  } catch {
    return false;
  }
}

export function createSessionToken(username: string): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days session
  const payload = Buffer.from(JSON.stringify({ u: username, exp: expiresAt })).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySessionToken(token?: string | null): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('base64url');
  
  // Constant time comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return false;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (!data.exp || data.exp < Date.now()) return false;
    const creds = getAdminCredentials();
    if (data.u !== creds.username) return false;
    return true;
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
