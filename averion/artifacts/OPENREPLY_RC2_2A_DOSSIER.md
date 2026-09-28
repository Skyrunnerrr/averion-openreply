# OPENREPLY RC2.2A dossier

RC2.2A is the runtime and build-definition remediation. It does not freeze a release image.

| Field | Value |
| --- | --- |
| BASE_SHA | `c0e026f9b65d0dfd731de47deff4b85e2897d669` |
| SERVER_ACTION_KEY_MODEL | `MODEL_B` |
| SERVER_ACTION_KEY_FINGERPRINT | `sha256:d7498138b2a723df96061e1b0f9ae4fff5299741e085b94df8b77683ec7e279b` |
| SERVER_ACTION_SECRET_DELIVERY | `BUILDKIT_SECRET` |
| SERVER_ACTION_SECRET_LEAK_SCAN | `PASS` |
| BUILDX_VERSION | `v0.37.1` |
| BUILDKIT_IMAGE_DIGEST | `sha256:a461e7f0ce921972028acfbed628d45663d83e67ac1230722c2b34cf72760a0d` |
| CANONICAL_PLATFORM | `linux/amd64` |
| APT_SOURCE | `http://snapshot.debian.org/archive/debian/20260421T000000Z bookworm main` |
| WGET_VERSION | `1.21.3-1+deb12u1` |
| CA_CERT_SOURCE | `ca-certificates=20230311+deb12u1` from that snapshot |
| APT_INPUT_PINNED | `YES` |
| PROVENANCE_SCHEMA | `PASS` |
| BUILD_DEFINITION_SHA | `6bfff79d4cf4e739bb0795f98a3ab29fbfb2d859` |
| DEPLOYMENT_BUNDLE_SHA | `4182d05fed700f2a6d24470d026fd1b4ec95199a` (the dossier commit; the commit that records this id is only a stamp) |
| NEXT_CURRENT_INSTALLED | `16.2.6` |
| NEXT_FINAL_TARGET | `HOLD` |
| NEXT_REGRESSION_MATRIX | `READY` |
| SYNTHETIC_BUILDER_PROOF | `PASS` |
| RC2_2A | `PASS` |
| RC2_2B | `HOLD` |
| CANONICAL_IMAGE_ESTABLISHED | `NO` |
| MERGE | `NO` |
| COMPOSE_PROOF | `NO` |
| META_LIVE | `NO` |
| AVERION_ADAPTER | `NO` |

`SERVER_ACTION_KEY_FINGERPRINT` is the SHA-256 of the decoded 32-byte synthetic key used for the non-release proof. It is not a release key. The raw key is not in git, the Dockerfile, image labels, the build log, provenance, or the SBOM (`averion/artifacts/synthetic-builder-proof.json`).

The retired Model A fingerprint is `sha256:099094aeb1df02f2a24222bf38b878b7166c50aa979cfbea09a3e09db680957c`, derived from `HARDENING_BASE_SHA`. Do not reuse it.

`NEXT_FINAL_TARGET` stays on hold. `16.3.6` is the published interim reference on 2026-09-28. RC2.2B re-checks the official baseline on or after 2026-09-30 and pins the exact version then. Expect `16.3.7` if that scheduled release is what was published. `16.3.7` was not installed. `package.json` and `package-lock.json` were not bumped.

The synthetic image id `sha256:03fde56e8b2b8e5f8fb05b717daac2a9fe4eab079ec64c5293cd540bb581ea3b` is infrastructure proof only. It is not a canonical release digest. Historical digests `8f44…`, `34b5…`, and `3ceb…` are not canonical.

The permitted reproducibility claim is `REPRODUCIBLE_WITH_PINNED_CANONICAL_BUILDER`.

The pinned node base has `debian-archive-keyring` and no `/etc/ssl/certs/ca-certificates.crt`. Apt therefore uses the snapshot over HTTP, checks the signed Release file, and installs the pinned `ca-certificates` package. It does not run `apt-get upgrade`.

Five authorities, not collapsed into `SOURCE_SHA`:

| Authority | SHA |
| --- | --- |
| UPSTREAM_PIN | `5760181c4bb9683241357cbbcd8ca635d19f835a` |
| HARDENING_BASE_SHA | `727d364cbc7ac6fb9ce1825c3c43599a0e1a7b10` |
| APP_RUNTIME_SOURCE_SHA | `ea2b1c6e0a88eaeb0fa3daefaf0b0f869bb7566c` |
| BUILD_DEFINITION_SHA | `6bfff79d4cf4e739bb0795f98a3ab29fbfb2d859` |
| DEPLOYMENT_BUNDLE_SHA | `4182d05fed700f2a6d24470d026fd1b4ec95199a` (the dossier commit; the commit that records this id is only a stamp) |

RC2.2B remains the hold sequence in `averion/artifacts/OPENREPLY_RC2_2B_RUNBOOK.md`.
