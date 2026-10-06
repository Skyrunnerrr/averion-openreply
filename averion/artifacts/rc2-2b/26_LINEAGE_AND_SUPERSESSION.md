# 26 LINEAGE AND SUPERSESSION

RUN=AVERION_SOCIAL_OPENREPLY_RC2_2B_ARTIFACT_REVIEW_PREP_01

No evidence file 09–24 was rewritten. This map only orders commits that already exist.

## Commit lineage

| Order | Commit | Role | Tree | What it contains |
| --- | --- | --- | --- | --- |
| 1 | `93a793aefe7c93f06b4bc2ffc464c277aad46353` | BASELINE | parent of the pin | `next` and `eslint-config-next` are `^16.2.6`. `averion/artifacts/rc2-2b/` has no files. |
| 2 | `fe2f1ffee3922e227bb1d12e5d99973560def82f` | REMEDIATION | `78d2616f019b1e755ec18270f483701e9bd148aa` | Parent is `93a793a`. Exact `next@16.3.8` and `eslint-config-next@16.3.8`. Adds evidence `09`–`17` only. Image was not rebuilt in this commit. |
| 3 | `2e1f7b118c095171ae49f7b23c53a08ecbbfcb17` | Dockerfile experiment | `10ff2c40b85f864b3e8a31640f8ad81eab1e200d` | Parent is `fe2f1ff`. Not an evidence commit and not the image archive. |
| 4 | `aaecf36041f53c1117db07f59b0f95c112654f26` | Revert of that experiment | `78d2616f019b1e755ec18270f483701e9bd148aa` | Parent is `2e1f7b1`. Tree equals `fe2f1ff`. |
| 5 | `61fc7586693e101942e58fbc7d1749cff18fbf7e` | LOCAL_COMPLETION | `03dc77625bdbc533f3a2c3d59024582005ee3f3e` | Parent is `aaecf36`. Diff against `fe2f1ff` is evidence `18`–`24` only. Package manifest and lockfile are unchanged from `fe2f1ff`. |

`git merge-base --is-ancestor` accepts `93a793a` as an ancestor of `61fc758`.

## Head to evidence

| Head | Evidence that belongs to it | Evidence that must not be attributed to it |
| --- | --- | --- |
| BASELINE `93a793a` | None under `averion/artifacts/rc2-2b/`. `09` cites this SHA as the pre-pin baseline it measured. | `09`–`24` are not in this commit. |
| REMEDIATION `fe2f1ff` | `09`–`17`. | `18`–`24` do not exist in this commit. The later image was not built from a dirty tree of this commit's successors. |
| Experiment `2e1f7b1` | No RC2.2B evidence file. | Do not treat this tree as the image source. `21` records that a `RUN --add-host` edit was reverted. |
| Revert `aaecf36` | Same tree as `fe2f1ff`, so the same `09`–`17` bytes. | No additional evidence. |
| LOCAL_COMPLETION `61fc758` | `18`–`24`, measured against the `fe2f1ff` code tree. | `09`–`17` were not modified. The image `SOURCE_SHA` is `fe2f1ff`, not `61fc758`. |

## Supersession of `17_RESIDUAL_BLOCKERS.md`

`17` is authoritative for the remediation commit only. Counts below are taken from `17` and from `18`–`24`. This prep run did not re-score them.

| `17` class | At `fe2f1ff` | Later evidence | Still open after `24` |
| --- | --- | --- | --- |
| A CONFIRMED_VULNERABILITY=0 | Closed count | Not reopened by `18`–`24` | 0 |
| B PATCH_AVAILABLE_NOT_APPLIED=0 | Closed count | Auth was not classified as an unapplied fix. beta.32 was not installed | 0 |
| C UPSTREAM_ADVISORY_PENDING=2 | PENDING-CRITICAL-1, PENDING-HIGH-1 | No later file adds a GHSA, CVE, or range | 2 |
| D PATCH_RANGE_PENDING=6 | GHSA-cjq9, GHSA-4jqv, GHSA-mcj8, GHSA-f87g, GHSA-3w37, GHSA-39w2 | GHSA-h694 stays out of this count. No later file finalizes the six placeholders | 6 |
| E LOCAL_EVIDENCE_MISSING=0 | Manifest, lockfile, installed next, and the 9/9 preconditions | `24` also records 0, for the local-completion evidence set | 0 |
| F TEST_COVERAGE_GAP=9 | The nine rows in `15` | `19` closes eight. `18`, `20`, and `23` execute the 12 Postgres tests. `22` records the local runtime rows | Local gaps 0. One external row remains |
| G EXTERNAL_INFRA_DEPENDENCY=2 | No Postgres or Redis; image not rebuilt | `20` records local Postgres and Redis. `21` records the rebuilt local image | Those two local items are closed. Historical provenance JSON was not rewritten |

The last paragraph of `17` names C and D as the remaining upstream freeze items. The table in the same file still has F and G open at that commit. The table is the count. The paragraph does not say F and G were already closed.

## Findings from `17` that later evidence closed

1. Postgres suite skipped (part of F, and the database half of G). Closed by `18`, `20`, and `23`: 12 passed, 0 failed, full suite 346 passed and 0 skipped when `TEST_DATABASE_URL` is set.
2. Live `/api/health` (F). Closed by `22`: 200, status ok.
3. Live webhook POST (F). Closed by `22`: verify 200, bad signature 401, signed empty Instagram payload 200. No Meta delivery.
4. Live Server Action POST (F). Closed by `22`: `setLocale` zh-TW returned 200 and set the locale cookie; `nope` returned 500.
5. Live magic-link send (F). Closed by `22` against local SMTP. Resend was not used.
6. Public edge (F). Closed by `22` via `ingress-edge.mjs`. `prove-public-edge.mjs` was not run. Compose proof was not claimed.
7. Worker (F). Closed by `22`: worker started, automations disabled.
8. `scripts/cron.sh` (F). Closed by `22` for `attach-next-reel`. `refresh-tokens` and `snapshot-followers` were not invoked.
9. Image not rebuilt (G). Closed for the local image by `21`: two `--no-cache` builds with `rewrite-timestamp=true` matched. Registry push was not done.

## Findings from `17` that stay open

| Item | Current value | Where stated |
| --- | --- | --- |
| LOCAL_TEST_GAPS | 0 | `24` `TEST_COVERAGE_GAPS_REMAINING_LOCAL=0` |
| UNEXPLAINED_SKIPS | 0 | `18` and `24` |
| IMAGE_REBUILD_PENDING | 0 | `21` `RC2_2A_IMAGE_CURRENT=YES` |
| LOCAL_RUNTIME_PENDING | 0 | `22` `LOCAL_RUNTIME_SANITY=PASS` |
| LOCAL_EVIDENCE_MISSING | 0 | `24` |
| UPSTREAM_ADVISORY_PENDING | 2 | `17` and `24` |
| PATCH_RANGE_PENDING | 6 | `17` and `24` |
| LIVE_INSTAGRAM_OAUTH | EXTERNAL_LIVE_PROVIDER_GATE | `19` gap 6, `BLOCKED_LIVE_PROVIDER` |

`CLOSED_BY_LOCAL_RUNTIME` is a label `19` uses for execution on the new image. It is not one of the six adjudication enums named in the local-completion request. `19` says those rows are not a new vitest file and not the earlier unit-only notes.

## Current residual

LOCAL_TEST_GAPS=0
UNEXPLAINED_SKIPS=0
IMAGE_REBUILD_PENDING=0
LOCAL_RUNTIME_PENDING=0
LOCAL_EVIDENCE_MISSING=0
UPSTREAM_ADVISORY_PENDING=2
PATCH_RANGE_PENDING=6
LIVE_INSTAGRAM_OAUTH=EXTERNAL_LIVE_PROVIDER_GATE

SUPERSESSION_CLEAR=YES
LINEAGE_CLEAR=YES
