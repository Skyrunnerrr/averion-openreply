# 02 ADVISORY MATRIX — Next.js September-30-2026 security release (9/9)

## Authoritative sources (read 2026-10-06 CEST)
- S1 https://nextjs.org/blog/upcoming-nextjs-security-release-september-2026 (posted 2026-09-23 20:00 CEST). The original text says "nine vulnerabilities: one critical, two high, five medium, and one low" and "16.3.7 and 15.5.27". It carries two updates:
  - "September 29, 2026: Next.js 16.3.7 was published with a bug fix. It does not include the security fixes … We now expect those fixes in 16.3.8 and 15.5.27."
  - "September 30, 2026: This release now addresses seven vulnerabilities instead of nine. The remaining two (one critical, one high) are pending upstream coordination and will be addressed in a later Next.js release."
- S2 https://nextjs.org/blog/september-2026-security-release (2026-09-30): lists 7 advisories and says to install next@16.3.8 / 15.5.27.
- S3 GitHub repository advisories, `GET /repos/vercel/next.js/security-advisories/{ghsa}`. All 7 are state=published (raw/repoadv_*.json).
- S4 GitHub global advisory DB, `GET /advisories/{ghsa}`. **All 7 return 404 (not yet reviewed into the global DB)**, see raw/global_advisory_404_*.json. As a result npm audit does not know them (see 05).

Severity reconciliation: 9 = 1 Critical + 2 High + 5 Medium + 1 Low (S1). Published 7 = 1 High + 5 Medium + 1 Low (S2/S3). Pending 2 = 1 Critical + 1 High (S1 update). **This matches the expected prior knowledge.**

Target under test: next **16.2.6** (lockfile at HEAD 93a793ae). It is App Router only (no `pages/` dir). `next.config.ts` has no `images`, no `cacheComponents`, and no `useCache`. The build uses `next build` (Next 16 default bundler is Turbopack; the config sets the `turbopack` key and no `--webpack` flag). Production runs `next start` via `npm run start` in both Dockerfiles.

## Matrix
Times are converted to CEST. "Placeholder" means the GHSA `patched_versions` field still shows `16.3.?` / `15.5.?`.

| # | ADVISORY | CVE | SEV | TITLE | PUBLISHED (S3) | GHSA AFFECTED (16.x) | GHSA PATCHED (as shown) | PLACEHOLDER | BLOG FIX | 16.2.6 IN RANGE | PRECONDITION (from advisory) | REPO EVIDENCE @93a793ae | REACHABLE | STATUS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | GHSA-cjq9-62q9-8jv4 | CVE-2026-94483 | High | SSRF in Image Optimization | 2026-09-30 18:15 | `>= 16.0.0 < 16.3.?` | `16.3.?` | YES | 16.3.8 | YES (16.2.6 < 16.3.0 ≤ any 16.3.x) | `images.remotePatterns` allow-lists a remote host. "If no images.remotePatterns are configured, your app is not affected." | `next.config.ts` has no `images` key. `next/image` is used only with local `/brand/zernio-primary.svg` | NO | **CLOSED_NOT_AFFECTED** |
| 2 | GHSA-4jqv-mc3x-m676 | CVE-2026-94543 | Medium | Cache poisoning of SSG/ISR pages (self-hosted, Pages Router) | 2026-09-30 18:14 | `>= 16.0.0` (15: `>= 15.0.0`) | `16.3.?` / `15.5.?` | YES | 16.3.8 / 15.5.27 | YES | Pages Router with SSG/ISR, self-hosted | No `pages/` directory in tree (313 blobs). No `getStaticProps` or `getStaticPaths`. App Router only | NO | **CLOSED_NOT_AFFECTED** |
| 3 | GHSA-mcj8-r9mp-w47p | CVE-2026-94484 | Medium | Cache poisoning SSG/ISR via root-level catch-all | 2026-09-30 18:14 | `>= 16.0.0` (15: `>= 15.0.0`) | `16.3.?` / `15.5.?` | YES | 16.3.8 / 15.5.27 | YES | A root-level catch-all **page** together with SSG/ISR routes | No `app/[...x]/page.*` or `app/[[...x]]/page.*`. The only catch-all is `app/api/auth/[...nextauth]/route.ts` (nested API route handler, not a root page) | NO | **CLOSED_NOT_AFFECTED** |
| 4 | GHSA-f87g-xv8r-7p7x | CVE-2026-94485 | Medium | Metadata image routes ignore dynamicParams (webpack) | 2026-09-30 18:14 | `>= 16.0.0` | `16.3.?` | YES | 16.3.8 | YES | App Router built with **webpack** and metadata image routes (`opengraph-image`/`twitter-image`). Turbopack builds are not affected | No `opengraph-image*`, `twitter-image*`, or `icon.*` route files (only `app/favicon.ico` and `app/manifest.ts`). Build is Turbopack (Next 16 default, no `--webpack`) | NO | **CLOSED_NOT_AFFECTED** |
| 5 | GHSA-h694-7cp9-m8p3 | CVE-2026-103004 (on GHSA; blog lists none) | Medium | Cache leak across root params in nested `'use cache'` | 2026-09-30 18:14 (updated 2026-10-01 16:42) | `16.3.0` (literal) | **`16.3.8` (final)** | NO | 16.3.8 | NO by the literal range. Also config-gated | `cacheComponents: true` | No `cacheComponents`, `useCache`, or `"use cache"` anywhere in source | NO | **CLOSED_NOT_AFFECTED** |
| 6 | GHSA-3w37-wq28-93x7 | CVE-2026-94544 | Medium | Pending `use cache` fill leaks Draft Mode content | 2026-09-30 18:14 | `16.3.0` (literal) | `16.3.?` | YES | 16.3.8 | NO by the literal range. Also config-gated | Cache Components / `experimental.useCache` **and** Draft Mode previews | No `cacheComponents`, `useCache`, `"use cache"`, or `draftMode` usage | NO | **CLOSED_NOT_AFFECTED** |
| 7 | GHSA-39w2-rjm5-chcv | CVE-2026-94486 | Low | `next dev` MCP endpoint info disclosure | 2026-09-30 18:14 | `>= 16.0.0` | `16.3.?` | YES | 16.3.8 | YES | Only `next dev`. "Production deployments do not serve this endpoint." | Production image runs `npm run start` → `next start` (Dockerfile, averion/deploy/Dockerfile, `NODE_ENV=production`). `npm run dev` exists for developers | NO in the RC artifact. Residual risk on developer workstations | **CLOSED_NOT_REACHABLE** (scope: RC2 production artifact) |
| 8 | PENDING-CRITICAL-1 (no GHSA, no CVE) | — | Critical | not disclosed | not published | UNKNOWN | UNKNOWN | — | "a later Next.js release" (S1) | UNKNOWN | UNKNOWN | cannot be assessed | UNKNOWN | **BLOCKED_EVIDENCE_MISSING** |
| 9 | PENDING-HIGH-1 (no GHSA, no CVE) | — | High | not disclosed | not published | UNKNOWN | UNKNOWN | — | "a later Next.js release" (S1) | UNKNOWN | UNKNOWN | cannot be assessed | UNKNOWN | **BLOCKED_EVIDENCE_MISSING** |

Rows 8–9 SOURCE = S1 upcoming-note update (2026-09-30). No advisory ID was invented. Search of `vercel/next.js` repository advisories published since 2026-09-01 (raw/repo_adv_sept.txt) returns only the 7 above plus GHSA-vcvr (Sep-22). There is no GHSA for the 2 pending items.

Notes on rows 5–6: the GHSA range field is the bare string `16.3.0`. Read literally it excludes 16.2.6. If upstream meant `>= 16.3.0`, it still excludes 16.2.6. Either way the precondition (Cache Components) is absent, so the status does not depend on how the range is read.

Basis of the CLOSED_* statuses: static evidence at the pinned HEAD (config, file tree, source grep over 225 fetched source files) checked against each advisory's stated preconditions. None depends on the placeholder patched version. If anyone adds `images.remotePatterns`, `cacheComponents`/`useCache`, Draft Mode, a `pages/` SSG/ISR route, a root catch-all page, a metadata image route with a webpack build, or ships `next dev`, these rows must be re-opened.

## Summary
- Published 7: CLOSED_NOT_AFFECTED ×6, CLOSED_NOT_REACHABLE ×1 → 7 resolved by applicability, **not by patch**.
- Pending 2: BLOCKED_EVIDENCE_MISSING ×2.
- OPEN_VULNERABLE (within the 9): 0. OPEN_RANGE_UNVERIFIED (within the 9): 0 (the 2 unknowns are classed BLOCKED_EVIDENCE_MISSING because no range exists at all).

## Separate and outside the 9, but material to the exit gate: other published `next` advisories that cover 16.2.6
Source: GitHub global advisory DB and npm bulk-advisory (`npm audit --package-lock-only`, see 05). The Sep-22 OG advisory is **not** one of the stated 9 (it was its own out-of-band release, S5 https://nextjs.org/blog/upcoming-nextjs-security-release-september-22-2026). It is recorded here and is not counted in the matrix.

| ADVISORY | SEV | 16.x affected | first_patched | 16.2.6 | Reachability note (static, unverified) | STATUS (outside the matrix) |
|---|---|---|---|---|---|---|
| GHSA-vcvr-r3jv-pc5j / CVE-2026-94545 (Sep-22 OG) | Critical | `>= 16.2.0 < 16.3.6` | 16.3.6 | IN RANGE | No `next/og` or `ImageResponse` import in source | CLOSED_NOT_REACHABLE (code) — version vulnerable |
| GHSA-2xp9-vwfh-vxw4 (AVIF RCE, image optimizer/libheif) | Critical | `>= 16.0.0 < 16.3.3` | 16.3.3 | IN RANGE | Optimizer is on (`next/image`, no `unoptimized`). No `remotePatterns` and no `.avif` in `public/` → attacker cannot supply AVIF. Not proven at runtime | OPEN_VULNERABLE (version) / likely not reachable |
| GHSA-p293-qw3h-jr36 / CVE-2026-75604 (Windows RCE) | Critical | `>= 16.0.0 < 16.3.3` | 16.3.3 | IN RANGE | Deployed in Linux `node` containers | CLOSED_NOT_REACHABLE (platform) — version vulnerable |
| GHSA-6gpp-xcg3-4w24 Middleware/Proxy bypass (Turbopack, single locale) | High | `>= 16.0.0 < 16.2.11` | 16.2.11 | IN RANGE | `proxy.ts` is the auth gate (redirects unauthenticated users to /login) and build is Turbopack. The "single locale" condition was not verified → **potentially reachable** (auth-bypass class) | OPEN_VULNERABLE |
| GHSA-m99w-x7hq-7vfj DoS via Server Actions | High | `< 16.2.11` | 16.2.11 | IN RANGE | Server Actions present (`lib/i18n/actions.ts`) → **potentially reachable** | OPEN_VULNERABLE |
| GHSA-89xv-2m56-2m9x SSRF in Server Actions on custom servers | High | `< 16.2.11` | 16.2.11 | IN RANGE | `next start`, no custom server → likely not reachable | OPEN_VULNERABLE (version) |
| GHSA-p9j2-gv94-2wf4 SSRF in rewrites | High | `< 16.2.11` | 16.2.11 | IN RANGE | No `rewrites` in next.config. `proxy.ts` only does `NextResponse.redirect` (no rewrite) → likely not reachable | OPEN_VULNERABLE (version) |
| GHSA-68g3-v927-f742, GHSA-4633-3j49-mh5q cache confusion; GHSA-4c39-4ccg-62r3 Edge payload; GHSA-q8wf-6r8g-63ch SVG DoS; GHSA-955p-x3mx-jcvp Server Function endpoint disclosure | Moderate | `< 16.2.11` | 16.2.11 | IN RANGE | not individually assessed | OPEN_VULNERABLE (version) |

So 16.2.6 is below published, final (non-placeholder) first_patched versions for **12** other `next` advisories (3 Critical). That alone prevents FROZEN_PASS.
