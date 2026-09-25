/**
 * Login rate limiter.
 *
 * Two implementations behind one async API:
 *
 *   - **Vercel KV / Upstash Redis** when `KV_REST_API_URL` and
 *     `KV_REST_API_TOKEN` are set. Sliding window via `@upstash/ratelimit`,
 *     durable across cold starts and shared across regions.
 *
 *   - **In-memory Map** otherwise. Per-instance, lost on cold start, but
 *     adequate for single-region low-traffic admin and for local dev.
 *
 * Threshold: 5 attempts / 15 min / IP. Generous enough to avoid locking out
 * a fumbling admin; tight enough that an unattended brute-forcer hits the
 * wall in seconds. Only login POST is rate-limited; the cookie-based
 * session check in middleware is not (it's already cheap and stateless).
 */

// PLAIN-ENGLISH OVERVIEW
// This file limits how many times one computer can try to log in to the admin area: 5 tries
// in any 15-minute stretch. That stops someone from running a program that guesses thousands
// of passwords. Computers are told apart by their IP address (the internet's version of a
// return address).
// Where the tries are counted depends on how the site is set up:
//   - If an online storage service is connected (Vercel KV, a small database offered by the
//     company that hosts the site), the count is kept there, so it survives server restarts.
//   - Otherwise the count is kept in the server's short-term memory, which is wiped whenever
//     the server restarts. Good enough for testing and for a low-traffic admin tool.
// Used by: app/admin/login/actions.ts, which calls it before checking any password.
//
// Bring in a ready-made try-counting tool (Upstash Ratelimit) and the Vercel KV connection.
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

// The rules: at most 5 tries per computer in any 15-minute window.
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

// ────────────────────────────────────────────────────────────────────
// In-memory fallback. Map<ip, Array<timestamp>> with timestamps inside
// the rolling window only.
// ────────────────────────────────────────────────────────────────────

// The short-term-memory tally: for each IP address, a list of the times it tried to log in.
const memoryAttempts: Map<string, number[]> = new Map();

// Count one login try using short-term memory. Given the computer's IP address; gives back
// whether this try is allowed, how many tries are left, and when the oldest one expires.
function inMemoryCheck(ip: string): RateLimitResult {
  // Throw away any tries older than 15 minutes; only recent ones count.
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const recent = (memoryAttempts.get(ip) ?? []).filter((t) => t > cutoff);

  // Always record this attempt (whether allowed or not). That way a flood of
  // failures actually produces a lockout instead of resetting the counter.
  recent.push(now);
  memoryAttempts.set(ip, recent);

  // Work out how many tries are left (never below zero) and when the oldest recent try will
  // drop out of the 15-minute window.
  const remaining = Math.max(0, MAX_ATTEMPTS - recent.length);
  const reset = recent[0] + WINDOW_MS;

  // The try is allowed only if it is number 5 or lower in the current window.
  return {
    success: recent.length <= MAX_ATTEMPTS,
    limit: MAX_ATTEMPTS,
    remaining,
    reset,
  };
}

// ────────────────────────────────────────────────────────────────────
// Vercel KV / Upstash variant. Lazily constructed so we don't reach into
// `kv` at import time (which would NPE if env vars are absent).
// ────────────────────────────────────────────────────────────────────

// The online-storage counter. It is set up the first time it's needed, then reused.
let kvLimiter: Ratelimit | null = null;

// Get the online-storage counter. Gives back the counter if the storage service is set up
// (both of its settings are present), or null (nothing) if not, so the caller can fall back
// to short-term memory.
function getKvLimiter(): Ratelimit | null {
  if (kvLimiter) return kvLimiter;
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null;

  // Create the counter: 5 tries per 15 minutes. Its records are labeled "pomfret:admin-login"
  // so they don't mix with anything else kept in the same storage.
  // Sliding window keeps the rate smooth — a flood at minute 14:59 doesn't
  // reset the counter at 15:00, the way a fixed window would.
  kvLimiter = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(MAX_ATTEMPTS, '15 m'),
    analytics: false,
    prefix: 'pomfret:admin-login',
  });
  return kvLimiter;
}

// ────────────────────────────────────────────────────────────────────
// Public API.
// ────────────────────────────────────────────────────────────────────

// What every check gives back: success (is this try allowed?), limit (the maximum, 5),
// remaining (tries left), and reset (when the oldest counted try expires).
export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  /** UNIX ms timestamp when the oldest attempt in the window will fall off. */
  reset: number;
};

// The main entry point, used by the login step. Given the visitor's IP address, it counts
// this try and says whether it is allowed.
export async function checkLoginRateLimit(ip: string): Promise<RateLimitResult> {
  // Treat empty/unknown IP as a single shared bucket so we still cap aggregate
  // unauthenticated traffic. (Better than per-empty-string-being-its-own-key.)
  const identifier = ip || 'unknown';

  // Use online storage if it's set up; otherwise fall back to short-term memory.
  const limiter = getKvLimiter();
  if (!limiter) return inMemoryCheck(identifier);

  // Ask the storage service to count this try, then pass its answer back in our usual shape.
  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Best-effort client-IP extraction for Server Actions / Route Handlers.
 * Reads the standard Vercel / proxy headers; falls back to 'unknown'.
 */
// Figure out the IP address of the computer that sent the login attempt. The website host
// writes it into the request's "headers" (labels attached to every web request).
// Given those headers; gives back the address, or 'unknown' if none is found.
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // Spec: client, proxy1, proxy2 — first entry is the real client.
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  // If that label is missing, try the other common one, "x-real-ip".
  const real = headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}
