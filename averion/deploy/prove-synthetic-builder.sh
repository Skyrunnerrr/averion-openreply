#!/bin/bash
# Synthetic non-release build. The digest it prints is not canonical.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
OUT="averion/artifacts/synthetic-builder-proof.json"
mkdir -p averion/artifacts

write_stop() {
  local reason="$1"
  node --input-type=module -e '
    import fs from "node:fs";
    const reason = process.argv[1];
    fs.writeFileSync(process.argv[2], JSON.stringify({
      kind: "SYNTHETIC_CANONICAL_BUILDER_PROOF",
      CONTAINER_RUNTIME_REQUIRED: "YES",
      STOP_REASON: reason,
      SYNTHETIC_BUILDER_PROOF: "STOP",
      CANONICAL_IMAGE_ESTABLISHED: "NO",
      BUILDER_BOOT: "FAIL",
      BUILDKIT_PIN: "FAIL",
      PLATFORM: "linux/amd64",
      BUILD_SECRET_MOUNT: "FAIL",
      SECRET_LEAK_SCAN: "FAIL",
      APT_SNAPSHOT_RESOLUTION: "FAIL"
    }, null, 2) + "\n");
  ' "$reason" "$OUT"
  echo "CONTAINER_RUNTIME_REQUIRED=YES"
  echo "STOP_REASON=${reason}"
  echo "SYNTHETIC_BUILDER_PROOF=STOP"
}

if ! command -v docker >/dev/null 2>&1 || ! docker info >/dev/null 2>&1; then
  write_stop "docker daemon is not available"
  exit 2
fi

SECRET_FILE="$(mktemp)"
LOG_FILE="$(mktemp)"
cleanup() {
  local code=$?
  if [ "$code" -ne 0 ] && [ -f "$LOG_FILE" ]; then
    python3 - "$SECRET_FILE" "$LOG_FILE" /tmp/synthetic-build.log <<'PY'
import pathlib, sys
secret = pathlib.Path(sys.argv[1]).read_text(errors="replace") if pathlib.Path(sys.argv[1]).exists() else ""
text = pathlib.Path(sys.argv[2]).read_text(errors="replace")
if secret.strip():
    text = text.replace(secret.strip(), "[REDACTED]")
pathlib.Path(sys.argv[3]).write_text(text[-12000:])
PY
    echo "PROOF_FAILED=${code} redacted_log=/tmp/synthetic-build.log"
  fi
  rm -f "$SECRET_FILE" "$LOG_FILE"
  if [ -n "${HISTORY_FILE:-}" ]; then rm -f "$HISTORY_FILE"; fi
  if [ -n "${LABELS_FILE:-}" ]; then rm -f "$LABELS_FILE"; fi
}
trap cleanup EXIT
node --input-type=module -e '
  import { randomBytes } from "node:crypto";
  import fs from "node:fs";
  fs.writeFileSync(process.argv[1], randomBytes(32).toString("base64"), { mode: 0o600 });
' "$SECRET_FILE"
FINGERPRINT="$(node --input-type=module -e '
  import { createHash } from "node:crypto";
  import fs from "node:fs";
  const text = fs.readFileSync(process.argv[1], "utf8").replace(/\r?\n/g, "");
  const raw = Buffer.from(text, "base64");
  if (raw.length !== 32) process.exit(1);
  process.stdout.write(createHash("sha256").update(raw).digest("hex"));
' "$SECRET_FILE")"

export NEXT_SERVER_ACTIONS_KEY_FILE="$SECRET_FILE"
export OPENREPLY_SOURCE_SHA="$(git rev-parse HEAD)"
if ! averion/deploy/bootstrap-canonical-builder.sh >"$LOG_FILE" 2>&1; then
  if grep -q "CONTAINER_RUNTIME_REQUIRED=YES" "$LOG_FILE"; then
    write_stop "canonical builder bootstrap could not reach docker"
    exit 2
  fi
  echo "STOP_REASON=canonical builder bootstrap failed"
  exit 1
fi

BUILDER_NAME="$(node --input-type=module -e 'import fs from "node:fs"; process.stdout.write(JSON.parse(fs.readFileSync("averion/deploy/canonical-builder.json","utf8")).BUILDER_NAME)')"
DIGEST="$(node --input-type=module -e 'import fs from "node:fs"; process.stdout.write(JSON.parse(fs.readFileSync("averion/deploy/canonical-builder.json","utf8")).BUILDKIT_IMAGE_DIGEST)')"

BUILDX_BIN="$ROOT/averion/deploy/.cache/buildx-v0.37.1"
"$BUILDX_BIN" build \
  --builder "$BUILDER_NAME" \
  --platform linux/amd64 \
  --secret "id=next_server_actions_key,src=${SECRET_FILE}" \
  --build-arg "SERVER_ACTION_KEY_FINGERPRINT=${FINGERPRINT}" \
  --build-arg DEBIAN_SNAPSHOT=20260421T000000Z \
  --build-arg WGET_VERSION=1.21.3-1+deb12u1 \
  --progress=plain \
  --load \
  -t averion-openreply-synthetic:rc22a \
  -f averion/deploy/synthetic/Dockerfile \
  averion/deploy/synthetic >>"$LOG_FILE" 2>&1

FP_IN_IMAGE="$(docker run --rm averion-openreply-synthetic:rc22a cat /etc/openreply/server-action-key-fingerprint)"
WGET_IN_IMAGE="$(docker run --rm averion-openreply-synthetic:rc22a cat /etc/openreply/wget-version)"
APT_IN_IMAGE="$(docker run --rm averion-openreply-synthetic:rc22a cat /etc/openreply/apt-snapshot)"
CA_IN_IMAGE="$(docker run --rm averion-openreply-synthetic:rc22a cat /etc/openreply/ca-cert-source)"
test "$(printf '%s' "$FP_IN_IMAGE" | tr -d '\n')" = "$FINGERPRINT"
test "$(printf '%s' "$WGET_IN_IMAGE" | tr -d '\n')" = "1.21.3-1+deb12u1"
test "$(printf '%s' "$APT_IN_IMAGE" | tr -d '\n')" = "20260421T000000Z"

HISTORY_FILE="$(mktemp)"
LABELS_FILE="$(mktemp)"
docker history --no-trunc averion-openreply-synthetic:rc22a >"$HISTORY_FILE"
docker inspect --format '{{json .Config.Labels}}' averion-openreply-synthetic:rc22a >"$LABELS_FILE"
SYNTHETIC_DIGEST="$(docker inspect --format '{{.Id}}' averion-openreply-synthetic:rc22a)"
export HISTORY_FILE LABELS_FILE SYNTHETIC_DIGEST FINGERPRINT LOG_FILE OUT
export APT_IN_IMAGE WGET_IN_IMAGE CA_IN_IMAGE
export BUILDKIT_IMAGE_DIGEST="$DIGEST"

node --input-type=module <<'NODE'
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { scanServerActionSecret } from "./averion/deploy/scan-server-action-secret.mjs";

const fingerprint = process.env.FINGERPRINT;
const secret = fs.readFileSync(process.env.NEXT_SERVER_ACTIONS_KEY_FILE, "utf8").replace(/\r?\n/g, "");
const history = fs.readFileSync(process.env.HISTORY_FILE, "utf8");
const labels = JSON.parse(fs.readFileSync(process.env.LABELS_FILE, "utf8"));
const buildLog = fs.readFileSync(process.env.LOG_FILE, "utf8");
const provenance = JSON.stringify({
  SERVER_ACTION_KEY_FINGERPRINT_SHA256: fingerprint,
  canonical: false,
});
const sbom = fs.readFileSync("averion/artifacts/sbom.cdx.json", "utf8");
const listed = execFileSync("git", ["ls-files", "-z"]).toString("utf8").split("\0").filter(Boolean);
const gitFiles = [];
for (const path of listed) {
  const stat = fs.statSync(path);
  if (!stat.isFile() || stat.size > 2_000_000) continue;
  const text = fs.readFileSync(path);
  if (text.includes(0)) continue;
  gitFiles.push({ path, text: text.toString("utf8") });
}
const scan = scanServerActionSecret({
  secret,
  gitFiles,
  dockerHistory: history,
  imageLabels: labels,
  buildLog,
  provenanceText: provenance,
  sbomText: sbom,
});
const pass = Object.values(scan).every((value) => value === "PASS");
const proof = {
  kind: "SYNTHETIC_CANONICAL_BUILDER_PROOF",
  CONTAINER_RUNTIME_REQUIRED: "YES",
  SYNTHETIC_BUILDER_PROOF: pass ? "PASS" : "FAIL",
  CANONICAL_IMAGE_ESTABLISHED: "NO",
  digestRole: "synthetic-non-release",
  syntheticImageId: process.env.SYNTHETIC_DIGEST,
  BUILDER_BOOT: "PASS",
  BUILDKIT_PIN: "PASS",
  BUILDKIT_IMAGE_DIGEST: process.env.BUILDKIT_IMAGE_DIGEST,
  PLATFORM: "linux/amd64",
  BUILD_SECRET_MOUNT: "PASS",
  SECRET_LEAK_SCAN: pass ? "PASS" : "FAIL",
  leakScan: scan,
  APT_SNAPSHOT_RESOLUTION: "PASS",
  APT_SNAPSHOT: process.env.APT_IN_IMAGE.trim(),
  WGET_VERSION: process.env.WGET_IN_IMAGE.trim(),
  CA_CERT_SOURCE: process.env.CA_IN_IMAGE.trim(),
  SERVER_ACTION_KEY_FINGERPRINT_SHA256: fingerprint,
};
fs.writeFileSync(process.env.OUT, JSON.stringify(proof, null, 2) + "\n");
fs.rmSync(process.env.HISTORY_FILE, { force: true });
fs.rmSync(process.env.LABELS_FILE, { force: true });
if (!pass) process.exit(1);
NODE
