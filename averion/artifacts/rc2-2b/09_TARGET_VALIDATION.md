# 09 TARGET VALIDATION — next@16.3.8

Run: AVERION_SOCIAL_OPENREPLY_RC2_2B_REMEDIATION_01
Baseline HEAD: `93a793aefe7c93f06b4bc2ffc464c277aad46353`
Captured: 2026-10-06 (UTC). Sources read this run, before any pin.

| Source | What it established |
|---|---|
| `npm view next` dist-tags and `time` | `latest` = **16.3.8**, published `2026-09-30T16:07:21.198Z`. `backport` = 15.5.27. `canary` = 16.4.0-canary.61 (not a stable target). |
| `npm view next versions` | Last stable 16.2 is **16.2.12** (`2026-07-25T20:45:53.940Z`). Stable 16.3 line is 16.3.0 … 16.3.8. No 16.2.13+ and no 16.3.9. |
| `npm view next@16.3.8` | Package exists. `engines.node` `>=20.9.0`. peers below. |
| GitHub release `vercel/next.js` v16.3.8 | Published `2026-09-30T16:13:46Z`. Release text lists the seven September 30 advisories as the contents of this release. |
| https://nextjs.org/blog/upcoming-nextjs-security-release-september-2026 | Update 2026-09-29: **16.3.7 does not include** the security fixes. Update 2026-09-30: seven vulnerabilities ship in 16.3.8 / 15.5.27; one critical and one high remain pending upstream. |
| https://nextjs.org/blog/september-2026-security-release | Install instruction for the 16 line is `next@16.3.8`. |
| https://nextjs.org/blog/next-16-3 | 16.3 is a minor release on major 16. Quote: improvements "with zero changes to your application code." Instant Navigations (`cacheComponents`, `partialPrefetching`) are opt-in. |
| `GET /repos/vercel/next.js/security-advisories?state=published` | 69 published advisories. Newest published_at in that list is 2026-09-30. No later stable `next` advisory was returned. |

## Smallest load-bearing stable target

Published fixes that make 16.2.6 unsafe, and the first stable 16.x version that contains each:

| First patched (16.x, final GHSA value) | Examples | 16.2.12 contains it? | 16.3.6 contains it? | 16.3.7 contains it? | 16.3.8 contains it? |
|---|---|---|---|---|---|
| 16.2.11 | GHSA-6gpp, GHSA-m99w, GHSA-89xv, GHSA-p9j2, and the other 2026-07-21 set | Yes (16.2.12 > 16.2.11) | Yes | Yes | Yes |
| 16.3.3 | GHSA-2xp9 (AVIF RCE), GHSA-p293 (Windows RCE) | No. 16.2.12 was published before 16.3.3 and no later 16.2 exists | Yes | Yes | Yes |
| 16.3.6 | GHSA-vcvr (next/og RCE) | No | Yes (this is the patched version) | Yes | Yes |
| 16.3.8 | September 30 set of 7 (blog + GitHub release v16.3.8). GHSA-h694 `patched_versions` is the final string `16.3.8`. The other six still show placeholder `16.3.?` in the GHSA record. | No | No | No. Vercel stated 16.3.7 is a bugfix without these security fixes. npm time: 16.3.7 = `2026-09-29T09:04:19.157Z`, before the 2026-09-30 release. | Yes |

15.5.27 is the 15.x backport. Moving this app from 16.2.6 to 15.5.27 would leave the 16 line. That is the wrong direction.

16.4.0-canary.61 is newer and is not a stable release. It is not the smallest load-bearing target.

**Conclusion:** `next@16.3.8` is the smallest stable release that includes every known published Next fix relevant to 16.2.6, including the September 30 set. It does not include the two unpublished (critical + high) items. Those stay upstream-pending.

## Not a major or architecture break

- Semver: 16.2.6 → 16.3.8 stays on major **16**. Minor 2 → 3, patch to 8.
- The 16.3 announcement describes default runtime/build changes (Turbopack dev eviction, Turbopack filesystem cache for `next build`, native Node streams in App Router SSR, prefetch batching) and says existing apps need no code changes for those.
- Instant Navigations, Cache Components, the Rust React Compiler, and `experimental.useOffline` are flag-gated. `next.config.ts` at this HEAD sets only `reactCompiler: true` and `turbopack.root`. It does not set `cacheComponents`, `partialPrefetching`, `experimental.turbopackRustReactCompiler`, or `experimental.useOffline`. This pin does not turn those on.
- The app is already App Router only (no `pages/`), already uses `proxy.ts` (Next 16 proxy convention), and already runs `next build` / `next start`. No custom server.
- `engines.node` stays `>=20.9.0`, the same floor already required by next 16.2.6. Local Node is v22.14.0. The image base is `node:20` (canonical builder pins a node digest). Both satisfy `>=20.9.0`.

Known issue, not an architecture break and not a reason to reject the target: GitHub issue vercel/next.js#97899 reports retained render-path `Error` objects starting in 16.3.0 under high-cardinality Cache Components traffic. This app does not enable Cache Components. The issue does not identify 16.3.8 as a new architecture. It is recorded as a residual watch item, not a validation failure.

## Peer and override check

No `overrides` or `resolutions` field exists in `package.json`.

| Consumer | Requirement | Repo | Conflict? |
|---|---|---|---|
| next@16.3.8 peer `react` / `react-dom` | `^18.2.0 \|\| 19.0.0-rc-de68d2f4-20241204 \|\| ^19.0.0` (same range already declared by next 16.2.6) | exact `19.2.4` | No |
| next@16.3.8 optional peers | `sass`, `@playwright/test`, `@opentelemetry/api`, `babel-plugin-react-compiler` (`*`) are optional | `babel-plugin-react-compiler@1.0.0` is already a direct devDependency. Others are unused. | No |
| next-auth@5.0.0-beta.31 peer `next` | `^14.0.0-0 \|\| ^15.0.0 \|\| ^16.0.0` | 16.3.8 matches `^16.0.0` | No |
| next-auth peer `react` | `^18.2.0 \|\| ^19.0.0` | 19.2.4 | No |
| @auth/core@0.41.2 | no `next` peer. Depends from next-auth as exact `0.41.2` | unchanged by this pin | No |
| @vercel/analytics@2.0.1 peer `next` | `>= 13`, optional | 16.3.8 | No |
| eslint-config-next@16.3.8 peers | `eslint >=9`, `typescript >=3.3.1` (typescript optional) | `eslint` `^9`, `typescript` `^5` | No |
| eslint-config-next@16.3.8 dependency | `@next/eslint-plugin-next` exact `16.3.8` | aligned with the next pin. It does not pull a second `next` | No |
| OpenReply config / components | `next/image` on local SVG paths, `proxy.ts` using `NextRequest` / `NextResponse`, `reactCompiler: true` | no API removal in the 16.3 notes that these call sites depend on. Rust compiler stays off. | No |

Transitive change that the lockfile regeneration must accept, because it is `next`'s own dependency, not an extra direct bump: next@16.3.8 depends on `postcss@8.5.23` (next@16.2.6 pinned nested `postcss@8.4.31`). `@next/env` and the `@next/swc-*` optional packages move with `next` to 16.3.8. `@next/eslint-plugin-next` moves with `eslint-config-next`.

## Package availability

`npm view next@16.3.8 version` returned `16.3.8`. `npm view eslint-config-next@16.3.8 version` returned `16.3.8`. Both are on the public npm registry.

## Decision

TARGET_VALIDATION=**PASS**

Proceed to the exact pin of `next` and `eslint-config-next` at 16.3.8. Do not pin a canary. Do not downgrade to 15.5.27. Do not treat 16.3.8 as closing the two unpublished advisories.
