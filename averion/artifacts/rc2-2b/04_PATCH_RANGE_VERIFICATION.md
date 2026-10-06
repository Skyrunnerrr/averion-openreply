# 04 PATCH RANGE VERIFICATION (Phase C)

Rule applied: the blog's "npm install next@16.3.8" is **not** accepted as proof that a GHSA's patched_versions is final while the GHSA itself still reads `16.3.?`.

## Per-advisory patched_versions (GitHub repo advisory API, read 2026-10-06 CEST)
| ADVISORY | vulnerable_version_range | patched_versions | Placeholder? | Global DB (reviewed) | Blog says | FINAL_RANGE_VERIFIED |
|---|---|---|---|---|---|---|
| GHSA-cjq9-62q9-8jv4 | `>= 16.0.0 < 16.3.?` | `16.3.?` | YES | 404 | 16.3.8 | NO |
| GHSA-4jqv-mc3x-m676 | `>= 15.0.0` / `>= 16.0.0` | `15.5.?` / `16.3.?` | YES | 404 | 15.5.27 / 16.3.8 | NO |
| GHSA-mcj8-r9mp-w47p | `>= 16.0.0` / `>= 15.0.0` | `16.3.?` / `15.5.?` | YES | 404 | 16.3.8 / 15.5.27 | NO |
| GHSA-f87g-xv8r-7p7x | `>= 16.0.0` | `16.3.?` | YES | 404 | 16.3.8 | NO |
| GHSA-h694-7cp9-m8p3 | `16.3.0` | `16.3.8` | NO (updated 2026-10-01 16:42 CEST) | 404 | 16.3.8 | YES (patched value final; range string looks incomplete, see 02) |
| GHSA-3w37-wq28-93x7 | `16.3.0` | `16.3.?` | YES | 404 | 16.3.8 | NO |
| GHSA-39w2-rjm5-chcv | `>= 16.0.0` | `16.3.?` | YES | 404 | 16.3.8 | NO |
| Pending Critical | — | — | no GHSA | — | "later release" | NO |
| Pending High | — | — | no GHSA | — | "later release" | NO |

Result: **FINAL_PATCH_RANGES_VERIFIED=NO**. 1 of 7 published GHSAs has a final patched version. 6 of 7 still show placeholders. 2 of 9 have no advisory at all. The upper bounds of the "vulnerable" ranges for 6 of 7 are open-ended or placeholder. Only lower bounds are concrete, and all of them (16.0.0) cover 16.2.6 except h694 and 3w37.

## Lockfile resolved version on PR HEAD
`next` = **16.2.6** (HEAD 93a793ae). Below every candidate fix (16.3.8) and below the final first_patched of the out-of-matrix advisories (16.2.11, 16.3.3, 16.3.6).

## Manifest / Lockfile / Installed
- Manifest: `^16.2.6`
- Lockfile: `16.2.6`, verified with a registry integrity match
- Installed: **UNKNOWN**. No install was done and the image was not inspected. INSTALLED_GRAPH_VERIFIED=NO.

## MINIMAL_FIX recommendation (NOT EXECUTED; for the RC2_2B_REMEDIATION_ONLY phase, if Averi authorizes it)
- Change `next` from 16.2.6 to **16.3.8**: manifest `"next": "16.3.8"` (exact pin recommended for RC provenance) plus a regenerated lockfile. Also move `eslint-config-next` to 16.3.8 to keep @next/* aligned (dev only).
- What it fixes: all published, final first_patched `next` advisories covering 16.2.6 (max first_patched = 16.3.6 for GHSA-vcvr). It also matches the blog's fix version for the 7 Sep-30 advisories.
- What it does **not** fix: the 2 pending (Critical + High) items. Placeholder ranges stay unverifiable until GitHub finalizes them.
- Risk: this is a minor-line jump (16.2 → 16.3). It needs a rebuild, the RC2.2A reproducibility proofs again (new lockfile sha256 → new LOCKFILE_SHA256 build arg and image digest), and tests. next 16.3.8 peerDependencies (registry) are react/react-dom `^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0` and engines node >=20.9.0, so react 19.2.4 and the node:20 base already satisfy them.
