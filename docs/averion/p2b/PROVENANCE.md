# Image provenance

`APP_IMAGE_UNCHANGED=NO` for this deployment head. `lib/automation/attach-next-reel.ts` now returns before any Instagram client call when automations are disabled. That file is copied into the runner image. The digest below was built from `727d364cbc7ac6fb9ce1825c3c43599a0e1a7b10` and is not a digest of this head. No replacement build was recorded in this closure.

| Field | Value |
| --- | --- |
| SOURCE_SHA of the recorded image | `727d364cbc7ac6fb9ce1825c3c43599a0e1a7b10` |
| Parent | `075020817b18cf65b548d474e0ce86b8b7b7dbb8` (empty diff) |
| UPSTREAM_PIN | `5760181c4bb9683241357cbbcd8ca635d19f835a` |
| LOCKFILE_SHA256 | `df7f69b394d4fd22a076448b86a6ef0a489d240259661fd07105e76ade389416` |
| Build context | `git archive` of SOURCE_SHA, not the worktree |
| Dockerfile | `averion/deploy/Dockerfile` |
| Base image | `docker.io/library/node@sha256:3d0f05455dea2c82e2f76e7e2543964c30f6b7d673fc1a83286736d44fe4c41c` (`node:20-slim` linux/amd64 at resolution time) |
| SOURCE_DATE_EPOCH | `1790583091` (commit time `2026-09-28T08:11:31Z`) |
| BUILD_TIMESTAMP | recorded in `averion/artifacts/image-provenance.json` as the wall clock of the build |
| IMAGE_DIGEST | OCI manifest `sha256:4ba1cb451075e593880ca1f760c913134537a64e26ad0e2bd5c28d1929ffe677` |
| Config digest | `sha256:6703eab9533313c827f22ff7f6d6df84df6599f8884b82ffb50906e2a14d737a` |
| Local podman digest | `sha256:ef12e3bc70f64fa27b254a61859d20ee11584224dfd13da0a3fd395a08a32791` |

The build runs `sha256sum -c` on `package-lock.json` before `npm ci`. The log line is `package-lock.json: OK`.

`IMAGE_DIGEST` is the sha256 of the OCI image manifest written by `podman push` to a local OCI layout. It was checked by hashing that blob. The image was not pushed to a registry.

Podman's containers-storage digest differs from the OCI manifest digest. The OCI manifest digest is the one recorded as `IMAGE_DIGEST`.

SBOM: `averion/artifacts/sbom.cdx.json` (CycloneDX, `npm sbom`, 568 components, sha256 `d93a43badf97ad17af4d32bfe19732033d49c08721bf816033ad9e28d625f412`).

License manifest: `averion/artifacts/license-manifest.json`. Project license is MIT (`LICENSE`). One transitive package, `seq-queue@0.0.5`, has no license field in its package metadata. The manifest records it as `UNKNOWN`.

Postgres and Redis references are the linux/amd64 manifest digests in `averion/deploy/base-image-pins.json`. The mutable tags `postgres:16`, `redis:7-alpine`, and `node:20-slim` are not used by the provider compose file or the deploy Dockerfile.

Two `--no-cache` builds from a clean `git archive` of `727d364cbc7ac6fb9ce1825c3c43599a0e1a7b10`, with `SOURCE_DATE_EPOCH=1790583091` and the same build args, both produced OCI manifest `sha256:4ba1cb451075e593880ca1f760c913134537a64e26ad0e2bd5c28d1929ffe677`. The blob hash matches that digest. `.next/BUILD_ID` inside that image is that source SHA. Those two builds are reproducible for that SHA only. `OPENREPLY_IMAGE_REPRODUCIBLE=NO` for this deployment head until two builds of the head that contains the kill-switch change match.

The image build pins `generateBuildId` to SOURCE_SHA, sets `NEXT_TELEMETRY_DISABLED=1`, sets `experimental.cpus` to 1, and sets `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` to `base64(sha256("averion-openreply-p2b-" + SOURCE_SHA))`. That key is a public determinism constant, not an operator secret. Preview-mode keys in `prerender-manifest.json` are rewritten from the same SHA. `api.github.com` is pointed at `0.0.0.0` only during `next build`. Apt logs and the ldconfig aux-cache are deleted after `wget` is installed. `.next/cache`, `.next/trace`, `.next/trace-build`, and `.next/diagnostics` are omitted.

An earlier pair of builds, before those pins, produced `sha256:07e3d86d164a5afe0548e1cc34a60f01632c20009162a03992b17bb58a01243d` and `sha256:fee2cbf2a4160dffbb469de9b15417bec7bf7e4adab2f5c55e62e4cbbd03329b`. Those digests are not the release image.
