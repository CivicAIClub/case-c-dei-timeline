/**
 * Admin auth — session-cookie utilities.
 *
 * Two pieces:
 *   1. Password verification (bcrypt, constant-time). Used by the login
 *      Server Action; runs in the Node runtime where bcryptjs is fine.
 *   2. Session signing / verification (HMAC-SHA256 over a tiny payload).
 *      Used by both the Server Action (sign in → set cookie) and the
 *      edge middleware (read cookie → verify on every admin request).
 *      Uses Web Crypto so it works in both runtimes.
 *
 * Sessions are stateless: the cookie itself carries `username|expires|sig`.
 * No DB lookups, no KV reads — middleware verifies the HMAC on the edge.
 * Tradeoff: revoking a session requires rotating SESSION_SECRET. For an
 * admin tool with one or two users, that's an acceptable cost.
 */

// PLAIN-ENGLISH OVERVIEW
// This file holds the "lock and key" tools for the small private admin area of the website
// (the pages under /admin, such as the QR code maker for the campus tour).
// It does two jobs:
//   1. When the admin logs in, it makes a "login note" (a session cookie). A cookie is a small
//      piece of text a website asks your web browser to keep and send back on every visit.
//      This note says "this person logged in, and this note is good for 8 hours."
//   2. Every time someone asks for an admin page, it checks that the note is real, was made
//      by this website, and has not expired.
// The note is "signed" with a secret phrase (SESSION_SECRET) that only the server knows, like
// a wax seal. Anyone could read the note, but nobody can fake or change it without the secret.
// (The password check itself happens in app/admin/login/actions.ts, not in this file.)
// Used by: app/admin/login/actions.ts (makes the note at login), middleware.ts (checks it
// before every admin page), and app/admin/logout/actions.ts (throws it away at logout).
//
// How long a login lasts. After 8 hours the admin has to log in again.
const SESSION_TTL_HOURS = 8;
// The name the browser files the login note under. Other files use this same name to find it.
export const SESSION_COOKIE_NAME = 'pomfret_admin_session';

// ────────────────────────────────────────────────────────────────────
// Env access — fail closed if anything required is missing.
// ────────────────────────────────────────────────────────────────────

// Look up the secret phrase used to seal login notes. It is kept in the server's settings
// (an "environment variable": a setting stored outside the code, so it never ends up on
// GitHub). If it is missing, or shorter than 32 characters (too easy to guess), stop with an
// error instead of carrying on unsafely. Gives back the secret phrase.
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'SESSION_SECRET is not set or is shorter than 32 characters. ' +
        'Generate one with: openssl rand -base64 48'
    );
  }
  return secret;
}

// ────────────────────────────────────────────────────────────────────
// Web Crypto helpers (work in both edge middleware and Node runtime).
// ────────────────────────────────────────────────────────────────────

// A helper that turns ordinary text into the raw numbers (bytes) that the sealing math works on.
const encoder = new TextEncoder();

// Turn the secret phrase into a "key" that the built-in security toolkit (called Web Crypto)
// can use to seal and check notes. HMAC-SHA256 is the name of the sealing method: it mixes
// the note with the secret to make a "fingerprint" that only someone with the secret can
// reproduce. Given the secret phrase; gives back the ready-to-use key.
async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// Turn raw bytes into plain letters and numbers that are safe to put in a cookie or a web
// address (this format is called "base64url"). Given raw bytes; gives back a short text.
function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < arr.byteLength; i++) bin += String.fromCharCode(arr[i]);
  // Swap out the characters that cause trouble in web addresses (+ and /) and drop the "="
  // padding at the end.
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// The reverse of the helper above: turn that safe text back into the original raw bytes.
// Given the text; gives back the bytes. If the text has characters that don't belong, this
// fails with an error, which the note checker below treats as "not a valid login note."
function base64UrlToBytes(b64: string): Uint8Array {
  // Restore padding stripped by base64url encoding.
  const pad = b64.length % 4 === 0 ? 0 : 4 - (b64.length % 4);
  const normalized = b64.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad);
  const bin = atob(normalized);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Check whether two fingerprints are exactly the same. Gives back true (match) or false.
// It always looks at every byte instead of stopping at the first difference. That matters:
// otherwise an attacker could time how long the check takes and slowly learn how much of a
// forged fingerprint was right.
// Constant-time comparison — bytes-equal without short-circuiting.
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < a.byteLength; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// ────────────────────────────────────────────────────────────────────
// Session token: `username|expiresAtIso|HMAC(username|expiresAtIso)`
// All three pieces are URL-safe base64 of UTF-8 / signature bytes.
// ────────────────────────────────────────────────────────────────────

// What a valid login note tells us: who logged in, and when the note stops working (as a
// timestamp: the number of milliseconds since January 1, 1970, the usual way computers count
// time).
export type SessionPayload = { username: string; expiresAt: number };

// Make a brand-new login note for the admin who just logged in.
// Given their username; gives back the finished note as one line of text shaped like
// "name.expiry.fingerprint". The login step then stores it in the admin's browser as a cookie.
export async function createSessionToken(username: string): Promise<string> {
  const secret = getSessionSecret();
  // Work out when this note expires: right now plus 8 hours (counted in milliseconds).
  const expiresAt = Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000;

  // Turn the username and the expiry time into safe text and join them with a dot.
  const usernameB64 = bytesToBase64Url(encoder.encode(username));
  const expiryB64 = bytesToBase64Url(encoder.encode(String(expiresAt)));
  const payload = `${usernameB64}.${expiryB64}`;

  // Seal it: use the secret key to make a fingerprint of the name-and-expiry text.
  const key = await getKey(secret);
  const sigBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const sigB64 = bytesToBase64Url(sigBuf);

  // Attach the fingerprint to the end, so the note carries its own proof.
  return `${payload}.${sigB64}`;
}

// Check a login note that a browser sent back to us.
// Given the note (or nothing, if the browser didn't send one). Gives back who is logged in
// and when their login ends if the note is genuine and still fresh, or null (meaning "not
// logged in") if it is missing, fake, tampered with, damaged, or expired.
export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  // No note at all means not logged in.
  if (!token) return null;
  // A real note has exactly three parts separated by dots. Anything else is not one of ours.
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [usernameB64, expiryB64, sigB64] = parts;

  // Get the secret phrase. If it is missing, this stops with an error on purpose (see below).
  // SESSION_SECRET missing is a system misconfig — let it throw so callers
  // (middleware) can surface a 503. Anything past this point is "the token
  // is bad" territory, which we treat as "no session" and return null —
  // never throw for a malformed/forged/stale cookie or a caller above us
  // will mistake "user has a corrupt cookie" for "the server is broken."
  const secret = getSessionSecret();

  // Everything inside this "try" section is allowed to fail; any failure means "not logged in."
  try {
    const key = await getKey(secret);

    // Re-make the fingerprint ourselves from the name and expiry written in the note, then compare
    // it with the fingerprint the note carries. If anyone edited the name or the expiry time,
    // the two will not match.
    // Re-sign the payload under our key, then constant-time compare against
    // the signature in the cookie. A mismatch (forgery, rotated secret) →
    // null. A throw inside `base64UrlToBytes` (cookie has chars outside the
    // base64url alphabet, padding is wrong, etc.) also → null.
    const expected = new Uint8Array(
      await crypto.subtle.sign('HMAC', key, encoder.encode(`${usernameB64}.${expiryB64}`))
    );
    const provided = base64UrlToBytes(sigB64);
    if (!timingSafeEqual(expected, provided)) return null;

    // The fingerprint matches, so the note is genuine. Read out the name and the expiry time, and
    // turn the note away if the time is unreadable or already in the past.
    // Signature OK → trust the payload. Decode and check expiry.
    const username = new TextDecoder().decode(base64UrlToBytes(usernameB64));
    const expiresAt = Number(new TextDecoder().decode(base64UrlToBytes(expiryB64)));
    if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;

    return { username, expiresAt };
  } catch {
    // Token decoding failed somewhere (atob InvalidCharacterError, etc.).
    // Treat as no session — caller redirects to /admin/login.
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────
// Cookie attributes.
//
// We set Secure only in production so local `npm run dev` over http://
// can still authenticate; in production HSTS + Secure prevent any HTTP
// transmission of the session cookie.
// ────────────────────────────────────────────────────────────────────

// The settings for the login cookie, used when the login step stores the note in the browser:
//   httpOnly: scripts running on the page can't read the cookie, so a sneaky script can't
//     steal it.
//   secure: on the live site, only send it over encrypted (https) connections.
//   sameSite "lax": the browser won't attach it to form submissions coming from other
//     websites, but ordinary links into this site still work.
//   path "/": the browser sends it along with every request to this site.
//   maxAge: the browser throws the cookie away after 8 hours (counted in seconds here).
export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_TTL_HOURS * 60 * 60, // seconds
  };
}
