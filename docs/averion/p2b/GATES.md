# P2B gate record

`MERGE_PROVIDER_PRS=NO`. This draft is not merged.

`READY_FOR_HUMAN_MERGE_AUTH=NO` until the public edge is shown proxying to OpenReply and the dossier below is still honest about egress.

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
| IMAGE_DIGEST | previous OCI digest remains the build of `727d364cbc7ac6fb9ce1825c3c43599a0e1a7b10` | `averion/artifacts/image-provenance.json` |
| SBOM | unchanged lockfile | `averion/artifacts/sbom.cdx.json` |
| LICENSE_MANIFEST | PASS | `averion/artifacts/license-manifest.json` (`seq-queue@0.0.5` is UNKNOWN) |
| SECRET_INJECTION | PASS | `averion/deploy/verify-secret-injection.mjs` |
| READINESS_FAIL_CLOSED | PASS | `averion/artifacts/readiness-result.json` |
| WRITE_BYPASS_RED_TEAM | PASS | `averion/artifacts/red-team-result.json` |
| HIDDEN_AUTOMATION_EGRESS | PASS at the function | `__tests__/attach-next-reel-kill-switch.test.ts` |

The application source now returns from `attachPendingNextReels` before any Meta client call when automations are disabled. That changes image contents relative to `727d364cbc7ac6fb9ce1825c3c43599a0e1a7b10`. The digest above is not a digest of this head until a new pair of builds is recorded.

`LIVE_INFRA` for the network probe is the local Compose project, not a staging cluster and not Meta.
