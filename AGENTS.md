# Case C: Pomfret Voices

Pomfret Voices is a public archive of diversity, equity, and inclusion at Pomfret School, founded in 1894. It brings together a timeline, Humans of Pomfret profiles, Heads of School, magazine archives, Schwartz Visiting Fellows, a bilingual QR campus tour, an AI bias module, and a protected admin QR generator as a companion to pomfret.org.

## Club workflow

- This is the standalone `CivicAIClub/case-c-dei-timeline` repo. Paths start at its root. There is no `projects/` folder. The old `Civic-AI-Github-Repository` is archived; do not edit it.
- Our developers are high school students learning to code together. Prefer clear code over clever code. If a developer cannot explain generated code, say so and explain it in plain English.
- Never push to `main`. Work on a branch and open a pull request (PR). A merge needs one approving review. CI must build before merging.
- Use `feature/<short-description>`, `fix/<short-description>`, or `chore/<short-description>`, all lowercase with hyphens and no spaces. The old `case-c/` prefix is retired.
- Make small, frequent commits with plain English messages that say what changed, such as "Add Status column", rather than "stuff".
- Never commit secrets. `.env.local` is gitignored and `.env.example` holds placeholders only. Values for `ADMIN_PASSWORD_HASH` and `SESSION_SECRET` must never appear in code or docs. If a real credential is pasted into a file, stop and tell the developer.
- Use `.github/pull_request_template.md`: explain what changed, how it was tested, and include screenshots for UI changes.
- Never add `Co-authored-by`, `Generated with`, `Made-with`, `Claude-Session`, or any other AI attribution line to commit messages or PR descriptions. When squash merging, delete any such lines GitHub adds to the merge message.
- For Git, branching, PR, or merge conflict questions, use the [Developer Onboarding Guide](https://github.com/CivicAIClub/docs/blob/main/developer-onboarding.md), which also covers common fixes and the club repo list. Do not guess.

## Stack and content

- The client is Dr. Coretta McCarter, Dean of DEI; the DEI Department owns the content. Developers are Zahir Williams and Keke Li. Keke wrote most of the 2026 build and the "Spirit That Is Pomfret" fact checks. Club lead: Cayden Auyang.
- Use Next.js 14.2 App Router, TypeScript, Tailwind 3, and Framer Motion through `LazyMotion`. Keep the Pomfret palette in `tailwind.config.ts` and `app/globals.css` CSS variables. Fonts are DM Serif Display and Poppins through `next/font/google`.
- Routes live in `app/` (see the README route table). Components live in `components/layout`, `ethics`, `seo`, and `ui`. Admin access uses `lib/auth.ts`, `lib/rate-limit.ts`, and `middleware.ts`.
- Content is currently hardcoded in TypeScript, including `lib/data/*.ts` profiles and tour stops. Use the README's Content editing table to find each file.
- Sanity is planned and not connected. `lib/sanity/` holds its client, queries, and schemas. Do not import `lib/sanity/client.ts` from pages: it throws when its env values are missing.
- Every fact must trace to one of the README's four primary sources: the Pomfret School DEI History PDF; the April 2026 Manus Research Report; "Pomfret in the Civil Rights Era" (Fall 2005); or "Mission Accomplished: 35 Years of Coeducation" (September 2003).
- Record corrections in the style of `docs/VERIFICATION-REPORT.md`. `docs/` also holds audits, photo consent, and design-token references. Scripts include `scripts/hash-password.mjs` and `scripts/auth-sanity.mjs`; the Playwright smoke test is `tests/smoke.spec.ts`.

## Ethics and accessibility

- Never use AI-generated portraits or images of real people. Never generate a face, upscale a face into existence, or "reconstruct" one. Photo content types require `imageAuthenticityConfirmed` before publishing.
- Keep the AI bias acknowledgment footer on every page, linking to `/ai-bias`.
- Before adding a person's photo, follow `docs/PHOTO_CONSENT.md` for its living-subject, public-figure, or archival tier.
- Meet WCAG 2.1 AA. Keep the skip link, meaningful alt text, and `prefers-reduced-motion` support in both CSS and Framer Motion (`useReducedMotion`).
- Use `lang="es"` for Spanish content, one `<h1>` per page with no skipped heading levels, and touch targets at least 44 by 44 px. Audio must never autoplay; require a user tap.

## Security and configuration

- Security headers and the Content Security Policy (CSP) live in `next.config.mjs`. Before using a new external host, add it to both `images.remotePatterns` and the CSP.
- Keep HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`. Keep camera, microphone, geolocation, payment, and USB denied in `Permissions-Policy`. The CSP uses `default-src 'self'` and allows the listed YouTube embeds, Sanity CDN, and Finalsite image CDN.
- `/admin/*` uses bcrypt via `ADMIN_PASSWORD_HASH` and an HMAC-SHA256-signed HttpOnly session cookie with an 8-hour TTL. `SESSION_SECRET` must be a random string of at least 32 bytes; if missing, fail closed with HTTP 503. Use constant-time comparison and prevent username enumeration. Limit login attempts to 5 per 15 minutes per IP, using optional Vercel KV or the in-memory fallback.
- Env names: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`; optional `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
- For a new env name, add a placeholder and comment to `.env.example`, update the README table, and update `.github/workflows/ci.yml` if the build needs it.
- Do not import the Sanity client until the CMS is ready and its env values are configured. Admin access must fail closed when its required configuration is absent.

## Setup, run, and build

Use Node.js 18.17 or newer and npm. From a fresh clone:

```sh
git clone https://github.com/CivicAIClub/case-c-dei-timeline.git
cd case-c-dei-timeline
npm ci
cp .env.example .env.local
# Set NEXT_PUBLIC_SITE_URL in .env.local at minimum.
npm run dev
```

Open `http://localhost:3000`. Keep real secret values out of documentation.

```sh
npm run build
npm run start
npm run lint
```

- Use `npm ci`; `package-lock.json` is the source of truth. Dev uses `.next/`; build and start use `.next-prod/` through `NEXT_DIST_DIR`. Keep them separate so a production build cannot corrupt a running dev server.
- Builds fail on type or lint errors. `@typescript-eslint/no-explicit-any` is an error outside `lib/sanity/schemas/`.
- The husky pre-commit hook runs `lint-staged`, which runs `next lint --file` on staged `.ts` and `.tsx` files. `npm ci` installs the hook.
- The hosting target is Vercel, not yet connected. Do not use GitHub Pages because this app has server routes. Follow the README deployment checklist, including photo rights and audit review, when deployment is requested.

## Beginner quick start

Full guide: https://github.com/CivicAIClub/docs/blob/main/developer-onboarding.md

1. First time: check Git with `git --version`, set your Git name and GitHub email, accept the club invite, and sign in with GitHub Desktop or `gh auth login`. Clone only your project's repo, open its folder, and read its README setup steps.
2. Start each work session from the latest main, then make a branch:

```sh
git checkout main
git pull origin main
git checkout -b feature/short-description
# Make and check your changes before continuing.
git status
git add .
git commit -m "Describe your change"
git push --set-upstream origin feature/short-description
```

Use `feature/`, `fix/`, or `chore/` as appropriate, with lowercase names and hyphens. Commit small working pieces; do not edit or push main directly.
3. Open a PR on GitHub, fill in the template, and get someone else's approval and passing checks where CI exists. Push review fixes to the same branch. After it is merged, pull main again before starting another branch.
4. If stuck, ask in the case chat, then Keke, then Luke or Cayden. Ask before doing anything drastic.

## Sources

- `README.md`: purpose, routes, content files, setup commands, security, and deployment checklist.
- `.cursor/rules/civic-ai-workflow.mdc`: club workflow and where to find help.
- `.cursor/rules/commit-messages.mdc`: commit, PR, and squash merge message rules.
- `.cursor/rules/case-c-pomfret-voices.mdc`: stack, content sources, ethics, security, and build rules.
- Beginner quick start: `developer-onboarding.md` in the `CivicAIClub/docs` repository, linked above.
