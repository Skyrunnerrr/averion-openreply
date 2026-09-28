# P2B gate record

`LIVE_INFRA=SIMULATED`. Compose was not started. No registry push. No Meta calls.

| Gate | Result | Evidence |
| --- | --- | --- |
| INGRESS_MATRIX | PASS | `averion/artifacts/ingress-coverage.json` |
| EGRESS_MAP | PASS | `averion/deploy/egress-map.json` (enforcement unavailable) |
| IMAGE_DIGEST | PASS | `sha256:07e3d86d164a5afe0548e1cc34a60f01632c20009162a03992b17bb58a01243d` |
| SBOM | PASS | `averion/artifacts/sbom.cdx.json` |
| LICENSE_MANIFEST | PASS | `averion/artifacts/license-manifest.json` (`seq-queue@0.0.5` is UNKNOWN) |
| SECRET_INJECTION | PASS | `averion/deploy/verify-secret-injection.mjs` |
| READINESS_FAIL_CLOSED | PASS | `averion/artifacts/readiness-result.json` |
| WRITE_BYPASS_RED_TEAM | PASS | `averion/artifacts/red-team-result.json` |
| PROVIDER_IMAGES_REPRODUCIBLE | FAIL | second app-image digest `sha256:fee2cbf2a4160dffbb469de9b15417bec7bf7e4adab2f5c55e62e4cbbd03329b` |

`MERGE_PROVIDER_PRS=NO`. `READY_FOR_HUMAN_MERGE_AUTH=NO` because the app image is not bit-reproducible.
