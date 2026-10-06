# 12 ADVISORY MATRIX RE-RUN (9/9) after next 16.3.8

Re-read 2026-10-06 from the same sources as the Phase A–D matrix: the September 30 Next.js security blog, the September 23 upcoming note (updates of 2026-09-29 and 2026-09-30), and `GET /repos/vercel/next.js/security-advisories?state=published`.

Installed graph under test: **next 16.3.8** (manifest = lockfile = `node_modules`). App Router only. `next.config.ts` still has no `images`, no `cacheComponents`, no `experimental.useCache`. Source grep after the pin found no `remotePatterns`, `"use cache"`, `draftMode`, `getStaticProps`, `opengraph-image`, `twitter-image`, or `rewrites`. No `pages/` directory. The only catch-all route file is `app/api/auth/[...nextauth]/route.ts`. Dynamic pages exist (`app/templates/[slug]`, campaigns, invite, reports). They are not a root catch-all page. Production start is `next start`. The build log says Turbopack.

Installing 16.3.8 does **not** close a row whose GHSA `patched_versions` is still `16.3.?`, and it does **not** close the two unpublished items.

| # | ADVISORY | SEV | 16.3.8 vs range | Precondition still absent? | STATUS |
|---|---|---|---|---|---|
| 1 | GHSA-cjq9-62q9-8jv4 | High | GHSA still `patched_versions=16.3.?`. Blog and GitHub release v16.3.8 say this fix is in 16.3.8. Range is not final. | Yes. No `images.remotePatterns`. Advisory: no remote patterns means not affected. | **CLOSED_NOT_AFFECTED** (unchanged) |
| 2 | GHSA-4jqv-mc3x-m676 | Medium | Placeholder `16.3.?` / `15.5.?` | Yes. No `pages/`, no `getStaticProps` / `getStaticPaths`. | **CLOSED_NOT_AFFECTED** (unchanged) |
| 3 | GHSA-mcj8-r9mp-w47p | Medium | Placeholder `16.3.?` / `15.5.?` | Yes. No root catch-all page. | **CLOSED_NOT_AFFECTED** (unchanged) |
| 4 | GHSA-f87g-xv8r-7p7x | Medium | Placeholder `16.3.?` | Yes. No metadata image route files. Build is Turbopack. | **CLOSED_NOT_AFFECTED** (unchanged) |
| 5 | GHSA-h694-7cp9-m8p3 | Medium | GHSA `patched_versions=16.3.8` (final). Vulnerable range string is still the literal `16.3.0`. | Yes. No Cache Components / `use cache`. | **CLOSED_NOT_AFFECTED** (unchanged). 16.3.8 is the patched version, so this row is also outside the patched product. |
| 6 | GHSA-3w37-wq28-93x7 | Medium | Placeholder `16.3.?`. Range string literal `16.3.0`. | Yes. No Cache Components and no `draftMode`. | **CLOSED_NOT_AFFECTED** (unchanged) |
| 7 | GHSA-39w2-rjm5-chcv | Low | Placeholder `16.3.?` | Production process is `next start`, not `next dev`. | **CLOSED_NOT_REACHABLE** (unchanged, RC production artifact) |
| 8 | PENDING-CRITICAL-1 | Critical | No GHSA, no CVE, no range. Blog: later release. | Cannot be assessed. | **BLOCKED_UPSTREAM** / **BLOCKED_EVIDENCE_MISSING** |
| 9 | PENDING-HIGH-1 | High | No GHSA, no CVE, no range. Blog: later release. | Cannot be assessed. | **BLOCKED_UPSTREAM** / **BLOCKED_EVIDENCE_MISSING** |

Prior 7 did not regress. None of them was flipped to CLOSED because 16.3.8 is installed. Rows 8 and 9 were not auto-closed.

TARGET_ADVISORIES_TOTAL=9
TARGET_RESOLVED=7
TARGET_UPSTREAM_PENDING=2
