#!/bin/bash
# Fail-closed bootstrap for the pinned OpenReply Buildx builder.
# Does not build a release image and does not print the Server Action key.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "CONTAINER_RUNTIME_REQUIRED=YES"
  echo "STOP_REASON=docker is not installed"
  exit 2
fi
if ! docker info >/dev/null 2>&1; then
  echo "CONTAINER_RUNTIME_REQUIRED=YES"
  echo "STOP_REASON=docker daemon is not reachable"
  exit 2
fi

eval "$(node --input-type=module -e '
import fs from "node:fs";
const pin = JSON.parse(fs.readFileSync("averion/deploy/canonical-builder.json", "utf8"));
const keys = ["BUILDX_VERSION","BUILDX_SHA256","BUILDX_URL","BUILDKIT_IMAGE_DIGEST","PLATFORM","BUILDER_NAME","LOCKFILE_SHA256","SERVER_ACTION_SECRET_ID"];
for (const key of keys) {
  if (!pin[key] || String(pin[key]).includes("\n")) process.exit(1);
  console.log(`${key}=${JSON.stringify(String(pin[key]))}`);
}
')"

SOURCE_SHA="${OPENREPLY_SOURCE_SHA:-}"
if [ -z "$SOURCE_SHA" ]; then
  SOURCE_SHA="$(git rev-parse HEAD)"
fi
DIRTY=false
if [ -n "$(git status --porcelain)" ]; then
  DIRTY=true
fi
SECRET_FILE="${NEXT_SERVER_ACTIONS_KEY_FILE:-}"
SECRET_PRESENT=false
SECRET_BYTES=0
if [ -n "$SECRET_FILE" ] && [ -f "$SECRET_FILE" ]; then
  SECRET_PRESENT=true
  SECRET_BYTES="$(wc -c < "$SECRET_FILE" | tr -d " ")"
fi

LOCK_ACTUAL="$(sha256sum package-lock.json | awk "{print \$1}")"
mkdir -p "$ROOT/averion/deploy/.cache"
BUILDX_BIN="${OPENREPLY_BUILDX_BIN:-$ROOT/averion/deploy/.cache/buildx-v0.37.1}"
if [ ! -f "$BUILDX_BIN" ] || ! echo "${BUILDX_SHA256}  ${BUILDX_BIN}" | sha256sum -c - >/dev/null 2>&1; then
  curl -fsSL "$BUILDX_URL" -o "$BUILDX_BIN"
  echo "${BUILDX_SHA256}  ${BUILDX_BIN}" | sha256sum -c -
  chmod 755 "$BUILDX_BIN"
fi
BUILDX_OBSERVED="$("$BUILDX_BIN" version)"
case "$BUILDX_OBSERVED" in
  *" ${BUILDX_VERSION} "*|*" ${BUILDX_VERSION}") ;;
  *)
    echo "UNEXPECTED_BUILDX_VERSION"
    exit 1
    ;;
esac

node --input-type=module - "$SOURCE_SHA" "$DIRTY" "$LOCK_ACTUAL" "$LOCKFILE_SHA256" "$SECRET_PRESENT" "$SECRET_BYTES" "$BUILDX_VERSION" "$BUILDKIT_IMAGE_DIGEST" "$PLATFORM" <<'NODE'
import { validateReleaseInputs } from "./averion/deploy/release-inputs.mjs";
const [sourceSha, dirty, lockfileSha256, expectedLockfileSha256, present, bytes, buildxVersion, buildkitImageDigest, platform] = process.argv.slice(2);
const result = validateReleaseInputs({
  sourceSha,
  worktreeDirty: dirty === "true",
  lockfileSha256,
  expectedLockfileSha256,
  serverActionSecretPresent: present === "true",
  serverActionSecretBytes: Number(bytes),
  buildxVersion,
  expectedBuildxVersion: buildxVersion,
  buildkitImageDigest,
  expectedBuildkitImageDigest: buildkitImageDigest,
  platform,
  expectedPlatform: platform,
});
if (!result.ok) {
  console.error(result.errors.join(" "));
  process.exit(1);
}
NODE

if [ ! -f "$SECRET_FILE" ]; then
  echo "MISSING_SERVER_ACTION_BUILD_SECRET"
  exit 1
fi

"$BUILDX_BIN" rm "$BUILDER_NAME" >/dev/null 2>&1 || true
"$BUILDX_BIN" create \
  --name "$BUILDER_NAME" \
  --driver docker-container \
  --platform "$PLATFORM" \
  --driver-opt "image=docker.io/moby/buildkit@${BUILDKIT_IMAGE_DIGEST}" \
  --bootstrap >/dev/null

INSPECT="$("$BUILDX_BIN" inspect "$BUILDER_NAME")"
printf '%s\n' "$INSPECT" | grep -q "$BUILDKIT_IMAGE_DIGEST" || {
  echo "UNEXPECTED_BUILDKIT"
  exit 1
}
printf '%s\n' "$INSPECT" | grep -q "linux/amd64" || {
  echo "UNEXPECTED_PLATFORM"
  exit 1
}

echo "BUILDER_BOOT=PASS"
echo "BUILDKIT_PIN=PASS"
echo "PLATFORM=${PLATFORM}"
echo "BUILDX_VERSION=${BUILDX_VERSION}"
echo "BUILDKIT_IMAGE_DIGEST=${BUILDKIT_IMAGE_DIGEST}"
