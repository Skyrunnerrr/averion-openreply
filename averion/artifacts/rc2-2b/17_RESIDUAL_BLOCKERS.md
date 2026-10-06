# 17 RESIDUAL BLOCKERS

FROZEN_PASS is not claimed.

| Class | Count | Items |
|---|---|---|
| A CONFIRMED_VULNERABILITY | 0 | No published `next` advisory still contains 16.3.8 in a final vulnerable range. The prior 7 stay closed by precondition, not by pretending the placeholder ranges are final. Auth criticals were triaged to NOT_AFFECTED or NOT_REACHABLE. |
| B PATCH_AVAILABLE_NOT_APPLIED | 0 | The authorized next pin is applied. Auth was not classified AFFECTED_PATCH_AVAILABLE, so beta.32 was not left as an unapplied fix for an affected finding. npm's suggested downgrades (eslint-config-next 14.2.35, nodemailer 10, prisma 6.19.3) are not safe forward patches on this line. |
| C UPSTREAM_ADVISORY_PENDING | 2 | PENDING-CRITICAL-1 and PENDING-HIGH-1. No GHSA, no CVE, no range. Next.js says a later release. |
| D PATCH_RANGE_PENDING | 6 | GHSA-cjq9, GHSA-4jqv, GHSA-mcj8, GHSA-f87g, GHSA-3w37, GHSA-39w2 still show `16.3.?` or `15.5.?`. GHSA-h694's patched value is the final string `16.3.8` and is not in this count. |
| E LOCAL_EVIDENCE_MISSING | 0 | Manifest, lockfile, and installed `next` were compared. The 9/9 preconditions were re-checked in this tree. |
| F TEST_COVERAGE_GAP | 9 | Skipped Postgres suite (12 tests). Live health, live webhook POST, live Server Action POST, live magic-link send, live Instagram OAuth, public-edge, worker, and cron were not completed. See `15_BUILD_TEST_AFTER.md`. |
| G EXTERNAL_INFRA_DEPENDENCY | 2 | (1) No Postgres or Redis in this run, so health and the DB suite could not run. (2) The RC2.2A image was not rebuilt. `averion/artifacts/image-provenance.json`, `rc2-image-digest-check.json`, `license-manifest.json`, `sbom.cdx.json`, and `docs/averion/p2b/PROVENANCE.md` still describe lockfile `df7f69b3…` and next 16.2.6. `canonical-builder.json` now stores the new lockfile hash so a later image build can check this lockfile. That image was not built here. |

CONFIRMED_VULNERABILITY=0
PATCH_AVAILABLE_NOT_APPLIED=0
UPSTREAM_ADVISORY_PENDING=2
PATCH_RANGE_PENDING=6
LOCAL_EVIDENCE_MISSING=0
TEST_COVERAGE_GAP=9

RC2_2B=**HOLD_UPSTREAM_SECURITY_EVIDENCE**

The remaining C and D items are the two unpublished advisories and the six placeholder patched ranges. This is not FROZEN_PASS.
