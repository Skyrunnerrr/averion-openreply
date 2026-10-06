# 28 CURRENT TRUTH SNAPSHOT

RUN=AVERION_SOCIAL_OPENREPLY_RC2_2B_ARTIFACT_REVIEW_PREP_01

Consolidation only. No advisory was re-scored. No dependency was changed. Values are the current statements in `24`, backed by `11`–`16` and `18`–`23`. This prep run rechecked the git HEAD, the manifest pin, the lockfile hash, and the installed `next` version string.

LOCAL_COMPLETION_HEAD=61fc7586693e101942e58fbc7d1749cff18fbf7e
CURRENT_HEAD=61fc7586693e101942e58fbc7d1749cff18fbf7e
NEXT=16.3.8
INSTALL=PASS
LOCKFILE=09d2d49964db488a3ca1f543a6919707131a336dce63c62084a8e2654873f6a7
INSTALLED_GRAPH=YES
BUILD=PASS
TESTS=346_PASS_0_SKIP
POSTGRES=PASS
IMAGE=sha256:dbcdc0b3ce9d1de98098b579e8f5eda18d5dda0a5d6121b1cd783ecbe8f19829
RUNTIME_SANITY=PASS
CONFIRMED_VULNERABILITY=0
PATCH_AVAILABLE_NOT_APPLIED=0
LOCAL_EVIDENCE_MISSING=0
LOCAL_FIXABLE_BLOCKERS=0
UPSTREAM_ADVISORY_PENDING=2
PATCH_RANGE_PENDING=6
LIVE_PROVIDER_GATES=LIVE_INSTAGRAM_OAUTH=EXTERNAL_LIVE_PROVIDER_GATE
LOCAL_RC2_2B_COMPLETION=PASS
RC2_2B=HOLD_UPSTREAM_SECURITY_EVIDENCE

## What each field cites

| Field | Value | Authority |
| --- | --- | --- |
| LOCAL_COMPLETION_HEAD | `61fc7586693e101942e58fbc7d1749cff18fbf7e` | Commit that introduced `18`–`24`. Code, lockfile, image, and tests are this tree plus evidence only. |
| CURRENT_HEAD | `61fc7586693e101942e58fbc7d1749cff18fbf7e` | The RC2.2B stand this snapshot consolidates. The review-index commit that adds `25`–`29` is a child of this SHA and does not change the stand. |
| NEXT | 16.3.8 exact | `package.json`. Same pin at `fe2f1ff` and `61fc758`. Installed `node_modules/next` version string 16.3.8. Image copy recorded in `21`. |
| INSTALL | PASS | `15` and `11`. Not re-run in this prep. |
| LOCKFILE | `09d2d49964db488a3ca1f543a6919707131a336dce63c62084a8e2654873f6a7` | `sha256sum package-lock.json` during this prep. Matches `11`, `canonical-builder.json`, and `averion/artifacts/lockfile.sha256`. |
| INSTALLED_GRAPH | YES | `11`. Version string rechecked. No second `next` was sought again in this prep. |
| BUILD | PASS | Host `npm run build` in `15`. Image build log in `21` also printed Next.js 16.3.8. Not re-run in this prep. |
| TESTS | 346_PASS_0_SKIP | `23` and `24`. The 12 skips remain conditional on an absent `TEST_DATABASE_URL` (`18`). |
| POSTGRES | PASS | `20`. Disposable local cluster only. |
| IMAGE | `sha256:dbcdc0b3ce9d1de98098b579e8f5eda18d5dda0a5d6121b1cd783ecbe8f19829` | `21`. Source archive `fe2f1ffee3922e227bb1d12e5d99973560def82f`. Config `sha256:984779bda77a133dc84b2b6c1053266166eee81fd23757059795f0ec7996b5e7`. Two rewrite-timestamp builds matched. `REGISTRY_PUSH=NO`. |
| RUNTIME_SANITY | PASS | `22` `LOCAL_RUNTIME_SANITY=PASS` and `IMAGE_RUNTIME=PASS`. |
| CONFIRMED_VULNERABILITY | 0 | `17` class A and `24`. |
| PATCH_AVAILABLE_NOT_APPLIED | 0 | `17` class B. |
| LOCAL_EVIDENCE_MISSING | 0 | `24`. |
| LOCAL_FIXABLE_BLOCKERS | 0 | `24`. |
| UPSTREAM_ADVISORY_PENDING | 2 | `12` rows 8 and 9, `17` class C, `24`. No GHSA, CVE, or range was added. |
| PATCH_RANGE_PENDING | 6 | `17` class D, `24`. GHSA-h694 is not in the six. |
| LIVE_PROVIDER_GATES | Instagram OAuth external | `19` gap 6. No OAuth request was sent. |
| LOCAL_RC2_2B_COMPLETION | PASS | `24`. |
| RC2_2B | HOLD_UPSTREAM_SECURITY_EVIDENCE | `24`. This is not FROZEN_PASS. |

## Not current

| Item | Status |
| --- | --- |
| `17_RESIDUAL_BLOCKERS.md` classes F and G | Historical. See `26`. |
| `image-provenance.json` digest `sha256:8f44…` | Historical image. Not the local RC2.2B image. |
| Evidence numbers 01–08 | Never created. |
| Image built from `2e1f7b1` | Not used. Tree was reverted. |

CURRENT_TRUTH_SNAPSHOT=CONSISTENT

Consistency means the fields above agree with `24` and with the hashes rechecked here. It does not mean the numbered set 01–24 is complete. That completeness flag stays NO in `25`.
