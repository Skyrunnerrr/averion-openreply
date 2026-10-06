# 21 RC2.2A IMAGE REBUILD

The image was built from a `git archive` of `fe2f1ffee3922e227bb1d12e5d99973560def82f`. That tree already pins `next` and `eslint-config-next` to `16.3.8`. The archive lockfile sha256 is `09d2d49964db488a3ca1f543a6919707131a336dce63c62084a8e2654873f6a7`, matching `averion/deploy/canonical-builder.json`.

The stale RC2.2A image `sha256:8f44fe4f707ff86993d93ad222bafdaf3a314fbf704e33cfd64a433042f24b23` (next 16.2.6, lockfile `df7f69b3…`) was not loaded and is not current evidence.

No registry push. The image was loaded only into the local Docker daemon.

## Builder

| Field | Value |
| --- | --- |
| Builder | `averion-openreply-canonical` |
| Buildx | v0.37.1, sha256 `9447199cdb435f25880548343c128a4b6650e8891ee598905d8d29d39a8e359b` |
| BuildKit | `docker.io/moby/buildkit@sha256:a461e7f0ce921972028acfbed628d45663d83e67ac1230722c2b34cf72760a0d` |
| Platform | `linux/amd64` |
| Dockerfile | `averion/deploy/Dockerfile` from the `fe2f1ff` archive |
| SOURCE_SHA | `fe2f1ffee3922e227bb1d12e5d99973560def82f` |
| SOURCE_DATE_EPOCH | `1790583091` |
| Server Action key | BuildKit secret `next_server_actions_key`, 32 decoded bytes, release-local, not printed |
| SERVER_ACTION_KEY_FINGERPRINT_SHA256 | `1fe668428b3f09043260d15c47177cc1b7526156b21e124a1f9828894b309321` |

`bootstrap-canonical-builder.sh` printed `BUILDER_BOOT=PASS` and `BUILDKIT_PIN=PASS`.

## Hosts file

The first build on this builder failed at Dockerfile line 46: pinned BuildKit mounts `/etc/hosts` read-only, so the append to that file exited 2. No image was produced.

A later build passed `--add-host api.github.com:0.0.0.0`. The same Dockerfile line then saw the name already present and did not write `/etc/hosts`. The Dockerfile bytes were not changed. A temporary commit that replaced the line with `RUN --add-host` was reverted; `git rev-parse fe2f1ff^{tree}` equals the tree of that revert. The image archive is `fe2f1ff`, not the revert commit.

## Determinism

Two `--no-cache` builds without `rewrite-timestamp` produced different OCI manifest digests. Layer file contents matched. Member mtimes differed by the wall-clock gap between the builds.

The current pair used the same inputs plus OCI output `rewrite-timestamp=true` (source date `1790583091`):

| Build | OCI manifest | Config |
| --- | --- | --- |
| 1 | `sha256:dbcdc0b3ce9d1de98098b579e8f5eda18d5dda0a5d6121b1cd783ecbe8f19829` | `sha256:984779bda77a133dc84b2b6c1053266166eee81fd23757059795f0ec7996b5e7` |
| 2 | `sha256:dbcdc0b3ce9d1de98098b579e8f5eda18d5dda0a5d6121b1cd783ecbe8f19829` | `sha256:984779bda77a133dc84b2b6c1053266166eee81fd23757059795f0ec7996b5e7` |

BUILD_1_DIGEST=BUILD_2_DIGEST
IMAGE_BUILD=PASS
RC2_2A_IMAGE_REBUILT=YES
RC2_2A_IMAGE_CURRENT=YES

Both build logs contain `Next.js 16.3.8 (Turbopack)`. The exported layer `app/node_modules/next/package.json` has `"version": "16.3.8"`.

Local image `openreply-rc22a:fe2f1ff` id is `sha256:dbcdc0b3ce9d1de98098b579e8f5eda18d5dda0a5d6121b1cd783ecbe8f19829`. Labels: `org.opencontainers.image.revision=fe2f1ffee3922e227bb1d12e5d99973560def82f`, `org.openreply.lockfile.sha256=09d2d49964db488a3ca1f543a6919707131a336dce63c62084a8e2654873f6a7`.

`docker run --entrypoint node … -e process.stdout.write(require("next/package.json").version)` printed `16.3.8`.
`docker run --entrypoint cat … .next/BUILD_ID` printed `fe2f1ffee3922e227bb1d12e5d99973560def82f`.
`/etc/openreply/wget-version` is `1.21.3-1+deb12u1`.

IMAGE_NEXT_VERSION=16.3.8
REGISTRY_PUSH=NO
