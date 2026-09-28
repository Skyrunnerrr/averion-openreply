# Canonical builder

The provider image builder is Docker Buildx plus a BuildKit image pinned by digest. The platform is `linux/amd64`. Host Podman, host Docker's default BuildKit, and floating tags are not artifact identity.

| Field | Value |
| --- | --- |
| BUILDX_VERSION | `v0.37.1` |
| BUILDKIT_IMAGE | `docker.io/moby/buildkit:v0.33.0` |
| BUILDKIT_IMAGE_DIGEST | `sha256:a461e7f0ce921972028acfbed628d45663d83e67ac1230722c2b34cf72760a0d` (linux/amd64 manifest) |
| PLATFORM | `linux/amd64` |
| DOCKERFILE_FRONTEND | `docker.io/docker/dockerfile:1.27.0@sha256:bde3983e9c939224420ddaf6b784cc30e09b035a4dea01f581230c50809f372e` |

Pins live in `averion/deploy/canonical-builder.json`. `averion/deploy/bootstrap-canonical-builder.sh` downloads that Buildx binary, checks its checksum, creates the named builder from the BuildKit digest, and rejects a dirty worktree, a missing source SHA, a lockfile mismatch, a missing Server Action build secret, or an unexpected builder version.

The permitted reproducibility claim is `REPRODUCIBLE_WITH_PINNED_CANONICAL_BUILDER`. It is not `BIT_REPRODUCIBLE_ACROSS_ARBITRARY_BUILDERS`.

The Server Action key is supplied as BuildKit secret `next_server_actions_key` (base64 of 32 random bytes, release-scoped). The bootstrap and the Dockerfile publish only `SERVER_ACTION_KEY_FINGERPRINT_SHA256`, which is the SHA-256 of those decoded bytes. The retired Model A fingerprint `sha256:099094aeb1df02f2a24222bf38b878b7166c50aa979cfbea09a3e09db680957c` is historical and must not be reused.

OS inputs use Debian snapshot `20260421T000000Z` (`bookworm` main), the same snapshot date as the pinned `node:20-slim` base. `wget` is `1.21.3-1+deb12u1`. The CA bundle is the one already in that base image. The deploy Dockerfile does not install `ca-certificates`.
