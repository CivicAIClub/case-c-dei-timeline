// PLAIN-ENGLISH OVERVIEW
// This file is the "guard at the door" of the private admin area (every web address that
// starts with /admin, such as the QR code maker for the campus tour stops).
// Next.js (the toolkit this website is built with) runs this file automatically before it
// shows any /admin page. The guard looks for the admin's login note (a "session cookie": a
// small signed piece of text the browser keeps after logging in) and asks lib/auth.ts
// whether that note is real and unexpired.
//   - Note is good: let the visitor through to the page.
//   - No note, or a bad one: send them to the login page (app/admin/login).
//   - The website's secret setting is missing: show an error and let nobody in.
// The login page and the logout step are always let through, or nobody could ever log in.
//
// Bring in Next.js's tools for answering web requests, plus the login-note tools from
// lib/auth.ts.
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

/**
 * Admin auth middleware.
 *
 * Replaces the previous HTTP basic-auth scheme (which had three audited
 * vulnerabilities: timing-attackable string equality on plaintext creds,
 * plaintext password storage, and no rate limiting / lockout).
 *
 * The new design splits auth into two layers:
 *
 *   - **This middleware (edge runtime)**: cheap, cookie-based session check
 *     on every `/admin/*` request that isn't itself the login form. The
 *     session token is HMAC-SHA256-signed by `lib/auth.ts`, so verification
 *     is a single Web Crypto operation — no DB lookup, no bcrypt.
 *
 *   - **Login Server Action (`app/admin/login/actions.ts`, Node runtime)**:
 *     bcrypt-verifies the password against `ADMIN_PASSWORD_HASH`, rate-limits
 *     by client IP via `lib/rate-limit.ts` (Vercel KV when configured;
 *     in-memory fallback otherwise), then issues a session cookie.
 *
 * Public surface from the middleware's perspective:
 *   - `/admin/login`   → ALWAYS allowed (the form lives here)
 *   - `/admin/logout`  → ALWAYS allowed (the action clears the cookie)
 *   - `/admin/*` (other) → require a valid session cookie, else redirect
 *     to `/admin/login`
 *
 * Fail-closed posture: if `SESSION_SECRET` is missing or the verifier
 * throws, return 503. Better to break the admin tool than to silently
 * accept an unverifiable cookie.
 */

// Paths under /admin that don't require a session (login form + logout).
const PUBLIC_ADMIN_PATHS = new Set(['/admin/login', '/admin/logout']);

// The guard itself. Next.js hands it the incoming request (which page the visitor wants and
// the cookies their browser sent). It answers with one of three things: "go ahead", "go to
// the login page instead", or an error message.
export async function middleware(request: NextRequest) {
  // Find out which page on the site the visitor is asking for (for example /admin/qr-generator).
  const { pathname } = request.nextUrl;

  // Not an admin page? Then the guard has nothing to do; let it through. (The setting at the
  // bottom of this file already limits the guard to admin pages; this is a second safety check.)
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Login + logout pages must be reachable without a session cookie.
  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // Read the session cookie and verify its HMAC signature.
  // Pull out the login note, if the browser sent one.
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Start by assuming nobody is logged in, then ask lib/auth.ts to check the note.
  let session: Awaited<ReturnType<typeof verifySessionToken>> = null;
  try {
    session = await verifySessionToken(token);
  } catch (err) {
    // If the check itself broke (usually because the secret setting is missing), refuse everyone
    // and show a message telling the site's operator what to fix. 503 is the standard web code
    // for "service unavailable."
    // SESSION_SECRET unset, or verifier blew up. Fail closed — never want
    // a missing-secret path to default to "allow." 503 makes the operator
    // fix the env var rather than ship a footgun.
    return new NextResponse(
      'Admin auth is not configured. Set SESSION_SECRET, ADMIN_USERNAME, ' +
        'and ADMIN_PASSWORD_HASH in env (see .env.example).',
      { status: 503 }
    );
  }

  // No valid note: send the visitor to the login page.
  if (!session) {
    // Bounce to login. Preserve the originally-requested path so we could
    // round-trip back after success (currently the login action always
    // sends to /admin/qr-generator, but the query param is ready when we
    // expand the admin surface).
    // Build the login page address with "?next=" plus the page they wanted, for example
    // /admin/login?next=/admin/qr-generator.
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // The note checked out, so show the admin page they asked for.
  return NextResponse.next();
}

// Only intercept admin paths; let everything else through with no overhead.
// "matcher" tells Next.js which addresses to run this guard on: /admin and everything under it.
export const config = {
  matcher: ['/admin/:path*'],
};
