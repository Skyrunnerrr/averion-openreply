import crypto from "node:crypto";
import fs from "node:fs";

const sourceSha = process.env.SOURCE_SHA;
if (!sourceSha) {
  console.error("SOURCE_SHA is required");
  process.exit(1);
}

function hex(label, bytes) {
  return crypto
    .createHash("sha256")
    .update(`${sourceSha}:${label}`)
    .digest("hex")
    .slice(0, bytes * 2);
}

for (const rel of [
  ".next/cache",
  ".next/trace",
  ".next/diagnostics",
  ".next/trace-build",
]) {
  fs.rmSync(rel, { recursive: true, force: true });
}

const manifestPath = ".next/prerender-manifest.json";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.preview = {
  previewModeId: hex("preview-id", 16),
  previewModeSigningKey: hex("preview-sign", 32),
  previewModeEncryptionKey: hex("preview-enc", 32),
};
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest)}\n`);

const buildId = fs.readFileSync(".next/BUILD_ID", "utf8").trim();
if (buildId !== sourceSha) {
  console.error(`BUILD_ID ${buildId} does not match SOURCE_SHA`);
  process.exit(1);
}

console.log("normalized next build output");
