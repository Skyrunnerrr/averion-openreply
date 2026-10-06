# 29 HUMAN REVIEW CHECKLIST

RUN=AVERION_SOCIAL_OPENREPLY_RC2_2B_ARTIFACT_REVIEW_PREP_01

Independent review order. Do not treat `17_RESIDUAL_BLOCKERS.md` as the current end state. The current local gate is `24_LOCAL_COMPLETION_GATE.md`. This checklist does not change any security judgment.

Review result of this prep run, before a human accepts or rejects the numbering gap:

EVIDENCE_FILES_01_29_COMPLETE=NO
LINEAGE_CLEAR=YES
SUPERSESSION_CLEAR=YES
REAL_CONTRADICTIONS=0
STALE_CURRENT_CLAIMS=0
SECRET_LEAKS=0
CURRENT_TRUTH_SNAPSHOT=CONSISTENT
LOCAL_FIXABLE_BLOCKERS=0
ARTIFACT_REVIEW_READY=NO
LOCAL_RC2_2B_COMPLETION=PASS
RC2_2B=HOLD_UPSTREAM_SECURITY_EVIDENCE

`ARTIFACT_REVIEW_READY=NO` because numbers 01 through 08 have no files. `10` and the pull request already define the authored sets as `09`–`17` and `18`–`24`. Accepting that absence is a human decision. This prep run does not make it.

Passing this checklist does not authorize merge, Wave 3, Meta live, a live pilot, or production.

## 1. Lineage

Open `26_LINEAGE_AND_SUPERSESSION.md` and `25_EVIDENCE_INDEX.md`.

Confirm:

- BASELINE is `93a793aefe7c93f06b4bc2ffc464c277aad46353` (`next` `^16.2.6`, no `rc2-2b` files).
- REMEDIATION is `fe2f1ffee3922e227bb1d12e5d99973560def82f` (evidence `09`–`17` only).
- `2e1f7b1` was reverted by `aaecf36`, and that revert tree equals `fe2f1ff`.
- LOCAL_COMPLETION is `61fc7586693e101942e58fbc7d1749cff18fbf7e` (evidence `18`–`24` only).
- The image archive is `fe2f1ff`, not `61fc758` and not `2e1f7b1`.
- `09`–`17` are unchanged between `fe2f1ff` and HEAD.

Fail the step if any evidence file is attributed to a different commit than the index.

## 2. Security matrix

Open `12_ADVISORY_MATRIX_RERUN.md`, `13_NEXT_EXTENDED_SECURITY.md`, and `17` classes A–D.

Confirm:

- Rows 1–7 stay CLOSED_NOT_AFFECTED or CLOSED_NOT_REACHABLE by precondition.
- Rows 8–9 stay BLOCKED_UPSTREAM (PENDING-CRITICAL-1, PENDING-HIGH-1).
- EXTENDED_NEXT_CRITICAL=0 and EXTENDED_NEXT_HIGH=0.
- CONFIRMED_VULNERABILITY=0.
- No file `18`–`24` introduces a GHSA, CVE, or patched range.

Fail the step if a later file closes an upstream row without a new upstream identifier.

## 3. Next 16.3.8 remediation

Open `09_TARGET_VALIDATION.md` and `10_NEXT_16_3_8_REMEDIATION.md`.

Confirm:

- The pin is exact `16.3.8` for `next` and `eslint-config-next`.
- Baseline was `^16.2.6`.
- `09` says 16.3.8 does not include the two unpublished items.
- No auth package was upgraded in that change list.

## 4. Auth triage

Open `14_AUTH_SECURITY_TRIAGE.md` and the still-listed rows in `16_SECURITY_RESCAN_AFTER.md`.

Confirm:

- GHSA-8fpg is NOT_AFFECTED.
- GHSA-7rqj is NOT_REACHABLE on the AVERION profile.
- GHSA-xmf8 is NOT_REACHABLE.
- `next-auth@5.0.0-beta.32` and `@auth/core@0.41.3` were not installed.
- npm audit still lists the auth packages. That listing is not reclassified here.

## 5. Installed graph

Open `11_INSTALLED_GRAPH_AFTER.md`.

Confirm manifest, lockfile, and installed `next` are 16.3.8, one copy, lockfile sha256 `09d2d49964db488a3ca1f543a6919707131a336dce63c62084a8e2654873f6a7`.

`28` records that this prep run rechecked the manifest, the lockfile hash, and the installed version string. It did not repeat `npm ci`.

## 6. Build

Open `15_BUILD_TEST_AFTER.md` for the host build and `21_RC2_2A_IMAGE_REBUILD.md` for the image build.

Confirm both record Next.js 16.3.8 and BUILD=PASS / IMAGE_BUILD=PASS. This prep run did not rebuild.

## 7. Tests

Open `18_SKIP_INVENTORY.md` and `23_FULL_SUITE_RERUN.md`.

Confirm:

- All 12 skips are TLO-01 through TLO-12 in `__tests__/tracked-link-order.db.test.ts`.
- SKIPS_UNEXPLAINED=0.
- With the disposable database URL, the full suite is 346 passed, 0 skipped, 0 failed.
- REGRESSION_VS_334=NO.
- Without the URL, the same 12 still skip, and that skip is explained.

## 8. Postgres

Open `20_LOCAL_POSTGRES_AND_TESTS.md`.

Confirm a disposable local database, 22 migrations through `20260917160000_tracked_link_position`, DB tests 12 passed, POSTGRES_LOCAL_TEST=PASS. Confirm the password is not in the file.

## 9. Image rebuild

Open `21_RC2_2A_IMAGE_REBUILD.md`.

Confirm:

- Archive `fe2f1ffee3922e227bb1d12e5d99973560def82f`.
- Lockfile hash matches section 5.
- Two OCI manifests match: `sha256:dbcdc0b3ce9d1de98098b579e8f5eda18d5dda0a5d6121b1cd783ecbe8f19829`.
- next inside the image is 16.3.8.
- `sha256:8f44…` is named as not current.
- REGISTRY_PUSH=NO.
- The server-action value in the file is the SHA-256 fingerprint, not the raw key.

## 10. Runtime sanity

Open `22_LOCAL_RUNTIME_SANITY.md` and `19_COVERAGE_GAP_ADJUDICATION.md`.

Confirm APP_BOOT, AUTH_BOOTSTRAP, ROUTING, API_BOOTSTRAP, MIDDLEWARE, SERVER_ACTION_RUNTIME, DB, and BACKGROUND are PASS, and that Instagram OAuth was not called.

## 11. Residual upstream blocker

Open `24_LOCAL_COMPLETION_GATE.md` and the open rows in `26`.

Confirm the current residual is exactly:

- LOCAL_TEST_GAPS=0
- UNEXPLAINED_SKIPS=0
- IMAGE_REBUILD_PENDING=0
- LOCAL_RUNTIME_PENDING=0
- LOCAL_EVIDENCE_MISSING=0
- UPSTREAM_ADVISORY_PENDING=2
- PATCH_RANGE_PENDING=6
- LIVE_INSTAGRAM_OAUTH=EXTERNAL_LIVE_PROVIDER_GATE

## 12. Merge / Wave-3 stop line

Confirm the pull request is still draft and the body still says do not merge.

Required stops:

- MERGE=NO
- WAVE_3=HOLD
- META_LIVE=NO
- LIVE_PILOT=NO
- PRODUCTION=NO
- RC2_2B=HOLD_UPSTREAM_SECURITY_EVIDENCE
- FROZEN_PASS is not claimed

`LOCAL_RC2_2B_COMPLETION=PASS` does not lift those stops.

## Readiness

ARTIFACT_REVIEW_READY may become YES only after a reviewer accepts all of the following, which this prep run already records except the numbering decision:

- EVIDENCE_FILES_01_29_COMPLETE=YES. Today this is NO until 01–08 are accepted as never created, or real files with a real lineage appear. Do not invent 01–08.
- LINEAGE_CLEAR=YES
- SUPERSESSION_CLEAR=YES
- REAL_CONTRADICTIONS=0
- STALE_CURRENT_CLAIMS=0
- SECRET_LEAKS=0
- CURRENT_TRUTH_SNAPSHOT=CONSISTENT
- LOCAL_FIXABLE_BLOCKERS=0

If that human acceptance is the only remaining item, the upstream hold still stands. Next allowed step after acceptance would be `WAIT_UPSTREAM_DELTA_OR_INDEPENDENT_HUMAN_ARTIFACT_REVIEW`. This prep run does not take that step, because ARTIFACT_REVIEW_READY is NO.
