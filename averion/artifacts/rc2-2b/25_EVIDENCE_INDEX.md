# 25 EVIDENCE INDEX

RUN=AVERION_SOCIAL_OPENREPLY_RC2_2B_ARTIFACT_REVIEW_PREP_01

This index was added at review-prep time. Files 09 through 24 were not edited. Numbers 01 through 08 have no file in any commit of this repository.

EVIDENCE_AUTHORED_09_24=YES
EVIDENCE_NUMBERS_01_08=ABSENT_NEVER_CREATED
EVIDENCE_01_24_COMPLETE=NO

`10_NEXT_16_3_8_REMEDIATION.md` records the remediation evidence set as `09`–`17`, previously absent. The pull request body cites `09` through `17` and `18` through `24`. Nothing in git names a file `01_` through `08_`.

## 01–08

| NUMBER | FILE | RUN | SOURCE_HEAD | CREATED_PHASE | PURPOSE | CURRENT_OR_HISTORICAL | SUPERSEDED_BY | SECURITY_RELEVANT | RELEASE_RELEVANT | INTEGRITY_STATUS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | ABSENT | none | none | none | none | NOT_APPLICABLE | none | NO | NO | ABSENT_NEVER_CREATED |
| 02 | ABSENT | none | none | none | none | NOT_APPLICABLE | none | NO | NO | ABSENT_NEVER_CREATED |
| 03 | ABSENT | none | none | none | none | NOT_APPLICABLE | none | NO | NO | ABSENT_NEVER_CREATED |
| 04 | ABSENT | none | none | none | none | NOT_APPLICABLE | none | NO | NO | ABSENT_NEVER_CREATED |
| 05 | ABSENT | none | none | none | none | NOT_APPLICABLE | none | NO | NO | ABSENT_NEVER_CREATED |
| 06 | ABSENT | none | none | none | none | NOT_APPLICABLE | none | NO | NO | ABSENT_NEVER_CREATED |
| 07 | ABSENT | none | none | none | none | NOT_APPLICABLE | none | NO | NO | ABSENT_NEVER_CREATED |
| 08 | ABSENT | none | none | none | none | NOT_APPLICABLE | none | NO | NO | ABSENT_NEVER_CREATED |

## 09–17 remediation

Created in `fe2f1ffee3922e227bb1d12e5d99973560def82f`. Run: `AVERION_SOCIAL_OPENREPLY_RC2_2B_REMEDIATION_01`. Byte-identical at `61fc7586693e101942e58fbc7d1749cff18fbf7e`.

| NUMBER | FILE | SOURCE_HEAD | CREATED_PHASE | PURPOSE | CURRENT_OR_HISTORICAL | SUPERSEDED_BY | SECURITY_RELEVANT | RELEASE_RELEVANT | INTEGRITY_STATUS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 09 | `09_TARGET_VALIDATION.md` | `93a793aefe7c93f06b4bc2ffc464c277aad46353` measured; file added in `fe2f1ff` | Target validation before the pin | Why `next@16.3.8` is the smallest stable target, and what it does not close | HISTORICAL record of the pre-pin read. The target choice remains the basis of the pin | none | YES | YES | UNCHANGED_SINCE_fe2f1ff |
| 10 | `10_NEXT_16_3_8_REMEDIATION.md` | `fe2f1ffee3922e227bb1d12e5d99973560def82f` | Pin record | Manifest, lockfile, and the files the pin changed | CURRENT for the pin. It does not describe the later image | none | YES | YES | UNCHANGED_SINCE_fe2f1ff |
| 11 | `11_INSTALLED_GRAPH_AFTER.md` | `fe2f1ffee3922e227bb1d12e5d99973560def82f` | Installed graph | Manifest, lockfile, and installed `next` are 16.3.8 | CURRENT for the graph. `61fc758` does not change the lockfile | none | YES | YES | UNCHANGED_SINCE_fe2f1ff |
| 12 | `12_ADVISORY_MATRIX_RERUN.md` | `fe2f1ffee3922e227bb1d12e5d99973560def82f` | 9/9 matrix | Seven closed by precondition; two blocked upstream | CURRENT security judgment. No later file re-scores these rows | none | YES | YES | UNCHANGED_SINCE_fe2f1ff |
| 13 | `13_NEXT_EXTENDED_SECURITY.md` | `fe2f1ffee3922e227bb1d12e5d99973560def82f` | Extended Next advisories | Published critical/high on 16.3.8 outside the September 30 set | CURRENT security judgment | none | YES | YES | UNCHANGED_SINCE_fe2f1ff |
| 14 | `14_AUTH_SECURITY_TRIAGE.md` | `fe2f1ffee3922e227bb1d12e5d99973560def82f` | Auth triage | next-auth / @auth/core criticals and one high, not upgraded | CURRENT security judgment | none | YES | YES | UNCHANGED_SINCE_fe2f1ff |
| 15 | `15_BUILD_TEST_AFTER.md` | `fe2f1ffee3922e227bb1d12e5d99973560def82f` | Build and first test | INSTALL=PASS, BUILD=PASS, 334 passed, 12 skipped, 9 coverage gaps | HISTORICAL for test counts and gaps. INSTALL and BUILD remain the host record | Test count by `23`. Gaps by `19`. Runtime health by `22` | YES | YES | UNCHANGED_SINCE_fe2f1ff |
| 16 | `16_SECURITY_RESCAN_AFTER.md` | `fe2f1ffee3922e227bb1d12e5d99973560def82f` | npm audit after the pin | What npm still lists, and what this pin did not clear | CURRENT for that audit. This prep run did not re-run npm audit | none | YES | YES | UNCHANGED_SINCE_fe2f1ff |
| 17 | `17_RESIDUAL_BLOCKERS.md` | `fe2f1ffee3922e227bb1d12e5d99973560def82f` | Residual table at remediation | Classes A–G as of the pin commit, before local completion | HISTORICAL. Not the current end state | Local rows by `18`–`24`. Classes C and D are not superseded. Current gate is `24` | YES | YES | UNCHANGED_SINCE_fe2f1ff |

## 18–24 local completion

Created in `61fc7586693e101942e58fbc7d1749cff18fbf7e`. Run: `AVERION_SOCIAL_OPENREPLY_RC2_2B_LOCAL_COMPLETION_01`. The code tree they measure is `fe2f1ff` (same tree as `aaecf36`). The image archive named in `21` and `24` is `fe2f1ff`, not `61fc758`.

| NUMBER | FILE | SOURCE_HEAD | CREATED_PHASE | PURPOSE | CURRENT_OR_HISTORICAL | SUPERSEDED_BY | SECURITY_RELEVANT | RELEASE_RELEVANT | INTEGRITY_STATUS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 18 | `18_SKIP_INVENTORY.md` | `61fc7586693e101942e58fbc7d1749cff18fbf7e` | Skip inventory | All 12 skips named, classified, explained | CURRENT explanation of the conditional skip | none | NO | YES | INTRODUCED_AT_61fc758 |
| 19 | `19_COVERAGE_GAP_ADJUDICATION.md` | `61fc7586693e101942e58fbc7d1749cff18fbf7e` | Gap adjudication | Nine rows from `15`: eight closed locally, one live-provider block | CURRENT adjudication | none | YES | YES | INTRODUCED_AT_61fc758 |
| 20 | `20_LOCAL_POSTGRES_AND_TESTS.md` | `61fc7586693e101942e58fbc7d1749cff18fbf7e` | Local Postgres | Disposable database, 22 migrations, 12 DB tests passed | CURRENT local DB record | none | NO | YES | INTRODUCED_AT_61fc758 |
| 21 | `21_RC2_2A_IMAGE_REBUILD.md` | Image archive `fe2f1ffee3922e227bb1d12e5d99973560def82f`. File added in `61fc758` | Image rebuild | Matching local OCI digest, next 16.3.8, no registry push | CURRENT local image record. Does not replace historical `image-provenance.json` as a record of the older image | none | YES | YES | INTRODUCED_AT_61fc758 |
| 22 | `22_LOCAL_RUNTIME_SANITY.md` | Image `fe2f1ff`; file added in `61fc758` | Runtime sanity | Boot, auth, routing, API, middleware, server action, DB, worker, cron, edge, magic link | CURRENT local runtime record | none | YES | YES | INTRODUCED_AT_61fc758 |
| 23 | `23_FULL_SUITE_RERUN.md` | `61fc7586693e101942e58fbc7d1749cff18fbf7e` | Full suite | 346 passed, 0 skipped, no regression against 334 | CURRENT test count | none | NO | YES | INTRODUCED_AT_61fc758 |
| 24 | `24_LOCAL_COMPLETION_GATE.md` | `61fc7586693e101942e58fbc7d1749cff18fbf7e` | Local completion gate | Consolidated local end state. RC2.2B stays on hold | CURRENT local end state | none | YES | YES | INTRODUCED_AT_61fc758 |

## How to read the set

`17_RESIDUAL_BLOCKERS.md` is the residual table at `fe2f1ff`, before local completion. `24_LOCAL_COMPLETION_GATE.md` is the current local end state. Security rows in `12`, `13`, and `14` were not re-scored by `18`–`24`.
