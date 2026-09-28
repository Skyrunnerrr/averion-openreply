# Image provenance

`OPENREPLY_IMAGE_REPRODUCIBLE=YES` for source `ea2b1c6e0a88eaeb0fa3daefaf0b0f869bb7566c`.

`APP_IMAGE_UNCHANGED=NO` relative to the previous image of `727d364cbc7ac6fb9ce1825c3c43599a0e1a7b10`. `lib/automation/attach-next-reel.ts` returns before any Instagram client call when automations are disabled. The runner image contains that file at `/app/lib/automation/attach-next-reel.ts` (guard on lines 2 and 33). `.next/BUILD_ID` and `org.opencontainers.image.revision` are the source SHA below.

| Field | Value |
| --- | --- |
| SOURCE_SHA of the recorded image | `ea2b1c6e0a88eaeb0fa3daefaf0b0f869bb7566c` |
| Parent of that SHA | `435dc820a981091a660dad3ab38860d6e044e5e8` |
| UPSTREAM_PIN | `5760181c4bb9683241357cbbcd8ca635d19f835a` |
| LOCKFILE_SHA256 | `df7f69b394d4fd22a076448b86a6ef0a489d240259661fd07105e76ade389416` |
| Build context | `git archive` of SOURCE_SHA, not the worktree |
| Dockerfile | `averion/deploy/Dockerfile` |
| Base image | `docker.io/library/node@sha256:3d0f05455dea2c82e2f76e7e2543964c30f6b7d673fc1a83286736d44fe4c41c` (`node:20-slim` linux/amd64 at resolution time) |
| SOURCE_DATE_EPOCH | `1790583091` (`2026-09-28T08:11:31Z`) |
| BUILD_TIMESTAMP | wall clock in `averion/artifacts/image-provenance.json` |
| IMAGE_DIGEST | OCI manifest `sha256:8f44fe4f707ff86993d93ad222bafdaf3a314fbf704e33cfd64a433042f24b23` |
| Config digest | `sha256:833ffa4b7b0420fa3fa10078215c55f5d3bd7105be7fb0f256ddfa4c8aa18cc2` |
| Local podman digest | `sha256:c9ea26c3d21dbeddfb4df90b14f4332e2ba314bee8efe7193f0f1afada6980d5` |

`SOURCE_DATE_EPOCH` is the Dockerfile default used by the previous reproducible method. It was passed to `podman --timestamp` and to the `SOURCE_DATE_EPOCH` build arg. The commit time of `ea2b1c6e0a88eaeb0fa3daefaf0b0f869bb7566c` is `2026-09-28T12:52:53Z`.

The build runs `sha256sum -c` on `package-lock.json` before `npm ci`. Both build logs contain `package-lock.json: OK`.

`IMAGE_DIGEST` is the sha256 of the OCI image manifest written by `podman push` to a local OCI layout. The blob hash matches that digest. The image was not pushed to a registry.

Podman's containers-storage digest differs from the OCI manifest digest. The OCI manifest digest is the one recorded as `IMAGE_DIGEST`.

SBOM: `averion/artifacts/sbom.cdx.json` (CycloneDX, `npm sbom`, 568 components, sha256 `d93a43badf97ad17af4d32bfe19732033d49c08721bf816033ad9e28d625f412`). The lockfile bytes are unchanged, so this component SBOM was rechecked and left in place. It lists npm components. It does not list image filesystem paths.

License manifest: `averion/artifacts/license-manifest.json`. Project license is MIT (`LICENSE`). One transitive package, `seq-queue@0.0.5`, has no license field in its package metadata. The manifest records it as `UNKNOWN`.

Postgres and Redis references are the linux/amd64 manifest digests in `averion/deploy/base-image-pins.json`. The mutable tags `postgres:16`, `redis:7-alpine`, and `node:20-slim` are not used by the provider compose file or the deploy Dockerfile.

Two `--no-cache` builds from a clean `git archive` of `ea2b1c6e0a88eaeb0fa3daefaf0b0f869bb7566c`, with `SOURCE_DATE_EPOCH=1790583091` and the same build args, both produced OCI manifest `sha256:8f44fe4f707ff86993d93ad222bafdaf3a314fbf704e33cfd64a433042f24b23`. `BUILD_1_DIGEST` equals `BUILD_2_DIGEST`. `OPENREPLY_IMAGE_REPRODUCIBLE=YES` for that source SHA.

The runner image does not contain `docs/` or `averion/deploy/prove-public-edge.mjs`. A later commit that only records this digest does not change the runner layers of this image. `compose.provider.yml` still takes the app image from `OPENREPLY_IMAGE_REF` and does not hardcode this digest.

The previous image of `727d364cbc7ac6fb9ce1825c3c43599a0e1a7b10` is OCI manifest `sha256:4ba1cb451075e593880ca1f760c913134537a64e26ad0e2bd5c28d1929ffe677` (config `sha256:6703eab9533313c827f22ff7f6d6df84df6599f8884b82ffb50906e2a14d737a`). That digest is historical.

The image build pins `generateBuildId` to SOURCE_SHA, sets `NEXT_TELEMETRY_DISABLED=1`, and sets `experimental.cpus` to 1. `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` stays the committed literal `bBlyVERylKvU8K2Pp8RHTM4GfW6Celhb5B8uyLaeRuA=`. That literal equals `base64(sha256("averion-openreply-p2b-" + 727d364cbc7ac6fb9ce1825c3c43599a0e1a7b10))`. Both builds of this source SHA used that literal. It is a public determinism constant, not an operator secret. Preview-mode keys in `prerender-manifest.json` are rewritten from SOURCE_SHA. `api.github.com` is pointed at `0.0.0.0` only during `next build`. Apt logs and the ldconfig aux-cache are deleted after `wget` is installed. `.next/cache`, `.next/trace`, `.next/trace-build`, and `.next/diagnostics` are omitted.

An earlier pair of builds, before those pins, produced `sha256:07e3d86d164a5afe0548e1cc34a60f01632c20009162a03992b17bb58a01243d` and `sha256:fee2cbf2a4160dffbb469de9b15417bec7bf7e4adab2f5c55e62e4cbbd03329b`. Those digests are not the release image.
