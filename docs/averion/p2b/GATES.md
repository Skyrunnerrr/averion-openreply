# P2B gate record

`LIVE_INFRA=SIMULATED`. Compose was not started. No registry push. No Meta calls.

| Gate | Result | Evidence |
| --- | --- | --- |
| INGRESS_MATRIX | PASS | `averion/artifacts/ingress-coverage.json` |
| EGRESS_MAP | PASS | `averion/deploy/egress-map.json` (enforcement unavailable) |
| IMAGE_DIGEST | PASS | `sha256:4ba1cb451075e593880ca1f760c913134537a64e26ad0e2bd5c28d1929ffe677` |
| SBOM | PASS | `averion/artifacts/sbom.cdx.json` |
| LICENSE_MANIFEST | PASS | `averion/artifacts/license-manifest.json` (`seq-queue@0.0.5` is UNKNOWN) |
| SECRET_INJECTION | PASS | `averion/deploy/verify-secret-injection.mjs` |
| READINESS_FAIL_CLOSED | PASS | `averion/artifacts/readiness-result.json` |
| WRITE_BYPASS_RED_TEAM | PASS | `averion/artifacts/red-team-result.json` |
| PROVIDER_IMAGES_REPRODUCIBLE | PASS | two `--no-cache` OCI digests, both `sha256:4ba1cb451075e593880ca1f760c913134537a64e26ad0e2bd5c28d1929ffe677` |

`MERGE_PROVIDER_PRS=NO`. `READY_FOR_HUMAN_MERGE_AUTH=YES`. Live infra is still simulated, and this draft is not merged.
