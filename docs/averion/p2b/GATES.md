# P2B gate record

`MERGE_PROVIDER_PRS=NO`. This draft is not merged.

`READY_FOR_HUMAN_MERGE_AUTH=YES` for this provenance record when native CI on the commit that introduces it is PASS. The public edge proxy proof, the clean stack retarget, and the reproducible digest of `ea2b1c6e0a88eaeb0fa3daefaf0b0f869bb7566c` are already recorded. Egress enforcement stays unimplemented (ADR B), so the Meta and live-infra gates below stay NO.

`READY_FOR_META_HUMAN_CLOSURE=NO`

`READY_FOR_LIVE_INFRA=NO`

`READY_FOR_LIVE_PILOT=NO`

`READY_FOR_PRODUCTION=NO`

`READY_FOR_AVERION_PROVIDER_ADAPTER=NO`

| Gate | Result | Evidence |
| --- | --- | --- |
| INGRESS_MATRIX | PASS | `averion/artifacts/ingress-coverage.json` |
| PUBLIC_EDGE_PROXY | PASS | `averion/artifacts/public-edge-result.json` (`pass: true`) |
| EGRESS_INVENTORY | PASS | `averion/deploy/egress-map.json` |
| EGRESS_ENFORCEMENT | NOT_IMPLEMENTED | `docs/averion/p2b/EGRESS_ADR.md` choice B |
| IMAGE_DIGEST | OCI manifest `sha256:8f44fe4f707ff86993d93ad222bafdaf3a314fbf704e33cfd64a433042f24b23` of `ea2b1c6e0a88eaeb0fa3daefaf0b0f869bb7566c`; `BUILD_1_DIGEST` equals `BUILD_2_DIGEST` | `averion/artifacts/image-provenance.json` |
| SBOM | lockfile unchanged; component SBOM rechecked | `averion/artifacts/sbom.cdx.json` |
| LICENSE_MANIFEST | PASS | `averion/artifacts/license-manifest.json` (`seq-queue@0.0.5` is UNKNOWN) |
| SECRET_INJECTION | PASS | `averion/deploy/verify-secret-injection.mjs` |
| READINESS_FAIL_CLOSED | PASS | `averion/artifacts/readiness-result.json` |
| WRITE_BYPASS_RED_TEAM | PASS | `averion/artifacts/red-team-result.json` |
| HIDDEN_AUTOMATION_EGRESS | PASS at the function | `__tests__/attach-next-reel-kill-switch.test.ts` |

`OPENREPLY_IMAGE_REPRODUCIBLE=YES` for `ea2b1c6e0a88eaeb0fa3daefaf0b0f869bb7566c`. The runner image includes the `attachPendingNextReels` guard. The previous OCI digest `sha256:4ba1cb451075e593880ca1f760c913134537a64e26ad0e2bd5c28d1929ffe677` belongs to `727d364cbc7ac6fb9ce1825c3c43599a0e1a7b10` only.

`EGRESS_ENFORCEMENT=NOT_IMPLEMENTED`. Compose does not filter outbound hostnames. ADR choice B stands.

`LIVE_INFRA` for the network probe is the local Compose project, not a staging cluster and not Meta.
