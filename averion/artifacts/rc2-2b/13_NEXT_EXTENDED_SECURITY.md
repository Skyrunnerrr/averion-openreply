# 13 NEXT EXTENDED ADVISORY MATRIX

Scope: published `next` GHSAs other than the September 30 set of 9, plus every published `next` GHSA whose final patched version is what made 16.2.6 unsafe. Source: `GET /repos/vercel/next.js/security-advisories?state=published` on 2026-10-06 (69 advisories). Newest `published_at` in that list is 2026-09-30. npm `latest` is still 16.3.8. No 16.3.9 exists.

`npm audit` on the new lockfile no longer lists `next`. The advisories npm knew about for 16.2.6 (below) are absent from that audit. The seven September 30 GHSAs are still absent from npm audit because they are not in the reviewed global advisory DB. That absence is not treated as proof they are closed. Their status is in `12_ADVISORY_MATRIX_RERUN.md`.

## Advisories that made 16.2.6 unsafe, after 16.3.8

| ADVISORY | SEV | Final first patched (16.x) | 16.2.6 | 16.3.8 | Adjudication |
|---|---|---|---|---|---|
| GHSA-vcvr-r3jv-pc5j | Critical | 16.3.6 | in range `>=16.2.0 <16.3.6` | 16.3.8 is not `< 16.3.6` | **CLOSED_PATCHED**. No `next/og` / `ImageResponse` use was required to leave the range. |
| GHSA-2xp9-vwfh-vxw4 | Critical | 16.3.3 | in range `<16.3.3` | not in range | **CLOSED_PATCHED** |
| GHSA-p293-qw3h-jr36 | Critical | 16.3.3 | in range `>=16.0 <16.3.3` | not in range | **CLOSED_PATCHED**. Deploy target remains Linux. |
| GHSA-6gpp-xcg3-4w24 | High | 16.2.11 | in range `<16.2.11` | not in range | **CLOSED_PATCHED**. This was the Turbopack proxy-bypass advisory. `proxy.ts` is still the auth gate. The version is no longer in the published range. |
| GHSA-m99w-x7hq-7vfj | High | 16.2.11 | in range `<16.2.11` | not in range | **CLOSED_PATCHED**. Server Actions remain in the app. The version is no longer in the published range. |
| GHSA-89xv-2m56-2m9x | High | 16.2.11 | in range | not in range | **CLOSED_PATCHED**. App still uses `next start`, not a custom server. |
| GHSA-p9j2-gv94-2wf4 | High | 16.2.11 | in range | not in range | **CLOSED_PATCHED**. Still no `rewrites`. |
| GHSA-68g3-v927-f742, GHSA-4633-3j49-mh5q, GHSA-4c39-4ccg-62r3, GHSA-q8wf-6r8g-63ch, GHSA-955p-x3mx-jcvp | Moderate | 16.2.11 | in range | not in range | **CLOSED_PATCHED** by the final 16.2.11 bound |

Older high/critical advisories whose 16.x patched version is 16.2.6 or earlier (GHSA-26hh, GHSA-267c, GHSA-492v, GHSA-c4j6, GHSA-36qx, GHSA-8h8q, GHSA-q4gf, GHSA-h25m, GHSA-5j59, GHSA-mwv6, GHSA-9qr9, and the May 2026 set patched at 16.2.5) already excluded 16.2.6 or were fixed in 16.0.x/16.1.x and stay fixed on 16.3.8. None of those published ranges has an upper bound above 16.3.8.

GHSA-9g9p-9gw9-jx7f and GHSA-g77x-44xx-532m are old image-optimizer entries whose recorded ranges are literal `10`–`14` lines, not 16.3.8. They are not an open 16.3.8 finding.

## Applicable Critical / High left UNVERIFIED or OPEN

Published Critical on 16.3.8: **0**
Published High on 16.3.8: **0**

The September 30 high (GHSA-cjq9) is in the 9/9 matrix. It is CLOSED_NOT_AFFECTED by the missing `remotePatterns` precondition. Its GHSA patched field is still the placeholder `16.3.?`, so the range is PATCH_RANGE_PENDING. It is not left UNVERIFIED.

The unpublished critical and the unpublished high are not in this extended table. They stay BLOCKED_UPSTREAM in the 9/9 matrix. They are not counted here as published findings, and they are not closed.

EXTENDED_NEXT_CRITICAL=0
EXTENDED_NEXT_HIGH=0
