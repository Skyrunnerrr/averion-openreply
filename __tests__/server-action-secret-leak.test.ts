import { createHash, randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { scanServerActionSecret } from "../averion/deploy/scan-server-action-secret.mjs";

function syntheticKey(): string {
  return randomBytes(32).toString("base64");
}

describe("server action build secret leak scan", () => {
  it("passes when the raw key is absent from every published surface", () => {
    const secret = syntheticKey();
    const fingerprint = createHash("sha256")
      .update(Buffer.from(secret, "base64"))
      .digest("hex");
    const result = scanServerActionSecret({
      secret,
      gitFiles: [{ path: "Dockerfile", text: "RUN --mount=type=secret,id=next_server_actions_key" }],
      dockerHistory: `ARG SERVER_ACTION_KEY_FINGERPRINT=${fingerprint}`,
      imageLabels: { "org.openreply.server-action-key-fingerprint": fingerprint },
      buildLog: "secret mounted\nnext build finished",
      provenanceText: JSON.stringify({ SERVER_ACTION_KEY_FINGERPRINT_SHA256: fingerprint }),
      sbomText: '{"components":[]}',
    });

    expect(result).toEqual({
      KEY_NOT_IN_GIT: "PASS",
      KEY_NOT_IN_DOCKER_HISTORY: "PASS",
      KEY_NOT_IN_IMAGE_LABELS: "PASS",
      KEY_NOT_IN_BUILD_LOG: "PASS",
      KEY_NOT_IN_PROVENANCE: "PASS",
      KEY_NOT_IN_SBOM: "PASS",
    });
    expect(JSON.stringify(result)).not.toContain(secret);
  });

  it("fails closed when the raw key is copied into git, history, labels, logs, provenance, or the SBOM", () => {
    const secret = syntheticKey();
    const hit = scanServerActionSecret({
      secret,
      gitFiles: [{ path: "notes.md", text: `key ${secret}` }],
      dockerHistory: secret,
      imageLabels: { leak: secret },
      buildLog: `export KEY=${secret}`,
      provenanceText: secret,
      sbomText: secret,
    });

    expect(hit).toEqual({
      KEY_NOT_IN_GIT: "FAIL",
      KEY_NOT_IN_DOCKER_HISTORY: "FAIL",
      KEY_NOT_IN_IMAGE_LABELS: "FAIL",
      KEY_NOT_IN_BUILD_LOG: "FAIL",
      KEY_NOT_IN_PROVENANCE: "FAIL",
      KEY_NOT_IN_SBOM: "FAIL",
    });
    expect(JSON.stringify(hit)).not.toContain(secret);
  });
});
