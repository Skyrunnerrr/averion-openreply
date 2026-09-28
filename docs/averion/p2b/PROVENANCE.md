# Image provenance

| Field | Value |
| --- | --- |
| SOURCE_SHA | `727d364cbc7ac6fb9ce1825c3c43599a0e1a7b10` |
| Parent | `075020817b18cf65b548d474e0ce86b8b7b7dbb8` (empty diff) |
| UPSTREAM_PIN | `5760181c4bb9683241357cbbcd8ca635d19f835a` |
| LOCKFILE_SHA256 | `df7f69b394d4fd22a076448b86a6ef0a489d240259661fd07105e76ade389416` |
| Build context | `git archive` of SOURCE_SHA, not the worktree |
| Dockerfile | `averion/deploy/Dockerfile` |
| Base image | `docker.io/library/node@sha256:3d0f05455dea2c82e2f76e7e2543964c30f6b7d673fc1a83286736d44fe4c41c` (`node:20-slim` linux/amd64 at resolution time) |
| SOURCE_DATE_EPOCH | `1790583091` (commit time `2026-09-28T08:11:31Z`) |
| BUILD_TIMESTAMP | recorded in `averion/artifacts/image-provenance.json` as the wall clock of the build |
| IMAGE_DIGEST | OCI manifest `sha256:07e3d86d164a5afe0548e1cc34a60f01632c20009162a03992b17bb58a01243d` |
| Config digest | `sha256:908ac1b39fdd9ee58e453029a4ec169ab66ec0a20dd174474e14c138bb7ae175` |
| Local podman digest | `sha256:f597d5f092353acbe48c8444afa3af0f8e8e9ae532b2ecb72af2f628d2e0ad82` |

The build runs `sha256sum -c` on `package-lock.json` before `npm ci`. The log line is `package-lock.json: OK`.

`IMAGE_DIGEST` is the sha256 of the OCI image manifest written by `podman push` to a local OCI layout. It was checked by hashing that blob. The image was not pushed to a registry.

Podman's containers-storage digest differs from the OCI manifest digest. The OCI manifest digest is the one recorded as `IMAGE_DIGEST`.

SBOM: `averion/artifacts/sbom.cdx.json` (CycloneDX, `npm sbom`, 568 components, sha256 `d93a43badf97ad17af4d32bfe19732033d49c08721bf816033ad9e28d625f412`).

License manifest: `averion/artifacts/license-manifest.json`. Project license is MIT (`LICENSE`). One transitive package, `seq-queue@0.0.5`, has no license field in its package metadata. The manifest records it as `UNKNOWN`.

Postgres and Redis references are the linux/amd64 manifest digests in `averion/deploy/base-image-pins.json`. The mutable tags `postgres:16`, `redis:7-alpine`, and `node:20-slim` are not used by the provider compose file or the deploy Dockerfile.

A second `--no-cache` build from the same archive and the same `SOURCE_DATE_EPOCH` produced OCI manifest `sha256:fee2cbf2a4160dffbb469de9b15417bec7bf7e4adab2f5c55e62e4cbbd03329b`. It does not match the first digest. The `node_modules` layer matched. The apt layer differed in `var/log/apt/history.log`, `var/log/apt/term.log`, `var/log/dpkg.log`, and `var/cache/ldconfig/aux-cache`. The `.next` layer differed in `BUILD_ID` and chunk hashes. `PROVIDER_IMAGES_REPRODUCIBLE=FAIL` for the app image. The pinned Postgres, Redis, and Node base digests did re-fetch to the same digest.
