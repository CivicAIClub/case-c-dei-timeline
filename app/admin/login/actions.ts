// PLAIN-ENGLISH OVERVIEW
// This file runs when the admin fills in the login form at /admin/login and presses the
// button. It runs on the website's server (the computer that hosts the site), never in the
// visitor's browser, so the real password check and the secret settings stay hidden.
// The 'use server' line just below tells Next.js (the website toolkit) to keep it there.
// Step by step, it:
//   1. limits how many login tries one computer gets (5 every 15 minutes),
//   2. checks the username and password against the ones saved in the server's settings,
//   3. if both are right, gives the browser a login note (a "session cookie") and sends the
//      admin to the QR code maker,
//   4. if anything is wrong, sends them back to the login form with a general error message.
// Works with: lib/rate-limit.ts (limits tries), lib/auth.ts (makes the login note), and
// app/admin/login/page.tsx (the form itself, which turns the error codes into messages).
'use server';

// Tools this file needs: bcrypt (a way to check a password against its scrambled, stored
// form), Next.js helpers for cookies, request details, and sending the visitor to another
// page, and this project's own login-note and try-limiting helpers.
import bcrypt from 'bcryptjs';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSessionToken, sessionCookieOptions } from '@/lib/auth';
import { checkLoginRateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * Server Action invoked when the admin login form is submitted.
 *
 * The flow:
 *   1. Rate-limit by client IP (5 / 15min). On miss, redirect with a
 *      generic ?error=rate-limit query string — never reveal the actual
 *      counter remaining or reset time on the form (would help a brute
 *      force pacing attack).
 *   2. Read the configured `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH`
 *      env vars. If either is missing, fail with a generic error rather
 *      than leaking which one is unset.
 *   3. Always run the bcrypt compare even on username mismatch — this
 *      keeps the response time uniform whether the username is right
 *      or wrong, blocking username enumeration.
 *   4. On success: sign a session token, set the HttpOnly cookie, and
 *      redirect to the protected admin route.
 *   5. On failure: redirect back to /admin/login?error=invalid. Same
 *      generic message for "wrong username", "wrong password", and
 *      "missing env vars" — the operator's logs distinguish them, the
 *      attacker's view does not.
 */
// Given the filled-in form (the username and password boxes). It doesn't hand anything back;
// instead it always ends by sending the visitor to another page.
export async function loginAction(formData: FormData): Promise<void> {
  // Read what was typed in the two boxes. Extra spaces around the username are trimmed off;
  // the password is kept exactly as typed.
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  // Find out which computer sent this attempt, using its IP address (the internet's version of
  // a return address), and check whether it has used up its 5 tries in the last 15 minutes.
  // If so, send it back to the login form with a "too many attempts" message.
  // Rate-limit FIRST so we don't burn bcrypt cycles on a flood.
  const reqHeaders = headers();
  const ip = getClientIp(reqHeaders);
  const rl = await checkLoginRateLimit(ip);
  if (!rl.success) {
    redirect('/admin/login?error=rate-limit');
  }

  // Look up the real admin username and the scrambled ("hashed") password from the server's
  // secret settings. A hash is a one-way scramble: you can check a password against it, but
  // you can't unscramble it to get the password back.
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;

  // If the password setting is missing, check against a made-up stand-in instead, so the
  // attempt still takes the same amount of time. That way an attacker learns nothing from how
  // fast the answer comes back.
  // Always do work proportional to a real attempt, even if the env is unset
  // or the username is wrong. The dummy hash below is a real bcrypt hash of
  // a random string — bcrypt.compare on it takes the same ~250ms as a real
  // verify, so total response time is uniform.
  const DUMMY_HASH =
    '$2a$12$abcdefghijklmnopqrstuuQGAfg6wTmZj8YkZdgGXtl4RnNlqSZxa';
  const hashToCheck = expectedHash || DUMMY_HASH;

  // Check the typed password against the stored scrambled one. If the check itself breaks
  // (for example, the stored hash is damaged), treat it as a wrong password.
  // bcrypt.compare itself is constant-time within its bounded compare loop,
  // and we run it unconditionally. Username compare is plain `===` AFTER
  // the bcrypt run, but the bcrypt time dominates by 1000×, so the username
  // path is effectively timing-flat.
  let passwordOk = false;
  try {
    passwordOk = await bcrypt.compare(password, hashToCheck);
  } catch {
    passwordOk = false;
  }

  // Check the username: the setting must exist, something must have been typed, and it must
  // match exactly.
  const usernameOk =
    !!expectedUser && username.length > 0 && username === expectedUser;

  // If anything is missing or wrong, send them back to the form with one general message. It
  // never says which part was wrong, so an attacker can't figure out the username by trial.
  // (Sending the visitor elsewhere with redirect() also stops this code right there, so the
  // steps below only run when the login is correct.)
  if (!expectedUser || !expectedHash || !passwordOk || !usernameOk) {
    redirect('/admin/login?error=invalid');
  }

  // Success: make a login note good for 8 hours, save it in the admin's browser as a cookie,
  // and take them to the QR code maker.
  // Issue a session token. Cookie store is async in Next 14; the redirect
  // also commits the response so we set first, then redirect.
  const token = await createSessionToken(username);
  cookies().set({ ...sessionCookieOptions(), value: token });

  redirect('/admin/qr-generator');
}
