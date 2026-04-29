import jwt from 'jsonwebtoken';
import { query } from './db.js';

const FIREBASE_CERT_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'meditrackandroid';

let cachedCerts = null;
let cachedUntil = 0;

async function getFirebaseCerts() {
  const now = Date.now();
  if (cachedCerts && cachedUntil > now) return cachedCerts;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const response = await fetch(FIREBASE_CERT_URL, { signal: controller.signal }).finally(() => {
    clearTimeout(timeout);
  });
  if (!response.ok) throw new Error('Unable to fetch Firebase verification certificates.');

  const cacheControl = response.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSeconds = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;

  cachedCerts = await response.json();
  cachedUntil = now + maxAgeSeconds * 1000;
  return cachedCerts;
}

async function verifyFirebaseToken(token) {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded?.header?.kid) throw new Error('Invalid Firebase token.');

  const certs = await getFirebaseCerts();
  const cert = certs[decoded.header.kid];
  if (!cert) throw new Error('Unknown Firebase token certificate.');

  return jwt.verify(token, cert, {
    algorithms: ['RS256'],
    audience: FIREBASE_PROJECT_ID,
    issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
  });
}

async function upsertUserFromToken(firebaseUser, displayName = null) {
  const uid = firebaseUser.user_id || firebaseUser.sub;
  const email = firebaseUser.email;
  const name = displayName || firebaseUser.name || null;
  const photoUrl = firebaseUser.picture || null;

  const result = await query(
    `
      insert into users (id, email, display_name, photo_url, last_login_at)
      values ($1, $2, $3, $4, now())
      on conflict (id) do update set
        email = excluded.email,
        display_name = coalesce(excluded.display_name, users.display_name),
        photo_url = coalesce(excluded.photo_url, users.photo_url),
        last_login_at = now()
      returning id, email, display_name, photo_url, role, gemini_scan_count, gs1_scan_count
    `,
    [uid, email, name, photoUrl]
  );

  return result.rows[0];
}

export function toClientUser(row) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    photoURL: row.photo_url,
    role: row.role,
    geminiScanCount: row.gemini_scan_count,
    gs1ScanCount: row.gs1_scan_count,
  };
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Missing authorization token.' });

    const firebaseUser = await verifyFirebaseToken(token);
    const user = await upsertUserFromToken(firebaseUser);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message || 'Unauthorized.' });
  }
}

export async function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

export async function registerUser(req, res) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Missing authorization token.' });

    const firebaseUser = await verifyFirebaseToken(token);
    const user = await upsertUserFromToken(firebaseUser, req.body?.name);
    res.json({ user: toClientUser(user) });
  } catch (error) {
    res.status(401).json({ error: error.message || 'Registration failed.' });
  }
}
