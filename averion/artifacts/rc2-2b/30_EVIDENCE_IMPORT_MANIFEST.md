# 30 EVIDENCE IMPORT MANIFEST

IMPORT_RUN=AVERION_SOCIAL_OPENREPLY_RC2_2B_EVIDENCE_IMPORT_01
SOURCE_LOCATION=prompt attachments under `/home/ubuntu/.cursor/projects/workspace/uploads/`. The prompt states those bytes were copied from `/workspace/averion-openreply-rc2-2b-closure/`. That directory is not present in this workspace. No other source was used.
IMPORT_TARGET=averion/artifacts/rc2-2b/
IMPORT_COMMIT=526c7eda6bf3d027600c3cbf7fdb654854e6db70
FILES_IMPORTED=8
CONTENT_MODIFIED=NO
SECRET_SCAN=PASS
HISTORICAL_EVIDENCE=YES

The upload names carry a transport suffix. Repository names are the original artifact names from the source hash list. File bytes were copied with `cp` and were not rewritten.

| NUMBER | ORIGINAL_FILENAME | SOURCE_FILENAME | REPOSITORY_FILENAME | SIZE | SOURCE_SHA256 | REPOSITORY_SHA256 | BYTE_IDENTICAL | CONTENT_CLASS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | `01_BASELINE.md` | `01_BASELINE_7dcd.md` | `01_BASELINE.md` | 3369 | `7257e844fec8b2c6172be3bf158cf3557236c64e17cc8f2b37eb9f25c1e6559c` | `7257e844fec8b2c6172be3bf158cf3557236c64e17cc8f2b37eb9f25c1e6559c` | YES | Baseline snapshot at `93a793ae`, next `^16.2.6` / lockfile 16.2.6 |
| 02 | `02_ADVISORY_MATRIX.md` | `02_ADVISORY_MATRIX_d4fc.md` | `02_ADVISORY_MATRIX.md` | 9919 | `3f2978028de6aeedd7062a4ee1c2da999c261d9b377016a9c4dcea3aaadcfbd7` | `3f2978028de6aeedd7062a4ee1c2da999c261d9b377016a9c4dcea3aaadcfbd7` | YES | 9/9 matrix plus out-of-matrix advisories, target next 16.2.6 |
| 03 | `03_DEPENDENCY_RESOLUTION.md` | `03_DEPENDENCY_RESOLUTION_e41c.md` | `03_DEPENDENCY_RESOLUTION.md` | 2968 | `5c12fb1dbc18bb8896b4d71171e2e59dc73b47a5471b5eba1ede509f4fe4357e` | `5c12fb1dbc18bb8896b4d71171e2e59dc73b47a5471b5eba1ede509f4fe4357e` | YES | Lockfile resolution at `93a793ae`. Installed graph not verified in that run |
| 04 | `04_PATCH_RANGE_VERIFICATION.md` | `04_PATCH_RANGE_VERIFICATION_6c19.md` | `04_PATCH_RANGE_VERIFICATION.md` | 3108 | `60f7f922d32c7be030725d83f0a53550ffc156edf34cbb7d0950cfab7f3693c1` | `60f7f922d32c7be030725d83f0a53550ffc156edf34cbb7d0950cfab7f3693c1` | YES | Placeholder patch-range check. Recommends 16.3.8, not executed there |
| 05 | `05_SECURITY_AUDIT_RAW_OR_NORMALIZED.txt` | `05_SECURITY_AUDIT_RAW_OR_NORMALIZED_40d4.txt` | `05_SECURITY_AUDIT_RAW_OR_NORMALIZED.txt` | 4782 | `e41647d1cdba445ed3241cdb968bbd1bb7471b34b58a9a84c53f987a33746710` | `e41647d1cdba445ed3241cdb968bbd1bb7471b34b58a9a84c53f987a33746710` | YES | Normalized `npm audit --package-lock-only` of the 16.2.6 lockfile |
| 06 | `06_BUILD_AND_TEST_EVIDENCE.md` | `06_BUILD_AND_TEST_EVIDENCE_7600.md` | `06_BUILD_AND_TEST_EVIDENCE.md` | 403 | `1248762bc33e6a1c5e67d0a3094513dd75593cfa69efc46f75624883db0f1963` | `1248762bc33e6a1c5e67d0a3094513dd75593cfa69efc46f75624883db0f1963` | YES | Build and tests not run |
| 07 | `07_CHANGESET.md` | `07_CHANGESET_e441.md` | `07_CHANGESET.md` | 505 | `18f5b875d5a9d8fd398f10b13bc496689a681c66529c2d10afa7e10428e912e9` | `18f5b875d5a9d8fd398f10b13bc496689a681c66529c2d10afa7e10428e912e9` | YES | No repository change in that run |
| 08 | `08_RC2_2B_EXIT_GATE.md` | `08_RC2_2B_EXIT_GATE_030a.md` | `08_RC2_2B_EXIT_GATE.md` | 2245 | `0c9df70ecc2b0821463d54e725837348ed8ec9726a4277e352701bae316813ef` | `0c9df70ecc2b0821463d54e725837348ed8ec9726a4277e352701bae316813ef` | YES | Exit gate at the pre-pin head. RC2_2B=HOLD. Not FROZEN_PASS |

Upload mtime on every source file was 2026-10-06T14:33:54Z. That is the attachment copy time, not a timestamp from inside the files.

Post-commit check: `git show 526c7eda6bf3d027600c3cbf7fdb654854e6db70:<path>` sha256 equals SOURCE_SHA256 for all eight. IMPORT_INTEGRITY=PASS.

Files 09–29 were not modified in `526c7ed`.
